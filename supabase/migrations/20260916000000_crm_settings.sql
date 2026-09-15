-- Configurações do CRM (logótipo, cores, textos da página de login) — uma
-- única linha, tal como agency_settings no CRM da imobiliária.
CREATE TABLE IF NOT EXISTS public.crm_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  agency_name text NOT NULL DEFAULT 'Desafiar Viana',
  logo_url text,
  primary_color text NOT NULL DEFAULT '#ff6a00',
  secondary_color text NOT NULL DEFAULT '#e85d00',
  login_title text NOT NULL DEFAULT 'Desafiar Viana',
  login_subtitle text NOT NULL DEFAULT 'Gestão de Atividades & Reservas',
  login_welcome text NOT NULL DEFAULT 'Bem-vindo de volta',
  login_desc text NOT NULL DEFAULT '',
  login_btn text NOT NULL DEFAULT 'Entrar',
  login_footer text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.crm_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.crm_settings ENABLE ROW LEVEL SECURITY;

-- O login precisa de ler isto SEM sessão iniciada (é o que personaliza o
-- próprio ecrã de login) — leitura pública, escrita só autenticado.
CREATE POLICY "public_read_crm_settings" ON public.crm_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "authenticated_update_crm_settings" ON public.crm_settings
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
