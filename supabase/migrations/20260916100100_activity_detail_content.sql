-- Conteúdo inicial das páginas de detalhe de cada atividade — texto,
-- regras de segurança, galeria de fotos e nota de preço — recolhido a
-- partir do site antigo (desafiarviana.pt) e adaptado. Continua tudo
-- editável depois em Configurações > Atividades.

UPDATE public.activities SET
  long_description = 'O paintball é uma das atividades mais procuradas da Desafiar Viana — uma mistura de adrenalina, estratégia e trabalho de equipa, ideal para grupos de amigos, despedidas de solteiro(a) ou eventos de empresa. Combina exercício físico (corrida, agachamentos, reação rápida) com a emoção de eliminar os adversários sem ser apanhado, num dos vários cenários preparados para o efeito. É uma excelente forma de libertar stress, reforçar a cooperação em equipa e passar uma tarde diferente ao ar livre.',
  safety_rules = '["Uso obrigatório de máscara de proteção facial durante toda a atividade, mesmo fora dos momentos de jogo","Equipamento completo fornecido: marcador, fato, luvas e máscara homologada","Briefing de segurança e regras do jogo antes do início de cada sessão","Presença constante de monitores a acompanhar e supervisionar o jogo","Distância mínima de segurança para disparo obrigatória (sem tiro à queima-roupa)","Atividade coberta por seguro de acidentes pessoais"]'::jsonb,
  gallery = '["https://desafiarviana.pt/wp-content/uploads/2024/02/Paintball.jpg"]'::jsonb,
  photo_url = COALESCE(photo_url, 'https://desafiarviana.pt/wp-content/uploads/2024/02/Paintball.jpg'),
  price_note = 'Preço por pessoa, consoante o número de bolas escolhido no simulador. Grupos e eventos especiais com condições à parte — contacta-nos para orçamento.'
WHERE id = 'paintball';

UPDATE public.activities SET
  long_description = 'Versão adaptada do paintball pensada especialmente para os mais novos, com bolas de baixo impacto e um ritmo mais calmo. Ideal para festas de aniversário, ATL ou tardes em família, é uma forma segura e divertida das crianças experimentarem a emoção do paintball, sempre com supervisão próxima dos monitores.',
  safety_rules = '["Bolas de baixo impacto, próprias para crianças","Equipamento completo: marcador, fato, luvas e máscara de proteção","Supervisão constante e próxima por parte dos monitores durante toda a sessão","Distância de disparo ajustada à idade dos participantes","Atividade coberta por seguro de acidentes pessoais"]'::jsonb,
  gallery = '["https://desafiarviana.pt/wp-content/uploads/2024/03/1626633839168-scaled.jpg","https://desafiarviana.pt/wp-content/uploads/2024/03/1626633839201-scaled.jpg","https://desafiarviana.pt/wp-content/uploads/2024/03/1657996296381-scaled.jpg"]'::jsonb,
  photo_url = COALESCE(photo_url, 'https://desafiarviana.pt/wp-content/uploads/2024/02/Paintball-kids.jpg'),
  price_note = 'Opções com ou sem lanche incluído — consulta os pacotes disponíveis consoante o número de bolas.'
WHERE id = 'paintball-kids';

UPDATE public.activities SET
  long_description = 'Festas de aniversário completas, com insufláveis, camas elásticas, jogos tradicionais e decoração temática — tudo preparado para o dia ser inesquecível, sem te preocupares com nada. Personalizamos o pacote consoante o espaço, o número de convidados e o tema que preferires.',
  safety_rules = '["Montagem e supervisão do equipamento insuflável feita pela nossa equipa","Instruções de utilização dadas antes do início da festa","Recomenda-se supervisão de um adulto durante toda a atividade","Equipamento revisto e higienizado entre eventos"]'::jsonb,
  gallery = '["https://desafiarviana.pt/wp-content/uploads/2024/05/Festas-de-aniversario.jpg"]'::jsonb,
  photo_url = COALESCE(photo_url, 'https://desafiarviana.pt/wp-content/uploads/2024/05/Festas-de-aniversario.jpg'),
  price_note = 'Pacotes a partir de 140€ (3 horas, espaço não incluído) — lanche +5€/criança e monitores +80€ como opções extra. Taxa de deslocação sob consulta.'
