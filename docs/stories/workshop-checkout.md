# Checkout Workshop Brasil → Europa

- [x] API local acessível pelo frontend sem erro CORS (Stripe simulada).
- [x] Checkout Stripe em BRL por R$ 300, com nome, e-mail e WhatsApp associados à sessão (Stripe simulada).
- [x] Retorno indica pagamento apenas após confirmação da Stripe (resposta simulada).
- [x] Pagamentos do workshop não disparam entrega do e-book (revisão de código).
- [ ] Validar build e checkout em modo teste; produção depende de aprovação.

Arquivos: `src/pages/WorkshopEuropaPage.tsx`, `vite.config.ts`, `backend/src/index.ts`.

Builds e lint dos arquivos do frontend alterados passaram. Lint global falha em arquivos existentes do projeto. Teste real da Stripe pendente de chave secreta de teste válida; webhook e banco reais não foram testados. Publicação não autorizada.

## Preparação do funil — 02/11
- [x] Captura de lead antes da sessão, com consentimento opcional para lembretes.
- [x] Aba de consulta do workshop no CRM, sujeita à implantação da migração.
- [x] Fila em espera para 1h/24h e avisos de pagamento; confirmação de pagamento cancela lembretes.
- [x] Teste isolado com PostgreSQL real e Stripe simulada, inclusive evento repetido e pagamento assíncrono.
- [ ] Implementar e testar o processador de mensagens e o descadastro.
- [ ] Aprovar mensagens e definir destinatário da equipe.
- [ ] Ativar Pix na conta e validar ponta a ponta.
- [ ] Implantar migração e código somente após revisão operacional de produção.

Arquivos adicionais: `backend/migrations/2026-11-02_workshop_funnel.sql`, `src/pages/AdminDashboard.tsx`, `src/pages/workshop-europa.css`, `docs/stories/workshop-mensagens.md`.

## Verificação n8n — 02/11
- A automação existente BizGuardian · Pós-Venda contém os nós “Notifica Marinho” e “Boas-vindas Cliente”, com provedor de WhatsApp e destino do aviso já configurados.
- A mensagem existente de boas-vindas é específica de outro produto e contém acesso a área de membros e reunião bônus; não serve para este workshop.
- Foi criado o rascunho independente `EGVCHYRbVrkBKhGP`, com mensagem adaptada de confirmação e nós de envio desativados. O webhook do rascunho está sem autenticação e o fluxo ainda não está conectado à confirmação de pagamento; não publicar até proteger, integrar e testar.
- Reexecutado teste local de captura, consentimento, pagamento assíncrono, cancelamento de lembretes e repetição de evento: aprovado. Não comprova entrega real de WhatsApp ou deploy.

## Continuação técnica — 02/11
- O valor e a moeda pagos passam a ser armazenados a partir da sessão Stripe; um cenário com desconto foi validado localmente.
- Criado endpoint interno protegido por segredo para o n8n consultar a elegibilidade antes de um lembrete. Ele exige consentimento, ausência de compra paga e consulta atual da Stripe; falha fechada quando a consulta falha.
- Os textos de 1h e 24h foram adaptados em rascunho no n8n e permanecem desativados. O endpoint, a fila, o descadastro e o n8n ainda não estão conectados em produção e nenhum envio real foi testado. Consultar a elegibilidade e enviar continuam sujeitos a uma janela de concorrência que precisa ser tratada antes da ativação.
