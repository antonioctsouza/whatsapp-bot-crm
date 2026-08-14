require('dotenv').config();
const express = require('express');
const webhookRouter = require('./routes/webhook');

const app = express();
app.use(express.json());

app.use('/webhook', webhookRouter);

app.get('/', (req, res) => res.send('Bot de atendimento WhatsApp + CRM rodando.'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
