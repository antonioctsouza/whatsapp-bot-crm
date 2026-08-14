router.post('/', async (req, res) => {
  // Responde rápido para a Meta não reenviar o webhook
  res.sendStatus(200);

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const message = change?.messages?.[0];

    if (!message || message.type !== 'text') return;

    const phone = message.from;
    const text = message.text.body;
