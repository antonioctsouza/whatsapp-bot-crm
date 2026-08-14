const db = require('../lib/db');
const { sendMessage } = require('../lib/whatsapp');

async function handleSales(contact, message) {
  const existing = await db.query(
    `SELECT id FROM leads WHERE contact_id = $1 AND status NOT IN ('fechado', 'perdido') ORDER BY created_at DESC LIMIT 1`,
    [contact.id]
  );

  let leadId;

  if (existing.rows.length > 0) {
    leadId = existing.rows[0].id;
  } else {
    const created = await db.query(
      `INSERT INTO leads (contact_id, status, source) VALUES ($1, 'novo', 'whatsapp') RETURNING id`,
      [contact.id]
    );
    leadId = created.rows[0].id;
  }

  await sendMessage(
    contact.phone,
    `Legal que você tem interesse! Me conta rapidinho: o que você está buscando e qual o seu orçamento aproximado? Assim já te encaminho certinho.`
  );

  return { leadId };
}

module.exports = { handleSales };
