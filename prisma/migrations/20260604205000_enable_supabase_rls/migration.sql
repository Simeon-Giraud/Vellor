-- 1. Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view prompts of their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can create prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can update prompts of their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete prompts of their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can view results of their prompts" ON public.prompt_results;
DROP POLICY IF EXISTS "Users can create results for their prompts" ON public.prompt_results;
DROP POLICY IF EXISTS "Users can update results of their prompts" ON public.prompt_results;
DROP POLICY IF EXISTS "Users can delete results of their prompts" ON public.prompt_results;

-- 3. Create policies for public.users
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid()::text = "supabaseId");

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = "supabaseId")
  WITH CHECK (auth.uid()::text = "supabaseId");

-- 4. Create policies for public.user_preferences
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = user_preferences."userId"
    AND users."supabaseId" = auth.uid()::text
  ));

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = user_preferences."userId"
    AND users."supabaseId" = auth.uid()::text
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = user_preferences."userId"
    AND users."supabaseId" = auth.uid()::text
  ));

-- 5. Create policies for public.projects
CREATE POLICY "Users can view their own projects" ON public.projects
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = projects."userId"
    AND users."supabaseId" = auth.uid()::text
  ));

CREATE POLICY "Users can create their own projects" ON public.projects
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = projects."userId"
    AND users."supabaseId" = auth.uid()::text
  ));

CREATE POLICY "Users can update their own projects" ON public.projects
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = projects."userId"
    AND users."supabaseId" = auth.uid()::text
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = projects."userId"
    AND users."supabaseId" = auth.uid()::text
  ));

CREATE POLICY "Users can delete their own projects" ON public.projects
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = projects."userId"
    AND users."supabaseId" = auth.uid()::text
  ));

-- 6. Create policies for public.prompts
CREATE POLICY "Users can view prompts of their projects" ON public.prompts
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects
    JOIN public.users ON projects."userId" = users.id
    WHERE projects.id = prompts."projectId"
    AND users."supabaseId" = auth.uid()::text
  ));

CREATE POLICY "Users can create prompts for their projects" ON public.prompts
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    JOIN public.users ON projects."userId" = users.id
    WHERE projects.id = prompts."projectId"
    AND users."supabaseId" = auth.uid()::text
  ));

CREATE POLICY "Users can update prompts of their projects" ON public.prompts
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects
    JOIN public.users ON projects."userId" = users.id
    WHERE projects.id = prompts."projectId"
    AND users."supabaseId" = auth.uid()::text
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    JOIN public.users ON projects."userId" = users.id
    WHERE projects.id = prompts."projectId"
    AND users."supabaseId" = auth.uid()::text
  ));

CREATE POLICY "Users can delete prompts of their projects" ON public.prompts
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects
    JOIN public.users ON projects."userId" = users.id
    WHERE projects.id = prompts."projectId"
    AND users."supabaseId" = auth.uid()::text
  ));

-- 7. Create policies for public.prompt_results
CREATE POLICY "Users can view results of their prompts" ON public.prompt_results
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.prompts
    JOIN public.projects ON prompts."projectId" = projects.id
    JOIN public.users ON projects."userId" = users.id
    WHERE prompts.id = prompt_results."promptId"
    AND users."supabaseId" = auth.uid()::text
  ));

CREATE POLICY "Users can create results for their prompts" ON public.prompt_results
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.prompts
    JOIN public.projects ON prompts."projectId" = projects.id
    JOIN public.users ON projects."userId" = users.id
    WHERE prompts.id = prompt_results."promptId"
    AND users."supabaseId" = auth.uid()::text
  ));

CREATE POLICY "Users can update results of their prompts" ON public.prompt_results
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.prompts
    JOIN public.projects ON prompts."projectId" = projects.id
    JOIN public.users ON projects."userId" = users.id
    WHERE prompts.id = prompt_results."promptId"
    AND users."supabaseId" = auth.uid()::text
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.prompts
    JOIN public.projects ON prompts."projectId" = projects.id
    JOIN public.users ON projects."userId" = users.id
    WHERE prompts.id = prompt_results."promptId"
    AND users."supabaseId" = auth.uid()::text
  ));

CREATE POLICY "Users can delete results of their prompts" ON public.prompt_results
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.prompts
    JOIN public.projects ON prompts."projectId" = projects.id
    JOIN public.users ON projects."userId" = users.id
    WHERE prompts.id = prompt_results."promptId"
    AND users."supabaseId" = auth.uid()::text
  ));
