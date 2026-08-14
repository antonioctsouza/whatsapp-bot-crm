const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `Você classifica mensagens de clientes de uma empresa que faz atendimento via WhatsApp.
Responda APENAS com uma destas palavras, sem explicação:
- support (dúvida, problema, reclamação, suporte técnico)
- sales (interesse em comprar, pedir orçamento, conhecer produtos)
- scheduling (marcar, remarcar ou cancelar um horário/agendamento)
- other (saudação, conversa fora desses temas)`;

async function classifyIntent(message) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 10,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: message }],
    }),
  });

  if (!res.ok) {
    console.error('Erro ao classificar intenção:', await res.text());
    return 'other';
  }

  const data = await res.json();
  const intent = data.content?.[0]?.text?.trim().toLowerCase();

  return ['support', 'sales', 'scheduling'].includes(intent) ? intent : 'other';
}

module.exports = { classifyIntent };
