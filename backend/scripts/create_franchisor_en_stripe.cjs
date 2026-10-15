const Stripe = require('stripe');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error('ERRO: STRIPE_SECRET_KEY não encontrada no .env');
  process.exit(1);
}

const stripe = new Stripe(secretKey);

async function findOrCreateProductAndPrice({ name, description, unitAmount, currency, metadataKey, slug }) {
  console.log(`\nVerificando produto: "${name}" (${currency.toUpperCase()} ${unitAmount / 100})...`);
  
  const existingProducts = await stripe.products.list({ limit: 100 });
  let product = existingProducts.data.find(
    p => p.name.toLowerCase().trim() === name.toLowerCase().trim() ||
         (p.metadata && p.metadata.product_key === metadataKey)
  );

  if (product) {
    console.log(`✓ Produto já existe: ${product.name} (ID: ${product.id})`);
  } else {
    console.log(`+ Criando produto: ${name}...`);
    product = await stripe.products.create({
      name,
      description,
      metadata: {
        product_key: metadataKey,
        slug: slug,
      },
    });
    console.log(`✓ Produto criado com sucesso: ${product.name} (ID: ${product.id})`);
  }

  const prices = await stripe.prices.list({ product: product.id, limit: 20 });
  let price = prices.data.find(
    pr => pr.active && pr.currency.toLowerCase() === currency.toLowerCase() && pr.unit_amount === unitAmount
  );

  if (price) {
    console.log(`✓ Preço ativo já existente: ${price.id} (${(price.unit_amount / 100).toFixed(2)} ${price.currency.toUpperCase()})`);
  } else {
    console.log(`+ Criando preço: ${(unitAmount / 100).toFixed(2)} ${currency.toUpperCase()}...`);
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: unitAmount,
      currency: currency.toLowerCase(),
      metadata: {
        product_key: metadataKey,
      },
    });
    console.log(`✓ Preço criado com sucesso: ${price.id}`);
  }

  return { product, price };
}

async function main() {
  try {
    console.log('--- Criando produto The Future Franchisor Dossier no Stripe ---');

    const result = await findOrCreateProductAndPrice({
      name: 'The Future Franchisor Dossier',
      description: 'The definitive method and operational roadmap for business owners looking to format and scale their brand into a successful franchise network. By Marinho Ponci.',
      unitAmount: 4700, // $ 47.00 USD
      currency: 'usd',
      metadataKey: 'dossie_futuro_franqueador_en',
      slug: 'dossie-futuro-franqueador-en',
    });

    console.log('\n=============================================');
    console.log('RESULTADO OBTIDO:');
    console.log(`Franqueador EN Price ID:    ${result.price.id}`);
    console.log('=============================================\n');

    let envContent = fs.readFileSync(envPath, 'utf8');
    if (!envContent.includes('STRIPE_FRANQUEADOR_EN_PRICE_ID=')) {
      envContent += `\nSTRIPE_FRANQUEADOR_EN_PRICE_ID=${result.price.id}`;
    } else {
      envContent = envContent.replace(
        /STRIPE_FRANQUEADOR_EN_PRICE_ID=.*/,
        `STRIPE_FRANQUEADOR_EN_PRICE_ID=${result.price.id}`
      );
    }
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✓ Arquivo .env atualizado com STRIPE_FRANQUEADOR_EN_PRICE_ID!');

  } catch (err) {
    console.error('❌ ERRO:', err.message);
    process.exit(1);
  }
}

main();
