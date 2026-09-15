-- Clientes adicionados manualmente (sem terem ainda feito nenhum pedido de
-- marcação) — complementa os que já apareciam agregados a partir de
-- booking_requests.
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_full_access_customers" ON public.customers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
