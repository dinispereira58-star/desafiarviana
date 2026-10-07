-- Avisos do site: garante que os visitantes (anon) conseguem ler os avisos
-- ligados. Sem esta regra (ou sem a permissão de leitura), o site recebe uma
-- lista vazia e não mostra nenhum popup, mesmo com avisos ligados no CRM.
GRANT SELECT ON public.site_popups TO anon, authenticated;
ALTER TABLE public.site_popups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_active_popups" ON public.site_popups;
CREATE POLICY "anon_read_active_popups" ON public.site_popups
  FOR SELECT TO anon USING (is_active = true);
DROP POLICY IF EXISTS "authenticated_full_access_popups" ON public.site_popups;
CREATE POLICY "authenticated_full_access_popups" ON public.site_popups
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
GRANT INSERT, UPDATE, DELETE ON public.site_popups TO authenticated;

-- Resultado: os avisos que existem e se estão ligados.
SELECT name AS aviso, kind AS tipo, position AS posicao, is_active AS ligado, updated_at AS alterado
  FROM public.site_popups ORDER BY display_order, created_at;
