
-- Allow first admin setup: if no admin exists, any authenticated user can insert themselves as admin
CREATE OR REPLACE FUNCTION public.no_admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  )
$$;

CREATE POLICY "First admin can self-assign"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (
    public.no_admin_exists()
    AND auth.uid() = user_id
    AND role = 'admin'
  );
