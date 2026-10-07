-- Desconto por atividade: percentagem (0 a 90) e texto opcional (ex.: "Promoção
-- de Outono"). O site mostra os preços riscados e o valor com desconto no
-- cartão, na página da atividade e no simulador de orçamento.
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS discount_pct numeric(5,2) NOT NULL DEFAULT 0;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS discount_label text;
ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activities_discount_pct_check;
ALTER TABLE public.activities ADD CONSTRAINT activities_discount_pct_check CHECK (discount_pct >= 0 AND discount_pct <= 90);
