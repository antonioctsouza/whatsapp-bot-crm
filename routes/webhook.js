const express = require('express');
const router = express.Router();

const db = require('../lib/db');
const { sendMessage } = require('../lib/whatsapp');
const { classifyIntent } = require('../lib/classifyIntent');
const { handleSupport } = require('../handlers/support');
const { handleSales } = require('../handlers/sales');
const { handleScheduling } = require('../handlers/scheduling');

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// Palavras que forçam escalonamento imediato para humano
const ESCALATION_KEYWORDS = ['falar com atendente', 'falar com humano', 'atendente humano', 'quero reclamar'];

// --- Verificação do webhook (exigida pela Meta na configuração) ---
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('DEBUG - token recebido:', JSON.stringify(token));
  console.log('DEBUG - token esperado:', JSON.stringify(VERIFY_TOKEN));

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// --- Recebimento de mensagens ---
router.post('/', async (req, res) => {
  console.log('POST /webhook recebido!', JSON.stringify(req.body));
  // Responde rápido para a Meta não reenviar o webhook
  res.sendStatus(200);

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const message = change?.messages?.[0];

    console.log('Mensagem extraida:', JSON.stringify(message));

    if (!message || message.type !== 'text') {
      console.log('Mensagem ignorada (nao e texto ou nao existe)');
      return;
    }

    const phone = message.from;
    const text = message.text.body;

    console.log('Processando mensagem de', phone, ':', text);

    const contact = await upsertContact(phone);

    await db.query(
      `INSERT INTO conversations (contact_id, direction, message, handled_by) VALUES ($1, 'inbound', $2, 'bot')`,
      [contact.id, text]
    );

    // Escalonamento explícito pedido pelo cliente
    if (ESCALATION_KEYWORDS.some((k) => text.toLowerCase().includes(k))) {
      await escalateToHuman(contact, 'Cliente pediu atendimento humano');
      return;
    }

    const intent = await classifyIntent(text);

    await db.query(
      `UPDATE conversations SET intent = $1 WHERE id = (
        SELECT id FROM conversations WHERE contact_id = $2 ORDER BY created_at DESC LIMIT 1
      )`,
      [intent, contact.id]
    );

    switch (intent) {
      case 'support':
        await handleSupport(contact, text);
        break;
      case 'sales':
        await handleSales(contact, text);
        break;
      case 'scheduling':
        await handleScheduling(contact, text);
        break;
      default:
        await sendMessage(
          contact.phone,
          'Oi! Posso ajudar com suporte, vendas ou agendamento. O que você precisa hoje?'
        );
    }
  } catch (err) {
    console.error('Erro no webhook:', err);
  }
});

async function upsertContact(phone) {
  const existing = await db.query('SELECT * FROM contacts WHERE phone = $1', [phone]);

  if (existing.rows.length > 0) {
    await db.query('UPDATE contacts SET last_contact_at = NOW() WHERE id = $1', [existing.rows[0].id]);
    return existing.rows[0];
  }

  const created = await db.query('INSERT INTO contacts (phone) VALUES ($1) RETURNING *', [phone]);
  return created.rows[0];
}

async function escalateToHuman(contact, reason) {
  await db.query(
    `INSERT INTO escalation_queue (contact_id, reason, status) VALUES ($1, $2, 'pendente')`,
    [contact.id, reason]
  );

  await sendMessage(
    contact.phone,
    'Ok! Já te encaminhei para um de nossos atendentes. Em instantes alguém te responde por aqui.'
  );
}

module.exports = router;
