-- Check and fix user synchronization between auth.users and public.users

-- First, let's see what's in auth.users vs public.users
SELECT 'Auth Users Count' as table_name, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 'Public Users Count', COUNT(*) FROM public.users;

-- Check for auth users without corresponding public.users records
SELECT 
  au.id as auth_id,
  au.email as auth_email,
  au.created_at as auth_created,
  pu.uuid as public_uuid,
  pu.email as public_email,
  CASE WHEN pu.uuid IS NULL THEN 'MISSING FROM PUBLIC.USERS' ELSE 'EXISTS' END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.uuid
ORDER BY au.created_at DESC;

-- Function to sync auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (uuid, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    'Borrower'  -- Default role
  )
  ON CONFLICT (uuid) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically add users to public.users when they sign up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing auth users who don't have records in public.users
INSERT INTO public.users (uuid, email, name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.email),
  'Borrower'
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.uuid
WHERE pu.uuid IS NULL
ON CONFLICT (uuid) DO NOTHING;
