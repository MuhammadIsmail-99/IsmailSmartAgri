-- Create forum_posts table
CREATE TABLE public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_comments table
CREATE TABLE public.forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for forum_posts
CREATE POLICY "Everyone can view forum posts"
  ON public.forum_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON public.forum_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.forum_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.forum_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS policies for forum_comments
CREATE POLICY "Everyone can view forum comments"
  ON public.forum_comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.forum_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.forum_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.forum_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp for posts
CREATE OR REPLACE FUNCTION public.update_forum_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for forum_posts
CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_forum_posts_updated_at();
