const db = require('../lib/db');
const { sendMessage } = require('../lib/whatsapp');

async function handleSupport(contact, message) {
  // Verifica se já existe ticket aberto para este contato
  const existing = await db.query(
    `SELECT id FROM tickets WHERE contact_id = $1 AND status != 'resolvido' ORDER BY created_at DESC LIMIT 1`,
    [contact.id]
  );

  let ticketId;

  if (existing.rows.length > 0) {
    ticketId = existing.rows[0].id;
  } else {
    const created = await db.query(
      `INSERT INTO tickets (contact_id, subject, status) VALUES ($1, $2, 'aberto') RETURNING id`,
      [contact.id, message.slice(0, 200)]
    );
    ticketId = created.rows[0].id;
  }

  await sendMessage(
    contact.phone,
    `Entendi, abri o chamado #${ticketId} para o seu caso. Pode me dar mais detalhes do problema? Se preferir falar com um atendente humano, é só dizer "falar com atendente".`
  );

  return { ticketId };
}

module.exports = { handleSupport };
