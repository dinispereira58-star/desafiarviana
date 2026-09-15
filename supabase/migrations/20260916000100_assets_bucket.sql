-- Bucket de storage para o logótipo e outras imagens carregadas a partir
-- do CRM (ex: nas Configurações) — público para poder ser mostrado no
-- site e no ecrã de login sem autenticação.
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "authenticated_manage_assets_bucket" ON storage.objects;
CREATE POLICY "authenticated_manage_assets_bucket" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'assets')
  WITH CHECK (bucket_id = 'assets');
