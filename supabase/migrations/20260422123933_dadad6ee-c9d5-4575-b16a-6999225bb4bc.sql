-- Add security question fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS security_question text,
  ADD COLUMN IF NOT EXISTS security_answer_hash text;

-- Update handle_new_user to also store security question/answer from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, security_question, security_answer_hash)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'security_question',
    NEW.raw_user_meta_data->>'security_answer_hash'
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$function$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Public RPC: get the security question for an email (does not leak whether user exists definitively beyond returning null)
CREATE OR REPLACE FUNCTION public.get_security_question(_email text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT security_question FROM public.profiles WHERE lower(email) = lower(_email) LIMIT 1;
$$;

-- Public RPC: verify the security answer hash for an email; returns the user_id if it matches
CREATE OR REPLACE FUNCTION public.verify_security_answer(_email text, _answer_hash text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT user_id FROM public.profiles
  WHERE lower(email) = lower(_email)
    AND security_answer_hash IS NOT NULL
    AND security_answer_hash = _answer_hash
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_security_question(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_security_answer(text, text) TO anon, authenticated;