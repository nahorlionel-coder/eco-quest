
-- Create missions table (master data)
CREATE TABLE public.missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🎯',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Missions are viewable by everyone"
  ON public.missions FOR SELECT USING (true);

-- Create mission completions table
CREATE TABLE public.mission_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mission_id UUID NOT NULL REFERENCES public.missions(id),
  photo_url TEXT,
  qr_code TEXT,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  points_earned INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, mission_id, completion_date)
);

ALTER TABLE public.mission_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own completions"
  ON public.mission_completions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions"
  ON public.mission_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to add points to profile after mission completion
CREATE OR REPLACE FUNCTION public.add_mission_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET points = points + NEW.points_earned
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_mission_completed
  AFTER INSERT ON public.mission_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.add_mission_points();

-- Create storage bucket for mission photos
INSERT INTO storage.buckets (id, name, public) VALUES ('mission-photos', 'mission-photos', true);

CREATE POLICY "Users can upload mission photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'mission-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Mission photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'mission-photos');

-- Seed mission data
INSERT INTO public.missions (title, description, points, category, type, icon) VALUES
  ('Energy Saver', 'Matikan monitor saat istirahat makan siang', 10, 'energy', 'check-in', '💡'),
  ('Zero Waste Hero', 'Upload foto makan siang tanpa plastik sekali pakai', 50, 'waste', 'photo', '♻️'),
  ('Green Commute', 'Scan QR di area parkir sepeda atau lobi MRT', 50, 'commute', 'qr', '🚲'),
  ('Meatless Monday', 'Pilih menu vegetarian di kantin hari ini', 30, 'food', 'photo', '🥗'),
  ('Tumbler Time', 'Isi ulang tumbler di dispenser (scan QR)', 20, 'waste', 'qr', '🥤'),
  ('Stair Climber', 'Naik tangga minimal 3 lantai (scan QR di tangga)', 25, 'energy', 'qr', '🏃');
