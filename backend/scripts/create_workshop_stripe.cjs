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
    console.log('Você pode rodar passando via CLI: STRIPE_SECRET_KEY=sk_... node backend/scripts/create_workshop_stripe.cjs');
    process.exit(1);
  }

  const stripe = new Stripe(secretKey);

  console.log('--- Criando/Sincronizando Produto do Workshop no Stripe ---');
  
  // 1. Verificar se produto já existe
  const existingProducts = await stripe.products.list({ limit: 100 });
  let product = existingProducts.data.find(
    p => p.metadata && p.metadata.product_key === 'workshop_brasil_europa' ||
         p.name.toLowerCase().includes('brasil ➔ europa') ||
         p.name.toLowerCase().includes('brasil -> europa')
  );

  if (product) {
    console.log(`✓ Produto já existe: ${product.name} (ID: ${product.id})`);
  } else {
    console.log('+ Criando produto...');
    product = await stripe.products.create({
      name: 'Workshop Online Brasil ➔ Europa: Como morar, empreender e levar sua empresa para a Europa',
      description: 'Acesso ao vivo em 05/12 às 19:30 + Gravação Vitalícia + Acesso ao Grupo VIP. Com Marinho Ponci + Advogado, Contador e Empresário convidados.',
      images: ['https://marinhoponci.com/workshop-marinho-europa.jpg'],
      metadata: {
        product_key: 'workshop_brasil_europa',
        slug: 'workshop-brasil-europa',
      },
    });
    console.log(`✓ Produto criado com sucesso: ${product.name} (ID: ${product.id})`);
  }

  // 2. Preço: R$ 300,00 BRL
  const prices = await stripe.prices.list({ product: product.id, limit: 20 });
  let price = prices.data.find(
    pr => pr.active && pr.currency.toLowerCase() === 'brl' && pr.unit_amount === 30000
  );

  if (price) {
    console.log(`✓ Preço ativo de R$ 300 já existe: ${price.id}`);
  } else {
    console.log('+ Criando preço de R$ 300,00 BRL...');
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: 30000,
      currency: 'brl',
      metadata: {
        product_key: 'workshop_brasil_europa',
      },
    });
    console.log(`✓ Preço criado com sucesso: ${price.id}`);
  }

  console.log('\n=============================================');
  console.log(`STRIPE_WORKSHOP_EUROPA_PRICE_ID=${price.id}`);
  console.log('=============================================\n');
}

main().catch(err => {
  console.error('Erro na execução:', err.message);
  process.exit(1);
});
