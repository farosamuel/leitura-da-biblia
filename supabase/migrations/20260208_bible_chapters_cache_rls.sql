-- Shared cache for Bible chapters to reduce external API calls.
CREATE TABLE IF NOT EXISTS public.bible_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL CHECK (chapter > 0),
  version TEXT NOT NULL,
  content TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bible_chapters_book_chapter_version_key UNIQUE (book, chapter, version)
);

ALTER TABLE public.bible_chapters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read bible chapter cache" ON public.bible_chapters;
CREATE POLICY "Authenticated users can read bible chapter cache"
ON public.bible_chapters
FOR SELECT
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can insert bible chapter cache" ON public.bible_chapters;
CREATE POLICY "Authenticated users can insert bible chapter cache"
ON public.bible_chapters
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update bible chapter cache" ON public.bible_chapters;
CREATE POLICY "Authenticated users can update bible chapter cache"
ON public.bible_chapters
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
