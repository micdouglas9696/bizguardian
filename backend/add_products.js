const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function main() {
    try {
        console.log('Inserting dossie-futuro-franqueado-en...');
        await pool.query(`
            INSERT INTO products
                (slug, title, subtitle, description, access_type, access_value, stripe_metadata_key, sort_order)
            VALUES
                ('dossie-futuro-franqueado-en',
                 'The Future Franchisee Dossier',
                 'Interactive program · 6 modules + 3 bonuses',
                 'Marinho Ponci''s method for those about to invest in a franchise, now in English.',
                 'pdf',
                 'dossie-futuro-franqueado-en.pdf',
                 'dossie_futuro_franqueado_en',
                 2)
            ON CONFLICT (slug) DO UPDATE SET
                access_value = EXCLUDED.access_value,
                stripe_metadata_key = EXCLUDED.stripe_metadata_key
        `);

        console.log('Inserting dossie-futuro-franqueador...');
        await pool.query(`
            INSERT INTO products
                (slug, title, subtitle, description, access_type, access_value, stripe_metadata_key, sort_order)
            VALUES
                ('dossie-futuro-franqueador',
                 'O Dossiê do Futuro Franqueador',
                 'O guia definitivo para formatar sua marca',
                 'O método completo para quem deseja transformar seu negócio de sucesso em uma rede de franquias.',
                 'pdf',
                 'dossie-futuro-franqueador.pdf',
                 'dossie_futuro_franqueador',
                 3)
            ON CONFLICT (slug) DO UPDATE SET
                access_value = EXCLUDED.access_value,
                stripe_metadata_key = EXCLUDED.stripe_metadata_key
        `);

        console.log('Products inserted successfully!');
    } catch (err) {
        console.error('Error inserting products:', err);
    } finally {
        await pool.end();
    }
}

main();
