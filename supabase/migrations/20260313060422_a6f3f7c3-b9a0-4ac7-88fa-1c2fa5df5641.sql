
-- Drop old permissive policies on missions
DROP POLICY IF EXISTS "Authenticated can insert missions" ON public.missions;
DROP POLICY IF EXISTS "Authenticated can update missions" ON public.missions;
DROP POLICY IF EXISTS "Authenticated can delete missions" ON public.missions;

-- Replace with admin-only policies
CREATE POLICY "Admins can insert missions" ON public.missions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update missions" ON public.missions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete missions" ON public.missions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Drop old permissive policies on department_challenges
DROP POLICY IF EXISTS "Authenticated can insert challenges" ON public.department_challenges;
DROP POLICY IF EXISTS "Authenticated can update challenges" ON public.department_challenges;
DROP POLICY IF EXISTS "Authenticated can delete challenges" ON public.department_challenges;

-- Replace with admin-only policies
CREATE POLICY "Admins can insert challenges" ON public.department_challenges FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update challenges" ON public.department_challenges FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete challenges" ON public.department_challenges FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Drop old permissive policies on rewards
DROP POLICY IF EXISTS "Authenticated can insert rewards" ON public.rewards;
DROP POLICY IF EXISTS "Authenticated can update rewards" ON public.rewards;
DROP POLICY IF EXISTS "Authenticated can delete rewards" ON public.rewards;

-- Replace with admin-only policies
CREATE POLICY "Admins can insert rewards" ON public.rewards FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update rewards" ON public.rewards FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete rewards" ON public.rewards FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update profiles (for editing user points)
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
