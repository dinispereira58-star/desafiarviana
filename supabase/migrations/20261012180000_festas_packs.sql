-- Tipo de preço "packs": preço fixo por festa, cada pack com o que inclui,
-- e extras (por festa ou por criança). Guardado em activities.items.
ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activities_calculator_type_check;
ALTER TABLE public.activities ADD CONSTRAINT activities_calculator_type_check
  CHECK (calculator_type IN ('people', 'paintball', 'rental', 'packs'));

-- Festas de aniversário: os 2 packs do site antigo (desafiarviana.pt/?page_id=2060), sem mínimo de crianças.
UPDATE public.activities SET
  calculator_type = 'packs',
  min_people = NULL,
  price_per_person = NULL,
  items = '[
    {"kind":"pack","id":"pack-1","name":"Pack 1","price":140,"includes":["Insuflável ou cama elástica","Jogos tradicionais","Decoração temática do espaço","3 horas de festa","Espaço não incluído"]},
    {"kind":"pack","id":"pack-2","name":"Pack 2","price":160,"includes":["Insuflável e cama elástica","Jogos tradicionais","Decoração temática do espaço","3 horas de festa","Espaço não incluído"]},
    {"kind":"extra","id":"lanche","name":"Pack de festa com lanche","price":5,"per":"crianca"},
    {"kind":"extra","id":"monitores","name":"Monitores","price":80,"per":"festa"}
  ]'::jsonb,
  price_note = 'Taxa de deslocação sob consulta. A decoração temática é propriedade da empresa — danos ou extravio têm custo adicional.',
  updated_at = now()
WHERE id = 'festas';
