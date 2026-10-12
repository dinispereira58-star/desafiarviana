-- Conjugações de equipamentos (tabela do site antigo, desafiarviana.pt/?page_id=1709):
-- cada insuflável com a cama elástica pequena ou grande, preço de meio dia e de dia inteiro.
-- Substitui as conjugações que existirem; os equipamentos ficam como estão.
-- Ids: castelo = Mini Diversão, escorrega = Diversão Colorida, touro = Mega Escorrega,
-- piscina-bolas = Pista Colorida, camas-elasticas = Cama Elástica Pequena,
-- 1791837542906 = Cama Elástica Grande.
UPDATE public.activities SET
  items = coalesce((SELECT jsonb_agg(it) FROM jsonb_array_elements(items) it WHERE it ->> 'kind' IS DISTINCT FROM 'combo'), '[]'::jsonb) || '[
    {"kind":"combo","id":"combo-mini-diversao-p","parts":["castelo","camas-elasticas"],"price_half":115,"price":220},
    {"kind":"combo","id":"combo-mini-diversao-g","parts":["castelo","1791837542906"],"price_half":130,"price":240},
    {"kind":"combo","id":"combo-diversao-colorida-p","parts":["escorrega","camas-elasticas"],"price_half":130,"price":240},
    {"kind":"combo","id":"combo-diversao-colorida-g","parts":["escorrega","1791837542906"],"price_half":150,"price":270},
    {"kind":"combo","id":"combo-mega-escorrega-p","parts":["touro","camas-elasticas"],"price_half":130,"price":240},
    {"kind":"combo","id":"combo-mega-escorrega-g","parts":["touro","1791837542906"],"price_half":150,"price":270},
    {"kind":"combo","id":"combo-pista-colorida-p","parts":["piscina-bolas","camas-elasticas"],"price_half":150,"price":280},
    {"kind":"combo","id":"combo-pista-colorida-g","parts":["piscina-bolas","1791837542906"],"price_half":160,"price":290}
  ]'::jsonb,
  updated_at = now()
WHERE id = 'insuflaveis';
