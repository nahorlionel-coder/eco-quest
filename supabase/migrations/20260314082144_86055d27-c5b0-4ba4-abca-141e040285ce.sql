
-- Add status and ai_verification columns to mission_completions
ALTER TABLE public.mission_completions 
  ADD COLUMN status text NOT NULL DEFAULT 'pending',
  ADD COLUMN ai_result text,
  ADD COLUMN ai_confidence numeric,
  ADD COLUMN reviewed_by uuid,
  ADD COLUMN reviewed_at timestamptz;

-- Drop existing trigger that auto-adds points
DROP TRIGGER IF EXISTS on_mission_completed ON public.mission_completions;

-- Recreate trigger function to only add points when status = 'approved'
CREATE OR REPLACE FUNCTION public.add_mission_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only add points when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD IS NULL OR OLD.status != 'approved') THEN
    UPDATE public.profiles
    SET points = points + NEW.points_earned
    WHERE user_id = NEW.user_id;
  END IF;
  -- Subtract points if changed from 'approved' to 'rejected'
  IF OLD IS NOT NULL AND OLD.status = 'approved' AND NEW.status = 'rejected' THEN
    UPDATE public.profiles
    SET points = points - OLD.points_earned
    WHERE user_id = OLD.user_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger on INSERT (for non-photo missions that auto-approve)
CREATE TRIGGER on_mission_completed
  AFTER INSERT ON public.mission_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.add_mission_points();

-- Create trigger on UPDATE (for photo verification approve/reject)
CREATE TRIGGER on_mission_status_changed
  AFTER UPDATE OF status ON public.mission_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.add_mission_points();

-- Allow admins to update mission_completions (for manual verification)
CREATE POLICY "Admins can update completions"
  ON public.mission_completions
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all completions (for verification dashboard)
CREATE POLICY "Admins can view all completions"
  ON public.mission_completions
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