WHERE id = 'festas';

UPDATE public.activities SET
  long_description = 'Aluguer de insufláveis, camas elásticas e combinados para eventos privados, escolas ou festas institucionais — com entrega, montagem e recolha incluídas. Escolhe um ou vários equipamentos consoante o espaço e o número de participantes.',
  safety_rules = '["Montagem e fixação do equipamento feita pela nossa equipa","Instruções de utilização e limite de participantes indicados no local","Recomenda-se supervisão de um adulto durante a utilização","Equipamento revisto e higienizado entre eventos"]'::jsonb,
  gallery = '["https://desafiarviana.pt/wp-content/uploads/2024/03/Camada-0.png","https://desafiarviana.pt/wp-content/uploads/2024/04/Imagem-WhatsApp-2024-03-16-as-20.00.48_dba60eb9.jpg","https://desafiarviana.pt/wp-content/uploads/2024/03/Camada-20-1024x607.jpg","https://desafiarviana.pt/wp-content/uploads/2024/04/Imagem-WhatsApp-2024-04-06-as-17.27.51_a8c08e01-1-1536x808.jpg","https://desafiarviana.pt/wp-content/uploads/2024/03/Camada-19-1024x1021.jpg","https://desafiarviana.pt/wp-content/uploads/2024/03/trampolim-redondo-420-com-rede-de-protecao-1024x1024.jpg"]'::jsonb,
  photo_url = COALESCE(photo_url, 'https://desafiarviana.pt/wp-content/uploads/2024/02/Insuflaveis.jpg'),
  price_note = 'Preço consoante o(s) equipamento(s) escolhido(s) — combina vários itens no simulador ao lado.'
WHERE id = 'insuflaveis';

UPDATE public.activities SET
  long_description = 'Futebol dentro de bolas insufláveis gigantes — corre, dribla e ressalta contra os adversários numa atividade tão divertida quanto segura para todas as idades. A própria bola insuflável funciona como proteção, tornando esta uma das atividades mais hilariantes para grupos de amigos, despedidas de solteiro(a) ou eventos de empresa.',
  safety_rules = '["Equipamento insuflável de proteção fornecido a todos os participantes","Briefing de regras antes do início do jogo","Área de jogo delimitada e supervisionada pelos monitores","Atividade recomendada a partir dos 8 anos"]'::jsonb,
  gallery = '["https://desafiarviana.pt/wp-content/uploads/2024/02/Bubble-soccer.jpg"]'::jsonb,
  photo_url = COALESCE(photo_url, 'https://desafiarviana.pt/wp-content/uploads/2024/02/Bubble-soccer.jpg'),
  price_note = 'Preço por pessoa/hora — ideal a partir de 6 participantes.'
WHERE id = 'bubble-soccer';

UPDATE public.activities SET
  long_description = 'Programas de animação e atividades para ATL, escolas e colónias de férias, adaptados à idade dos participantes e aos objetivos de cada instituição. Combinamos jogos, desporto e dinâmicas de grupo para tardes ativas e divertidas, dentro ou fora do recinto escolar.',
  safety_rules = '["Atividades adaptadas à faixa etária dos participantes","Monitores da Desafiar Viana presentes durante toda a atividade","Planeamento prévio com a instituição para adequar o programa ao espaço disponível","Equipamento e materiais fornecidos pela nossa equipa"]'::jsonb,
  gallery = '["https://desafiarviana.pt/wp-content/uploads/2024/03/1626633839168-1024x473.jpg","https://desafiarviana.pt/wp-content/uploads/2024/03/16x92-1-e1462183551901.jpg"]'::jsonb,
  photo_url = COALESCE(photo_url, 'https://desafiarviana.pt/wp-content/uploads/2024/02/atL.jpg'),
  price_note = 'Preço sob consulta, consoante o número de participantes e a duração do programa.'
WHERE id = 'atl';
