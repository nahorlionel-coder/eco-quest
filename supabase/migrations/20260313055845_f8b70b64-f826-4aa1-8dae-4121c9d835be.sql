
CREATE TABLE public.rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  points_cost integer NOT NULL DEFAULT 0,
  image text NOT NULL DEFAULT '🎁',
  category text NOT NULL DEFAULT 'Merchandise',
  available boolean NOT NULL DEFAULT true,
  is_sponsored boolean NOT NULL DEFAULT false,
  sponsor_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rewards are viewable by everyone" ON public.rewards
  FOR SELECT TO public USING (true);
