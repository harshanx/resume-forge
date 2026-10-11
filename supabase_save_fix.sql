-- ResumeForge: repair saved-resume access for existing Supabase accounts
-- Run this once in Supabase Dashboard → SQL Editor.
-- It preserves all existing data and is safe to run more than once.

-- Create profile rows for accounts that already exist in Supabase Auth.
INSERT INTO public.users (id, email, name)
SELECT
    id,
    email,
    COALESCE(raw_user_meta_data ->> 'name', '')
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET
    email = EXCLUDED.email,
    name = COALESCE(NULLIF(public.users.name, ''), EXCLUDED.name);

-- Ensure accounts created from now on get their profile row automatically.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'name', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Allow authenticated users to create their own profile if a trigger is ever delayed.
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Recreate the resume policies so they are present on every environment.
DROP POLICY IF EXISTS "Users can view their own resumes" ON public.resume_versions;
DROP POLICY IF EXISTS "Users can insert their own resumes" ON public.resume_versions;
DROP POLICY IF EXISTS "Users can update their own resumes" ON public.resume_versions;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON public.resume_versions;

CREATE POLICY "Users can view their own resumes"
    ON public.resume_versions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes"
    ON public.resume_versions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
    ON public.resume_versions FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
    ON public.resume_versions FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
