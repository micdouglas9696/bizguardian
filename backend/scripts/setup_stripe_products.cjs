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
  
  // 1. Procurar produto existente por nome ou metadata
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

  // 2. Procurar preço existente para esse produto
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
    console.log('--- Iniciando sincronização de produtos no Stripe ---');
    console.log(`Usando chave: ${secretKey.substring(0, 12)}...`);

    // 1. Dossiê do Futuro Franqueador (PT) - R$ 247,00 BRL
    const franqueadorResult = await findOrCreateProductAndPrice({
      name: 'O Dossiê do Futuro Franqueador',
      description: 'O método definitivo para empresários que desejam transformar seu negócio de sucesso em uma rede de franquias sólida. Por Marinho Ponci.',
      unitAmount: 24700, // R$ 247.00
      currency: 'brl',
      metadataKey: 'dossie_futuro_franqueador',
      slug: 'dossie-futuro-franqueador',
    });

    // 2. The Future Franchisee Dossier (EN) - $ 47.00 USD
    const franqueadoEnResult = await findOrCreateProductAndPrice({
      name: 'The Future Franchisee Dossier',
      description: 'The definitive decision-making roadmap for prospective franchise investors before signing a contract. By Marinho Ponci.',
      unitAmount: 4700, // $ 47.00 USD
      currency: 'usd',
      metadataKey: 'dossie_futuro_franqueado_en',
      slug: 'dossie-futuro-franqueado-en',
    });

    console.log('\n=============================================');
    console.log('RESULTADOS OBTIDOS:');
    console.log(`Franqueador PT Price ID:    ${franqueadorResult.price.id}`);
    console.log(`Franqueado EN Price ID:     ${franqueadoEnResult.price.id}`);
    console.log('=============================================\n');

    // 3. Atualizar .env se necessário
    let envContent = fs.readFileSync(envPath, 'utf8');

    if (!envContent.includes('STRIPE_FRANQUEADOR_PRICE_ID=')) {
      envContent += `\nSTRIPE_FRANQUEADOR_PRICE_ID=${franqueadorResult.price.id}`;
    } else {
      envContent = envContent.replace(
        /STRIPE_FRANQUEADOR_PRICE_ID=.*/,
        `STRIPE_FRANQUEADOR_PRICE_ID=${franqueadorResult.price.id}`
      );
    }

    if (!envContent.includes('STRIPE_FRANQUEADO_EN_PRICE_ID=')) {
      envContent += `\nSTRIPE_FRANQUEADO_EN_PRICE_ID=${franqueadoEnResult.price.id}`;
    } else {
      envContent = envContent.replace(
        /STRIPE_FRANQUEADO_EN_PRICE_ID=.*/,
        `STRIPE_FRANQUEADO_EN_PRICE_ID=${franqueadoEnResult.price.id}`
      );
    }

    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✓ Arquivo .env atualizado com as novas variáveis de Price ID!');

  } catch (err) {
    console.error('\n❌ ERRO NA COMUNICAÇÃO COM O STRIPE:');
    console.error(err.message);
    if (err.type === 'StripePermissionError' || (err.message && err.message.includes('permission'))) {
      console.error('\nA chave rk_live_... atual NÃO tem permissão de escrita em Products/Prices.');
      console.error('Nesse caso, precisamos de uma Secret Key (sk_live_...) ou de criar manualmente no Dashboard.');
    }
    process.exit(1);
  }
}

main();
