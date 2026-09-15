-- Conteúdo do site público (animacao-turistica-site), editável a partir
-- daqui — mesmo padrão do "SiteAdmin" usado no CRM da imobiliária: o site
-- não tem qualquer edição própria, lê só estes dados como público.

CREATE TABLE IF NOT EXISTS public.activities (
  id text PRIMARY KEY,
  name text NOT NULL,
  tagline text,
  emoji text,
  description text,
  color text,
  calculator_type text NOT NULL DEFAULT 'people' CHECK (calculator_type IN ('people','paintball','rental')),
  min_people integer,
  price_per_person numeric,
  ball_packages jsonb,
  items jsonb,
  is_active boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value text
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- O site público só pode LER atividades ativas e as definições — nunca escrever.
CREATE POLICY "public_read_active_activities" ON public.activities
  FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "public_read_site_settings" ON public.site_settings
  FOR SELECT TO anon USING (true);

-- Só a conta do CRM gere tudo.
CREATE POLICY "authenticated_full_access_activities" ON public.activities
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access_site_settings" ON public.site_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Semente inicial — mesmos dados que já estavam fixos no código do site.
INSERT INTO public.activities (id, name, tagline, emoji, description, color, calculator_type, min_people, ball_packages, position) VALUES
('paintball', 'Paintball', 'Adrenalina em equipa, ao ar livre', '🎯', 'Sessões de paintball para grupos de amigos, empresas ou despedidas de solteiro, com equipamento completo e monitores certificados.', 'from-orange-500 to-red-600', 'paintball', 6,
  '[{"id":"100","label":"100 bolas","pricePerPerson":10},{"id":"150","label":"150 bolas","pricePerPerson":14},{"id":"200","label":"200 bolas","pricePerPerson":18}]'::jsonb, 1),
('paintball-kids', 'Paintball Kids', 'Diversão segura para os mais novos', '🧒', 'Versão adaptada do paintball para crianças, com bolas de baixo impacto e supervisão constante.', 'from-amber-400 to-orange-500', 'paintball', 6,
  '[{"id":"50","label":"50 bolas","pricePerPerson":7},{"id":"100","label":"100 bolas","pricePerPerson":10}]'::jsonb, 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.activities (id, name, tagline, emoji, description, color, calculator_type, min_people, price_per_person, position) VALUES
('festas', 'Festas de Aniversário', 'O teu dia especial, à tua medida', '🎉', 'Pacotes completos de festa com insufláveis, animação e jogos para crianças e adultos.', 'from-pink-500 to-purple-600', 'people', 8, 12, 3),
('bubble-soccer', 'Bubble Soccer', 'Futebol dentro de uma bolha gigante', '⚽', 'Jogo de futebol dentro de bolas insufláveis gigantes — risota garantida para todas as idades.', 'from-green-500 to-emerald-600', 'people', 6, 14, 5),
('atl', 'ATL / Atividades Extracurriculares', 'Animação para escolas e colónias', '🏕️', 'Programas de atividades para ATL, escolas e colónias de férias, adaptados à idade dos participantes.', 'from-teal-400 to-cyan-600', 'people', 10, 8, 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.activities (id, name, tagline, emoji, description, color, calculator_type, items, position) VALUES
('insuflaveis', 'Aluguer de Insufláveis', 'Castelos, escorregas, camas elásticas e mais', '🏰', 'Aluguer de insufláveis e camas elásticas para eventos privados ou institucionais, com entrega e montagem incluída. Escolhe um ou vários itens.', 'from-sky-400 to-blue-600', 'rental',
  '[{"id":"castelo","name":"Castelo Insuflável Clássico","emoji":"🏰","price":70},{"id":"escorrega","name":"Escorrega Insuflável Gigante","emoji":"🛝","price":90},{"id":"touro","name":"Touro Mecânico","emoji":"🐂","price":120},{"id":"piscina-bolas","name":"Piscina de Bolas","emoji":"🔵","price":60},{"id":"camas-elasticas","name":"Camas Elásticas","emoji":"🤸","price":50}]'::jsonb, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.site_settings (key, value) VALUES
  ('contact_phone', '926 150 134 / 967 543 491'),
  ('contact_phone_link', '926150134'),
  ('contact_email', 'desafiarviana@hotmail.com'),
  ('whatsapp_number', '351926150134')
ON CONFLICT (key) DO NOTHING;
