# Plan for CRM Dashboard (Pure Local Architecture)

## Objetivo
Criar um CRM interno para a plataforma "Biz Guardian", capturando e armazenando os leads gerados pelos formulários de "Diagnóstico Gratuito" e "Lista Prioritária Internacionalização", rodando 100% de forma autônoma e em hospedagem própria, sem dependência de plataformas BaaS (como Supabase).

## Decisões Arquiteturais e Requisitos (Gate Socrático Concluído)
1. **Segurança (Login):** Autenticação simples (Hardcoded no Front/Backend ou `.env`), focada em resolver o problema imediato de acesso restrito ao painel, permitindo a substituição para JWT/Sessão no futuro.
2. **Banco de Dados & Infraestrutura:** Nada de Supabase. A infraestrutura será **100% local com Docker**.
   - Container Postgres para o Banco de Dados.
   - Container (ou execução direta via PM2/Node) para o Servidor Backend.
3. **Backend Server:** Criar uma API em Node.js (Express ou Hono). Essa API servirá de ponte entre o banco de dados Postgres e o Frontend (React). O banco não será exposto diretamente.
4. **UI/UX do Dashboard:**
   - Visual alinhado ao *Design System* do site (Premium, Black & Gold, Cinematic).
   - Telas de listagem padrão e Kanban (quadros de funil).
   - Modal de detalhes para expandir os dados e visualizar as respostas do Quiz.

## Fases de Implementação da Orquestração

### Fase 1: Setup de Infraestrutura & Backend (Engenheiro / Backend-Specialist)
1. **Criar `docker-compose.yml`** na raiz ou em pasta `backend/` contendo a imagem oficial do Postgres.
2. **Setup do Servidor Node.js:** 
   - Inicializar um projeto backend usando Node.js + Express (ou framework similar) + TypeScript.
   - Configurar o pacote `pg` para comunicação segura via Pool.
   - Criar script SQL de inicialização (`init.sql`) para criar as tabelas `leads_quiz` e `leads_priority`.
3. **Controladores (API Endpoints):**
   - Rota `POST` `/api/leads/quiz`
   - Rota `POST` `/api/leads/priority`
   - Rota `GET` `/api/leads` (protegida para o dashboard)

### Fase 2: Integração do Frontend (Frontend-Specialist)
1. **Refatorar os Formulários Originais:**
   - Atualizar `FranchiseQuizModal.tsx` para enviar dados com fetch/axios para a nova API ao invés de usar `localStorage`.
   - Atualizar `PriorityListModal.tsx` para fazer o mesmo.
2. **Dashboard CRM (`/admin`):**
   - Criar rota protegida no React.
   - Criar a página de login falso/simples.
   - Criar o Layout do Painel com Grid/Tabela de Leads.
   - Adicionar visão Kanban.

### Fase 3: Deploy & Verificação (DevOps / Testing)
- Fornecer instruções/scripts para levantar o banco de dados via Docker (`docker-compose up -d`).
- Garantir de forma automatizada via lints e compilações que as pontes Frontend ↔ Backend estejam conversando através do CORS na mesma rede.
