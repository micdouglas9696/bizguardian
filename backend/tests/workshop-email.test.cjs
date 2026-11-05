const assert = require('node:assert/strict');
const fs = require('node:fs');
const express = require('express');
const Stripe = require('stripe');
const { Pool } = require('pg');
const { installWorkshopEmail } = require('../dist/workshop-email');

(async () => {
  const connectionString = process.env.WORKSHOP_TEST_DATABASE_URL;
  if (!connectionString) throw new Error('WORKSHOP_TEST_DATABASE_URL deve apontar para banco isolado de teste');
  const db = new URL(connectionString);
  if (!['localhost', '127.0.0.1', '::1'].includes(db.hostname) || !db.pathname.startsWith('/workshop_email_test_')) {
    throw new Error('Banco de teste deve ser local e ter nome iniciado por workshop_email_test_');
  }
  const pool = new Pool({ connectionString });
  await pool.query(fs.readFileSync('migrations/2026-11-05_workshop_email.sql', 'utf8'));
  await pool.query('TRUNCATE workshop_confirmation_emails');
  const stripe = new Stripe('sk_test_local_only');
  stripe.checkout.sessions.listLineItems = async () => ({ data: [{ price: { id: 'price_workshop' }, quantity: 1 }] });
  const sent = [];
  let failNext = false;
  const app = express();
  const { processOne } = installWorkshopEmail(app, { pool, stripe, getSecret: () => 'whsec_local_test', priceId: 'price_workshop', sendMail: async email => { if (failNext) { failNext = false; throw new Error('simulated SMTP failure'); } sent.push(email); } }, { startWorker: false });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/webhooks/stripe/workshop-email`;
  async function post(event, signed=true) {
    const payload = JSON.stringify(event);
    const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: signed ? 'whsec_local_test' : 'whsec_incorrect' });
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'stripe-signature': signature }, body: payload });
  }
  const event = { id: 'evt_local', type: 'checkout.session.completed', livemode: true, data: { object: { id: 'cs_local', object: 'checkout.session', payment_status: 'paid', metadata: { product: 'workshop_brasil_europa' }, customer_details: { email: 'buyer@example.invalid' } } } };
  try {
    assert.equal((await post(event, false)).status, 400);
    assert.equal((await post({ ...event, data: { object: { ...event.data.object, payment_status: 'unpaid' } } })).status, 200);
    assert.equal((await pool.query('SELECT count(*)::int n FROM workshop_confirmation_emails')).rows[0].n, 0);
    assert.equal((await post({ ...event, data: { object: { ...event.data.object, metadata: { product: 'outro' } } } })).status, 200);
    stripe.checkout.sessions.listLineItems = async () => ({ data: [{ price: { id: 'price_wrong' }, quantity: 1 }] });
    assert.equal((await post(event)).status, 400);
    stripe.checkout.sessions.listLineItems = async () => ({ data: [{ price: { id: 'price_workshop' }, quantity: 1 }] });
    assert.equal((await post(event)).status, 200);
    assert.equal((await post(event)).status, 200);
    assert.equal((await pool.query('SELECT count(*)::int n FROM workshop_confirmation_emails')).rows[0].n, 1);
    await processOne(); await processOne();
    assert.deepEqual(sent, ['buyer@example.invalid']);
    assert.equal((await pool.query('SELECT status FROM workshop_confirmation_emails')).rows[0].status, 'sent');
    const retryEvent = { ...event, id: 'evt_retry', data: { object: { ...event.data.object, id: 'cs_retry' } } };
    assert.equal((await post(retryEvent)).status, 200);
    failNext = true; await processOne();
    assert.equal((await pool.query("SELECT status FROM workshop_confirmation_emails WHERE session_id='cs_retry'")).rows[0].status, 'pending');
    await pool.query("UPDATE workshop_confirmation_emails SET next_attempt=NOW() WHERE session_id='cs_retry'");
    await processOne();
    assert.equal((await pool.query("SELECT status FROM workshop_confirmation_emails WHERE session_id='cs_retry'")).rows[0].status, 'sent');
    console.log('PASSOU: assinatura, pagamento pendente, produto, duplicidade e nova tentativa após falha de e-mail.');
  } finally { await new Promise(resolve => server.close(resolve)); await pool.end(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
