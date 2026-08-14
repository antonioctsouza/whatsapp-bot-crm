# Bot de atendimento WhatsApp + CRM próprio

Esboço funcional de um robô de atendimento para WhatsApp com CRM integrado, cobrindo três fluxos: **suporte**, **vendas** e **agendamento**, com escalonamento para atendimento humano.

## Estrutura

```
whatsapp-bot-crm/
├── schema.sql              # Tabelas do CRM (contacts, leads, tickets, appointments...)
├── server.js                # Servidor Express
├── routes/webhook.js        # Recebe mensagens do WhatsApp e orquestra o fluxo
├── lib/
│   ├── db.js                 # Conexão PostgreSQL
│   ├── whatsapp.js           # Envio de mensagens via Meta Cloud API
│   └── classifyIntent.js     # Classifica a intenção da mensagem usando IA (Anthropic)
└── handlers/
    ├── support.js            # Fluxo de suporte (tickets)
    ├── sales.js               # Fluxo de vendas (leads)
    └── scheduling.js          # Fluxo de agendamento
```

## Passo a passo para rodar

1. **Instalar dependências**
   ```bash
   npm install
   ```

2. **Criar o banco de dados**
   ```bash
   createdb whatsapp_crm
   psql whatsapp_crm < schema.sql
   ```

3. **Configurar variáveis de ambiente**
   Copie `.env.example` para `.env` e preencha com suas credenciais.

4. **Configurar o WhatsApp Cloud API**
   - Crie um app no [Meta for Developers](https://developers.facebook.com/)
   - Ative o produto WhatsApp e gere um token de acesso
   - Configure o webhook apontando para `https://SEU_DOMINIO/webhook`, usando o mesmo valor de `WHATSAPP_VERIFY_TOKEN` do seu `.env`
   - Inscreva-se no evento `messages`

5. **Rodar o servidor**
   ```bash
   npm start
   ```
   Para desenvolvimento local, use o [ngrok](https://ngrok.com/) para expor sua porta local com HTTPS (exigido pela Meta).

## Como o fluxo funciona

1. Cliente manda mensagem → chega no `/webhook`
2. O contato é criado/atualizado na tabela `contacts`
3. A mensagem é salva em `conversations`
4. Se o cliente pedir atendente humano, vai direto para `escalation_queue`
5. Caso contrário, a IA classifica a intenção (`support`, `sales`, `scheduling` ou `other`)
6. O handler correspondente processa a lógica e responde ao cliente

## Próximos passos sugeridos

- Painel web para atendentes visualizarem `escalation_queue` e conversas em tempo real
- Lógica real de disponibilidade de horários em `scheduling.js` (hoje é um esboço)
- Histórico de mensagens completo no card do contato (para o atendente ver contexto)
- Fila de mensagens (Redis/BullMQ) se o volume crescer
- Métricas: tempo médio de resposta, taxa de conversão por origem
