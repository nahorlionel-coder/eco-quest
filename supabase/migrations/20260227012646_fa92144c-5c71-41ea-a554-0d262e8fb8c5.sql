
-- Table for department challenge events (head-to-head battles)
CREATE TABLE public.department_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  team_a text NOT NULL,
  team_b text NOT NULL,
  target_points integer NOT NULL DEFAULT 1000,
  team_a_points integer NOT NULL DEFAULT 0,
  team_b_points integer NOT NULL DEFAULT 0,
  start_date timestamp with time zone NOT NULL DEFAULT now(),
  end_date timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'active',
  reward_description text,
  icon text NOT NULL DEFAULT '⚔️',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.department_challenges ENABLE ROW LEVEL SECURITY;

-- Everyone can view challenges
CREATE POLICY "Challenges are viewable by everyone"
  ON public.department_challenges FOR SELECT
  TO authenticated
  USING (true);

-- Table for tracking individual contributions to department challenges
CREATE TABLE public.department_challenge_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES public.department_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  department text NOT NULL,
  points_contributed integer NOT NULL DEFAULT 0,
  contributed_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.department_challenge_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contributions are viewable by everyone"
  ON public.department_challenge_contributions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own contributions"
  ON public.department_challenge_contributions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to update team points when contribution is added
CREATE OR REPLACE FUNCTION public.update_challenge_team_points()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.department_challenges
  SET team_a_points = team_a_points + NEW.points_contributed
  WHERE id = NEW.challenge_id AND team_a = NEW.department;

  UPDATE public.department_challenges
  SET team_b_points = team_b_points + NEW.points_contributed
  WHERE id = NEW.challenge_id AND team_b = NEW.department;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_challenge_contribution
  AFTER INSERT ON public.department_challenge_contributions
  FOR EACH ROW EXECUTE FUNCTION public.update_challenge_team_points();
