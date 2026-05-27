# 🤖 Automações BizGuardian — Setup

Sistema completo de automação WhatsApp + e-mail para o funil do Dossiê.

## Arquitetura

```
Lead/Compra  →  Backend (Express)  →  POST webhook n8n
                                          ↓
                              ZapZuck Go (WhatsApp) + Resend (email)
                                          ↓
                              Notifica +351 96 186 2223 (Marinho)
```

## Componentes

| Camada | Onde | O que faz |
|---|---|---|
| **Banco** | Postgres (já existe) | Tabelas `automation_templates`, `automation_campaigns`, `automation_runs` |
| **Backend** | `backend/src/automation.ts` | Endpoints admin + helper `triggerN8nAsync()` |
| **Admin UI** | `/admin/automacoes` | Templates, disparo manual, histórico |
| **n8n** | `https://n8n.mycom.dev.br` | 4 workflows (lead/recovery/postvenda/batch) |
| **WhatsApp** | ZapZuck Go (`api.mycom.dev.br`) | Envia mensagens |

---

## Passo a passo — setup inicial

### 1️⃣ Rodar a migration no Postgres da VPS

A migration roda **automaticamente após o `./deploy.sh`** porque o `init.sql` é montado em `/docker-entrypoint-initdb.d/`. Mas como o DB já existe, você precisa rodar manualmente desta vez:

```bash
# 1. Copia a migration pra VPS
sshpass -p 'vzg1JipFV63PbSmy9s' scp backend/migrations/2026-05-27_automation.sql root@185.182.184.131:/tmp/

# 2. Aplica no DB da stack bizguardian (uma vez que o stack estiver deployado)
sshpass -p 'vzg1JipFV63PbSmy9s' ssh root@185.182.184.131 \
  'docker exec -i $(docker ps -qf name=bizguardian_db) psql -U bizguardian_admin -d bizguardian_crm < /tmp/2026-05-27_automation.sql'
```

> Credenciais (já no `docker-compose.prod.yml`):
> - DB user: `bizguardian_admin`
> - DB name: `bizguardian_crm`
> - DB container interno: `bizguardian_db` (rede `bizguardian_internal`)

### 2️⃣ Adicionar variáveis no `.env` do backend

```env
# .env (raiz) e backend/.env
N8N_WEBHOOK_BASE=https://webhook.mycom.dev.br/automation
N8N_SHARED_SECRET=<gerar-aleatorio-64-chars>   # opcional, mas recomendado
```

### 3️⃣ Importar os 4 workflows no n8n

1. Abra `https://n8n.mycom.dev.br` e faça login
2. **Workflows → Import from File** — importe os 4 JSONs:
   - `automation/n8n/01-lead-captured.json`
   - `automation/n8n/02-recovery.json`
   - `automation/n8n/03-postvenda.json`
   - `automation/n8n/04-campaign-batch.json`
3. **Ative** cada workflow (toggle no canto superior direito)

> Não precisa configurar credencial de Postgres — os workflows falam só com o backend BizGuardian via HTTP (`https://api.marinhoponci.com`) e com a ZapZuck Go.

### 4️⃣ Verificar a URL exata da ZapZuck Go

Os workflows usam `https://api.mycom.dev.br/send/text`. Se o seu ZapZuck Go usa outro path (ex: `/message/sendText`, `/sendMessage`), edite todos os HTTP Request nodes nos 4 workflows. Cheque em `https://api.mycom.dev.br/dashboard/` qual o endpoint correto.

> Header de auth usado: `token: 0CB09B5379B4-442C-9BAB-C19AB6E0F9Z9`
> Body: `{"number": "5511999999999", "text": "..."}`
> Se sua API exigir formato diferente (`Bearer`, `instance` no path, etc.), ajuste nos nodes HTTP Request.

### 5️⃣ Deploy do backend + frontend

```bash
# Backend (via docker swarm — já tem deploy.sh configurado)
./deploy.sh

# Frontend (Vercel - automático no push)
git add -A && git commit -m "feat: automações WhatsApp via n8n" && git push
```

### 6️⃣ Testar end-to-end

1. Acesse `https://marinhoponci.com/ebook` e preencha o formulário com seu nome/email/telefone
2. Em <5s você (Marinho, +351...) deve receber:
   - Notificação no WhatsApp com os dados do lead
3. O lead recebe a 1ª mensagem
4. Se não comprar: chegam mensagens em 5min, 24h e 7 dias
5. Se comprar: dispara o fluxo de pós-venda

---

## Painel admin

URL: `https://marinhoponci.com/admin/automacoes`

**Aba Campanhas** — histórico de disparos com status (enviadas, falhas, fila)
**Aba ＋ Nova campanha** — disparo manual:
  - Escolhe template
  - Origem: lista existente (quiz/prioridade/contato/compradores) OU CSV colado
**Aba Templates** — editar mensagens sem mexer no n8n (suporta `{{name}}`, `{{link}}`, `{{product}}`, etc.)

---

## Templates incluídos

| Slug | Canal | Quando dispara |
|---|---|---|
| `lead_welcome_wa` | WhatsApp | Imediato após preencher formulário |
| `recovery_5min_wa` | WhatsApp | 5 min após abandono |
| `recovery_24h_wa` | WhatsApp | 24 h após abandono (prova social) |
| `recovery_7d_wa` | WhatsApp | 7 dias após abandono (cupom 5%) |
| `postvenda_wa` | WhatsApp | Após pagamento confirmado |
| `admin_notify_lead_wa` | WhatsApp | Notifica Marinho — novo lead |
| `admin_notify_sale_wa` | WhatsApp | Notifica Marinho — nova venda |

Você pode editar a mensagem de qualquer template direto na aba **Templates** do admin.

---

## Melhorias futuras (v2)

- [ ] Cancelar recuperação se cliente comprar antes dos 7 dias (atualmente envia mesmo após compra)
- [ ] Áudio humano gravado nas msgs de 24h (campo `audio_url` já existe no template)
- [ ] Score de lead quente (>2 cliques no checkout = notif prioritária)
- [ ] Pós-venda de ativação (D+1, D+3, D+7 verificando login na área de membro)
- [ ] Dashboard com conversion rate por etapa da recuperação

---

## Troubleshooting

**n8n não recebe webhook:**
- Confira se o workflow está **ativo** (toggle no canto superior direito)
- Teste manual: `curl -X POST https://webhook.mycom.dev.br/automation/lead-captured -H "Content-Type: application/json" -d '{"name":"Teste","email":"t@t.com","phone":"+5511999999999","link":"https://marinhoponci.com/ebook","product":"Dossiê"}'`

**WhatsApp não envia:**
- Verifique se a instância `marinho onci` está conectada no `https://api.mycom.dev.br/dashboard/`
- Cheque o endpoint correto da ZapZuck (em `/dashboard/` deve ter a doc da API)
- Veja os logs do n8n: cada execução fica em **Executions** com o erro detalhado

**Backend não dispara:**
- Logs: `sshpass -p '...' ssh root@... 'docker logs <backend-container> --tail 50'`
- Confira se `N8N_WEBHOOK_BASE` está setado no `.env`
