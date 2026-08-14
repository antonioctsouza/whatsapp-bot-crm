require('dotenv').config();
const express = require('express');

console.log('=== DEBUG DE VARIAVEIS ===');
console.log('WHATSAPP_TOKEN existe?', !!process.env.WHATSAPP_TOKEN);
console.log('WHATSAPP_PHONE_NUMBER_ID:', process.env.WHATSAPP_PHONE_NUMBER_ID);
console.log('WHATSAPP_VERIFY_TOKEN:', JSON.stringify(process.env.WHATSAPP_VERIFY_TOKEN));
console.log('ANTHROPIC_API_KEY existe?', !!process.env.ANTHROPIC_API_KEY);
console.log('DATABASE_URL existe?', !!process.env.DATABASE_URL);
console.log('===========================');

const webhookRouter = require('./routes/webhook');

const app = express();
app.use(express.json());

app.use('/webhook', webhookRouter);

app.get('/', (req, res) => res.send('Bot de atendimento WhatsApp + CRM rodando.'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
