-- Sistema de popups/avisos do site público: popup inicial (modal),
-- barra fixa (topo/fundo) ou caixa de canto — múltiplos podem estar
-- ativos em simultâneo, cada um com o seu conteúdo, estilo, posição,
-- animação e forma de fechar.
CREATE TABLE IF NOT EXISTS public.site_popups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Novo aviso',
  is_active boolean NOT NULL DEFAULT false,
  kind text NOT NULL DEFAULT 'modal',          -- 'modal' | 'bar' | 'corner'
  position text NOT NULL DEFAULT 'center',     -- modal: 'center'; bar: 'top'|'bottom'; corner: 'top-left'|'top-right'|'bottom-left'|'bottom-right'
  content_type text NOT NULL DEFAULT 'text',   -- 'text' | 'image' | 'both'
  title text,
  message text,
  image_url text,
  link_url text,
  link_label text,
  bg_color text NOT NULL DEFAULT '#1a1a1a',
  text_color text NOT NULL DEFAULT '#ffffff',
  accent_color text NOT NULL DEFAULT '#ff6a00',
  font_family text,
  text_size text NOT NULL DEFAULT 'md',        -- 'sm' | 'md' | 'lg'
  bar_size integer NOT NULL DEFAULT 48,        -- altura em px (kind = 'bar')
  corner_width integer NOT NULL DEFAULT 320,   -- largura em px (kind = 'corner')
  close_mode text NOT NULL DEFAULT 'both',     -- 'x' | 'timer' | 'both'
  auto_close_seconds integer,
  animation text NOT NULL DEFAULT 'fade',      -- 'fade' | 'slide-down' | 'slide-up' | 'slide-left' | 'slide-right' | 'zoom' | 'bounce'
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_popups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_active_popups" ON public.site_popups
  FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "authenticated_full_access_popups" ON public.site_popups
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
