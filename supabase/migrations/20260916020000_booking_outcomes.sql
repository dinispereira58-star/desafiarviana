-- Hora da reserva (além da data), resultado final da atividade (realizada/
-- cancelada/adiada), ganho registado, participantes reais, e dados extra
-- específicos por atividade (ex: paintball — packs/recargas/sacos/caixas
-- vendidos na sessão) guardados livremente em JSON.
ALTER TABLE public.booking_requests ADD COLUMN IF NOT EXISTS preferred_time text;
ALTER TABLE public.booking_requests ADD COLUMN IF NOT EXISTS actual_participants integer;
ALTER TABLE public.booking_requests ADD COLUMN IF NOT EXISTS revenue numeric;
ALTER TABLE public.booking_requests ADD COLUMN IF NOT EXISTS extra_data jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.booking_requests DROP CONSTRAINT IF EXISTS booking_requests_status_check;
ALTER TABLE public.booking_requests ADD CONSTRAINT booking_requests_status_check
  CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'declined'::text, 'completed'::text, 'cancelled'::text, 'postponed'::text]));
