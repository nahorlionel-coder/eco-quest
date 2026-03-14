import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { completion_id, photo_url, mission_title, mission_description } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call AI to verify the photo
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a photo verification AI for an eco-friendly office challenge app. Your job is to verify if an uploaded photo matches the mission requirements. Respond ONLY with a JSON object with these fields:
- "match": boolean (true if photo matches the mission)
- "confidence": number 0-100 (how confident you are)
- "reason": string (brief explanation in Indonesian)

Be reasonably lenient - if the photo plausibly shows the activity described, approve it.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Verify if this photo matches the mission:\n\nMission: ${mission_title}\nDescription: ${mission_description}\n\nDoes the photo show evidence of completing this mission?`,
              },
              {
                type: "image_url",
                image_url: { url: photo_url },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "verify_photo",
              description: "Return the verification result for the photo",
              parameters: {
                type: "object",
                properties: {
                  match: { type: "boolean", description: "Whether the photo matches the mission" },
                  confidence: { type: "number", description: "Confidence level 0-100" },
                  reason: { type: "string", description: "Brief explanation in Indonesian" },
                },
                required: ["match", "confidence", "reason"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "verify_photo" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, coba lagi nanti" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credit AI habis" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI verification failed");
    }

    const aiData = await response.json();
    let result = { match: false, confidence: 0, reason: "Gagal memverifikasi" };

    try {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        result = JSON.parse(toolCall.function.arguments);
      }
    } catch {
      console.error("Failed to parse AI result");
    }

    // Update the completion record with AI result
    const newStatus = result.match && result.confidence >= 60 ? "approved" : "pending";
    const { error: updateError } = await supabase
      .from("mission_completions")
      .update({
        ai_result: result.reason,
        ai_confidence: result.confidence,
        status: newStatus,
      })
      .eq("id", completion_id);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error("Failed to update completion");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      result,
      status: newStatus,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("verify-photo error:", e);
    return new Response(JSON.stringify({ 
      error: e instanceof Error ? e.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
