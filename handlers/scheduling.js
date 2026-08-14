const db = require('../lib/db');
const { sendMessage } = require('../lib/whatsapp');

async function handleScheduling(contact, message) {
  // Esboço simples: aqui entraria a lógica de checar disponibilidade real
  // (ex: consultar Google Calendar, tabela de horários livres, etc.)

  await sendMessage(
    contact.phone,
    `Vamos agendar! Me diga o serviço desejado e a data/horário de preferência (ex: "corte de cabelo, sexta às 15h").`
  );

  // Quando o cliente confirmar data e horário em uma mensagem futura,
  // seria feito o INSERT abaixo:
  //
  // await db.query(
  //   `INSERT INTO appointments (contact_id, service, scheduled_at, status)
  //    VALUES ($1, $2, $3, 'confirmado')`,
  //   [contact.id, service, scheduledAt]
  // );

  return { status: 'aguardando_confirmacao' };
}

module.exports = { handleScheduling };
