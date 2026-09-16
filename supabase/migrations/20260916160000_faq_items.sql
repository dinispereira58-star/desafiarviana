-- Perguntas frequentes mostradas na página /faq do site público.
CREATE TABLE IF NOT EXISTS public.faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_active_faq" ON public.faq_items
  FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "authenticated_full_access_faq" ON public.faq_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Perguntas iniciais, para a página não ficar vazia — editáveis/elimináveis no CRM.
INSERT INTO public.faq_items (question, answer, position) VALUES
  ('Preciso de reservar com antecedência?', 'Sim, recomendamos reservar com pelo menos alguns dias de antecedência, especialmente em fins de semana e época alta, para garantirmos disponibilidade de monitores e equipamento.', 0),
  ('O que está incluído no preço?', 'Depende da atividade — o equipamento de proteção está sempre incluído (fato, luvas, máscara no caso do paintball, ou equipamento próprio nas restantes atividades). Consulta os detalhes de cada atividade na respetiva página ou usa o simulador de preços.', 1),
  ('Qual a idade mínima para participar?', 'Temos atividades adaptadas a diferentes idades — o Paintball Kids, por exemplo, foi pensado para os mais novos com bolas de baixo impacto. Contacta-nos se tiveres dúvidas sobre a atividade certa para a tua idade ou grupo.', 2),
  ('O que acontece se estiver mau tempo?', 'A maioria das atividades decorre ao ar livre. Em caso de condições meteorológicas adversas, entramos em contacto para remarcar a atividade sem custos adicionais.', 3),
  ('Como posso pagar?', 'Aceitamos pagamento em numerário ou transferência bancária no local ou antes da atividade. Contacta-nos por WhatsApp ou telefone para combinar os detalhes.', 4),
  ('Posso cancelar ou remarcar a minha reserva?', 'Sim, pedimos apenas que nos avises com a maior antecedência possível para podermos reorganizar a agenda e disponibilizar a vaga a outro grupo.', 5)
ON CONFLICT DO NOTHING;
