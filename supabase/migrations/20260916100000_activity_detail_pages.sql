-- Conteúdo para a página dedicada de cada atividade no site público:
-- descrição mais longa, regras de segurança, galeria de fotos e uma nota
-- de preço livre (para casos como "Preço sob consulta" ou "+5€/criança"
-- que não cabem nos campos estruturados da calculadora).
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS long_description text;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS safety_rules jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS gallery jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS price_note text;
