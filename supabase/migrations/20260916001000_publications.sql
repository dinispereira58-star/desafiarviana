-- Planeamento e métricas de publicações em redes sociais/marketing.
CREATE TABLE IF NOT EXISTS public.publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  platform text NOT NULL DEFAULT 'instagram' CHECK (platform IN ('instagram','facebook','tiktok','youtube','site','email')),
  content_type text NOT NULL DEFAULT 'imagem' CHECK (content_type IN ('imagem','video','carrossel','story','reel','artigo')),
  category text,
  objective text NOT NULL DEFAULT 'visibilidade' CHECK (objective IN ('visibilidade','leads','engagement','trafego','vendas')),
  status text NOT NULL DEFAULT 'planeado' CHECK (status IN ('planeado','publicado','pausado','cancelado')),
  notes text,
  scheduled_date date,
  published_date date,
  views integer NOT NULL DEFAULT 0,
  likes integer NOT NULL DEFAULT 0,
  comments integer NOT NULL DEFAULT 0,
  shares integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  leads_generated integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_publications_scheduled_date ON public.publications(scheduled_date);

ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_full_access_publications" ON public.publications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
