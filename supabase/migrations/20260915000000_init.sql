-- Pedidos de marcação vindos do site público (animacao-turistica-site) —
-- geridos manualmente aqui no CRM (sem pagamento/confirmação automática).
-- Uso individual do CRM, por isso RLS simples "qualquer autenticado".

CREATE TABLE IF NOT EXISTS public.booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id text NOT NULL,
  activity_name text NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  preferred_date date,
  people_count integer,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','declined','completed')),
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON public.booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_created_at ON public.booking_requests(created_at DESC);

ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- O site público (sem login) só pode CRIAR pedidos, nunca ler/editar/apagar.
CREATE POLICY "public_can_insert_booking_requests" ON public.booking_requests
  FOR INSERT TO anon WITH CHECK (true);

-- Só a conta autenticada (a dona do CRM) pode ver e gerir os pedidos.
CREATE POLICY "authenticated_full_access_booking_requests" ON public.booking_requests
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
