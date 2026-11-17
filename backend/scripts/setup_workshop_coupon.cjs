const Stripe = require('stripe');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const secretKey = process.env.STRIPE_SECRET_KEY;

async function main() {
  if (!secretKey) {
    console.error('ERRO: STRIPE_SECRET_KEY não encontrada nas variáveis de ambiente.');
    process.exit(1);
  }

  const stripe = new Stripe(secretKey);

  console.log('--- Verificando / Criando Cupom PORTUGAL15 no Stripe ---');

  // 1. Verificar cupom
  let coupon;
  try {
    coupon = await stripe.coupons.retrieve('portugal15');
    console.log(`✓ Cupom existente: ${coupon.id} (${coupon.percent_off}% OFF)`);
  } catch {
    console.log('+ Criando cupom de 15%...');
    coupon = await stripe.coupons.create({
      id: 'portugal15',
      name: 'PORTUGAL15 (15% OFF)',
      percent_off: 15,
      duration: 'once',
      metadata: {
        product: 'workshop_brasil_europa',
        event_date: '28/11/2026',
      },
    });
    console.log(`✓ Cupom criado: ${coupon.id}`);
  }

  // 2. Verificar código promocional
  const promoCodes = await stripe.promotionCodes.list({ code: 'PORTUGAL15', limit: 5 });
  let promo = promoCodes.data.find(p => p.active);

  if (promo) {
    console.log(`✓ Código promocional ativo: ${promo.code} (ID: ${promo.id})`);
  } else {
    console.log('+ Criando código promocional PORTUGAL15...');
    promo = await stripe.promotionCodes.create({
      promotion: {
        type: 'coupon',
        coupon: coupon.id,
      },
      code: 'PORTUGAL15',
      active: true,
      metadata: {
        product: 'workshop_brasil_europa',
        event_date: '28/11/2026',
      },
    });
    console.log(`✓ Código promocional criado: ${promo.code} (ID: ${promo.id})`);
  }

  console.log('\n=============================================');
  console.log(`CUPOM: ${promo.code}`);
  console.log(`DESCONTO: 15%`);
  console.log(`STATUS: Ativo e pronto no Checkout Stripe`);
  console.log('=============================================\n');
}

main().catch(err => {
  console.error('Erro na execução:', err.message);
  process.exit(1);
});
