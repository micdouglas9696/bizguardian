-- Email recovery templates (recovery 5min / 24h / 7d)
INSERT INTO automation_templates (slug, channel, subject, body, description, is_active) VALUES
(
  'recovery_5min_email',
  'email',
  'Você esqueceu algo por aqui... 👀',
  'Olá {{name}}!

Notei que você se interessou pelo Dossiê do Futuro Franqueado mas não finalizou.

Se ficou com alguma dúvida, é só responder este email — estou aqui para ajudar.

Acesse: {{link}}

Abraço,
Marinho Ponci',
  'Email de recuperação — 5 minutos após captura do lead',
  true
),
(
  'recovery_24h_email',
  'email',
  '327 pessoas já tomaram a decisão certa 🏆',
  'Olá {{name}}!

Já são mais de 327 pessoas que usaram o Dossiê do Futuro Franqueado para tomar a decisão certa antes de investir em uma franquia.

Você ainda pode garantir o seu antes que o preço suba.

Acesse: {{link}}

Abraço,
Marinho Ponci',
  'Email de recuperação — 24 horas após captura do lead',
  true
),
(
  'recovery_7d_email',
  'email',
  '5% OFF só para você — cupom BIZGUARDIAN5 🎁',
  'Olá {{name}}!

Liberei um cupom exclusivo de 5% de desconto para você finalizar sua compra do Dossiê do Futuro Franqueado.

Use o cupom BIZGUARDIAN5 no checkout.

⚠️ Válido apenas até amanhã.

Acesse: {{link}}

Abraço,
Marinho Ponci',
  'Email de recuperação — 7 dias após captura (cupom 5% OFF)',
  true
)
ON CONFLICT (slug) DO NOTHING;
