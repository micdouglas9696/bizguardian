# Stripe Setup — O Dossiê do Futuro Franqueado

Passo-a-passo para configurar o Stripe Dashboard antes do go-live.
**Você executa isso uma vez.** Eu cuido do código.

> ⚠️ Faça TUDO em modo **TEST** primeiro (toggle no canto superior do Dashboard).
> Só ative LIVE depois que o fluxo end-to-end estiver validado.

---

## 0 · Acesso ao Dashboard

URL: https://dashboard.stripe.com

Login com a conta que você já criou. Verifique no canto superior se está em **Test mode** (toggle "Viewing test data" deve estar ATIVADO).

---

## 1 · Ativar PIX (Brasil)

Por padrão a conta brasileira vem só com cartão. Para PIX:

1. Vá em **Settings → Payment methods** (https://dashboard.stripe.com/settings/payment_methods)
2. Encontre **Pix** na lista
3. Clique em **Turn on**
4. Pode pedir alguns documentos da empresa/CPF — anexe e aguarde aprovação (geralmente em algumas horas)

> Se ainda não estiver aprovado quando você for testar: o checkout aceitará só cartão. Quando o PIX for liberado, aparece automaticamente.

---

## 2 · Criar o Produto

1. Vá em **Products → Catalog** (https://dashboard.stripe.com/products)
2. Clique em **+ Add product**
3. Preencha:
   - **Name:** `O Dossiê do Futuro Franqueado`
   - **Description:**
     ```
     Programa interativo com 6 módulos em vídeo do Marinho Ponci
     para quem está prestes a investir em uma franquia.
     Acesso permanente + 7 dias de garantia.
     ```
   - **Image:** opcional, pode subir uma capa do e-book
4. Em **Pricing**:
   - Tipo: **One-time** (à vista, não é assinatura)
   - **Price:** `247.00`
   - **Currency:** `BRL — Brazilian Real`
5. Clique em **Save product**

Após criar, **copie o `Price ID`** que aparece (formato `price_1Pxxx...`).
**Guarde esse ID** — vamos precisar dele no `.env`.

---

## 3 · Configurar Checkout opcional

Em **Settings → Checkout and Payment Links** (https://dashboard.stripe.com/settings/checkout):

- ✅ **Allow promotion codes** — útil para campanhas futuras
- ✅ **Collect customer billing address** (Brazil só pede o CEP)
- ✅ **Adjustable quantity** — pode deixar OFF (só vendemos 1 unidade)
- **Phone number collection** — opcional (recomendo ON, ajuda no suporte)

Em **Branding** (https://dashboard.stripe.com/settings/branding):

- Suba o logo do Marinho (`/marinho final.png`)
- Cor de destaque: `#e1a960` (gold)
- Cor de fundo: `#0a0a0a` (preto)

Isso deixa o checkout do Stripe alinhado com a landing.

---

## 4 · Criar o Webhook Endpoint

Webhooks são como o Stripe "avisa" o backend que um pagamento foi confirmado.

### Para desenvolvimento local

Use o **Stripe CLI** (eu posso te guiar separadamente — basta pedir).
Ele cria um túnel temporário do tipo `whsec_xxx` que você usa no `.env` local.

### Para produção

1. Vá em **Developers → Webhooks** (https://dashboard.stripe.com/webhooks)
2. Clique em **+ Add endpoint**
3. **Endpoint URL:** `https://marinhoponci.com/api/webhooks/stripe`
   *(ajuste se o domínio da API for outro)*
4. **Events to send** — clique em **Select events** e adicione:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`
5. Clique em **Add endpoint**
6. Na tela do webhook recém-criado, na seção **Signing secret**, clique em **Reveal** e **copie o `whsec_xxx`**

---

## 5 · Pegar as Chaves de API

1. Vá em **Developers → API keys** (https://dashboard.stripe.com/apikeys)
2. Você verá duas chaves:
   - **Publishable key** — começa com `pk_test_...` (frontend, é pública)
   - **Secret key** — clique em **Reveal test key** — começa com `sk_test_...` (backend, NUNCA exponha)

Copie as duas.

---

## 6 · Preencher o `.env` do projeto

No arquivo `.env` (na raiz do projeto), adicione/preencha:

```bash
# ===== STRIPE =====
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_EBOOK_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# URLs públicas usadas pelo Stripe redirect
PUBLIC_URL=https://marinhoponci.com
# Em desenvolvimento local:
# PUBLIC_URL=http://localhost:5173

# ===== JWT (área do membro — sprint seguinte) =====
JWT_SECRET=  # gerar com: openssl rand -base64 64
```

> **Não commite o `.env` no Git.** Já está no `.gitignore`.

E no frontend, adicione no mesmo `.env` (ou crie um `.env.local` se preferir):

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_API_URL=http://localhost:3001  # já existe no projeto
```

---

## 7 · Testar (modo TEST)

Quando eu finalizar a integração no código, você vai conseguir testar usando os cartões fake do Stripe:

| Cenário | Número do cartão | Resultado |
|---|---|---|
| **Aprovado** | `4242 4242 4242 4242` | Pagamento OK |
| **Recusado** | `4000 0000 0000 0002` | Cartão recusado |
| **Requer 3DS** | `4000 0025 0000 3155` | Pede autenticação |
| **PIX** | (gera QR code de teste) | Confirma sozinho em 2-3min |

CVV: qualquer 3 dígitos.
Validade: qualquer data futura.
CEP: qualquer.

---

## 8 · Indo para LIVE (produção)

Só faça depois que o fluxo TEST estiver 100% funcional.

1. Toggle "Viewing test data" → desligar
2. Repita os passos **2** e **4** em modo LIVE (criar produto + webhook)
3. Pegue as chaves LIVE em **API keys** (`pk_live_...` e `sk_live_...`)
4. Atualize o `.env` de produção com as chaves LIVE
5. Faça redeploy

> **Atenção:** o `whsec_` do webhook LIVE é diferente do TEST. Crie um novo endpoint em LIVE e pegue o secret novo.

---

## 9 · Checklist — me avise quando terminar

Marque conforme conclui:

- [ ] PIX ativado em Payment Methods
- [ ] Produto criado, copiei o **Price ID** (`price_xxx`)
- [ ] Branding configurado (logo + cores)
- [ ] Webhook criado, copiei o **Signing secret** (`whsec_xxx`)
- [ ] Copiei a **Publishable key** (`pk_test_xxx`)
- [ ] Copiei a **Secret key** (`sk_test_xxx`)
- [ ] Tudo colado no `.env` da raiz do projeto

Quando estiver tudo pronto, me avise: vou testar o fluxo end-to-end com você.

---

## Suporte

Documentação oficial:
- Checkout: https://stripe.com/docs/payments/checkout
- PIX no Brasil: https://stripe.com/docs/payments/pix
- Webhooks: https://stripe.com/docs/webhooks
- Test cards: https://stripe.com/docs/testing
