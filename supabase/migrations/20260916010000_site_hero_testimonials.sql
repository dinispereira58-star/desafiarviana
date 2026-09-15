-- Conteúdo editável da secção Hero (site_settings é key/value — só é
-- preciso acrescentar as novas chaves, sem alterar o esquema).
INSERT INTO public.site_settings (key, value) VALUES
  ('hero_badge', '🌲 Viana do Castelo & arredores'),
  ('hero_title_line1', 'Adrenalina, diversão'),
  ('hero_title_line2', 'e'),
  ('hero_title_highlight', 'momentos inesquecíveis'),
  ('hero_subtitle', 'Paintball, Bubble Soccer, insufláveis e festas de aniversário. Organizamos a tua atividade de A a Z — tu só tens de aparecer.'),
  ('hero_cta_primary', 'Simular Orçamento'),
  ('hero_cta_secondary', 'Ver Atividades'),
  ('hero_stat_1', '⭐ +9 anos de experiência'),
  ('hero_stat_2', '🎯 6 atividades diferentes'),
  ('hero_stat_3', '👨‍👩‍👧‍👦 Para todas as idades'),
  ('hero_bg_image', ''),
  ('footer_text', 'Todos os direitos reservados.')
ON CONFLICT (key) DO NOTHING;

-- Fotografia real da atividade (opcional) — quando preenchida, o site
-- mostra-a em vez do emoji/gradiente nos cartões e na galeria.
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS photo_url text;

-- Testemunhos — lista editável (antes fixa em data/testimonials.js).
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  activity text,
  rating integer NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  text text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_active_testimonials" ON public.testimonials
  FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "authenticated_full_access_testimonials" ON public.testimonials
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Semente com os testemunhos que já estavam fixos no código do site
-- (data/testimonials.js).
INSERT INTO public.testimonials (name, activity, rating, text, position)
SELECT * FROM (VALUES
  ('Rui Almeida', 'Paintball', 5, 'Passámos uma tarde incrível com os amigos. Organização impecável e monitores super atenciosos.', 1),
  ('Carla Sousa', 'Festa de Aniversário', 5, 'Contratámos para o aniversário do meu filho e foi um sucesso total. Recomendo de olhos fechados.', 2),
  ('Escola Básica de Darque', 'ATL', 5, 'Atividade adaptada perfeitamente às crianças, com segurança e muita diversão à mistura.', 3)
) AS t(name, activity, rating, text, position)
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials);
