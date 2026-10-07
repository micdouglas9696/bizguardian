const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function main() {
    try {
        console.log('Inserting / updating dossie-futuro-franqueado (PT)...');
        await pool.query(`
            INSERT INTO products
                (slug, title, subtitle, description, access_type, access_value, stripe_price_id, stripe_metadata_key, sort_order)
            VALUES
                ('dossie-futuro-franqueado',
                 'O Dossiê do Futuro Franqueado',
                 'Programa interativo · 6 módulos + 3 bônus',
                 'O método de Marinho Ponci para quem está prestes a investir em uma franquia. 38 anos de experiência transformados em um guia decisório.',
                 'pdf',
                 'dossie-futuro-franqueado.pdf',
                 '${process.env.STRIPE_EBOOK_PRICE_ID || 'price_1TWIOl0l9XbFWgZqEh2Y9i0P'}',
                 'dossie_futuro_franqueado',
                 1)
            ON CONFLICT (slug) DO UPDATE SET
                title = EXCLUDED.title,
                subtitle = EXCLUDED.subtitle,
                access_value = EXCLUDED.access_value,
                stripe_price_id = EXCLUDED.stripe_price_id,
                stripe_metadata_key = EXCLUDED.stripe_metadata_key
        `);

        console.log('Inserting / updating dossie-futuro-franqueado-en (EN)...');
        await pool.query(`
            INSERT INTO products
                (slug, title, subtitle, description, access_type, access_value, stripe_price_id, stripe_metadata_key, sort_order)
            VALUES
                ('dossie-futuro-franqueado-en',
                 'The Future Franchisee Dossier',
                 'Interactive program · 6 modules + 3 bonuses',
                 'Marinho Ponci''s method for those about to invest in a franchise, now in English.',
                 'pdf',
                 'dossie-futuro-franqueado-en.pdf',
                 '${process.env.STRIPE_FRANQUEADO_EN_PRICE_ID || 'price_1UO0Ja0l9XbFWgZqFBdeTxz8'}',
                 'dossie_futuro_franqueado_en',
                 2)
            ON CONFLICT (slug) DO UPDATE SET
                title = EXCLUDED.title,
                subtitle = EXCLUDED.subtitle,
                access_value = EXCLUDED.access_value,
                stripe_price_id = EXCLUDED.stripe_price_id,
                stripe_metadata_key = EXCLUDED.stripe_metadata_key
        `);

        console.log('Inserting / updating dossie-futuro-franqueador (PT)...');
        await pool.query(`
            INSERT INTO products
                (slug, title, subtitle, description, access_type, access_value, stripe_price_id, stripe_metadata_key, sort_order)
            VALUES
                ('dossie-futuro-franqueador',
                 'O Dossiê do Futuro Franqueador',
                 'O guia definitivo para formatar sua marca',
                 'O método completo para quem deseja transformar seu negócio de sucesso em uma rede de franquias.',
                 'pdf',
                 'dossie-futuro-franqueador.pdf',
                 '${process.env.STRIPE_FRANQUEADOR_PRICE_ID || 'price_1UO0JZ0l9XbFWgZq4hXIpJiq'}',
                 'dossie_futuro_franqueador',
                 3)
            ON CONFLICT (slug) DO UPDATE SET
                title = EXCLUDED.title,
                subtitle = EXCLUDED.subtitle,
                access_value = EXCLUDED.access_value,
                stripe_price_id = EXCLUDED.stripe_price_id,
                stripe_metadata_key = EXCLUDED.stripe_metadata_key
        `);

        console.log('Products inserted / updated successfully with Stripe Price IDs!');
    } catch (err) {
        console.error('Error inserting products:', err);
    } finally {
        await pool.end();
    }
}

main();
