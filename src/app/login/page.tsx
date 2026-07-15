"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock } from "lucide-react";

function Bubble({
  text,
  top,
  left,
  right,
  bottom,
  rotate = 0,
  tail = "bottom",
}: {
  text: string;
  top?: string; left?: string; right?: string; bottom?: string;
  rotate?: number;
  tail?: "bottom" | "top" | "left" | "right";
}) {
  const tailClass = {
    bottom: "absolute -bottom-2.5 left-1/2 -translate-x-1/2 border-l-[10px] border-r-[10px] border-t-[12px] border-l-transparent border-r-transparent border-t-[#f0dfc4]",
    top:    "absolute -top-2.5 left-1/2 -translate-x-1/2 border-l-[10px] border-r-[10px] border-b-[12px] border-l-transparent border-r-transparent border-b-[#f0dfc4]",
    left:   "absolute top-1/2 -left-2.5 -translate-y-1/2 border-t-[10px] border-b-[10px] border-r-[12px] border-t-transparent border-b-transparent border-r-[#f0dfc4]",
    right:  "absolute top-1/2 -right-2.5 -translate-y-1/2 border-t-[10px] border-b-[10px] border-l-[12px] border-t-transparent border-b-transparent border-l-[#f0dfc4]",
  }[tail];

  return (
    <div
      className="absolute select-none"
      style={{ top, left, right, bottom, transform: `rotate(${rotate}deg)`, zIndex: 10 }}
    >
      <div className="relative px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg"
        style={{ background: "#f0dfc4", color: "#2a1204", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
        {text}
        <div className={tailClass} />
      </div>
    </div>
  );
}

function CrossIcon({ style }: { style: React.CSSProperties }) {
  return (
    <div className="absolute select-none" style={{ ...style, zIndex: 10 }}>
      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
        style={{ background: "#1a0c07", border: "2px solid #7c2d12", color: "#ea580c", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>
        ✝
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [valor, setValor] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [erro, setErro] = useState(false);
  const [shake, setShake] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valor) return;
    setCarregando(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: valor }),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setErro(true);
        setShake(true);
        setValor("");
        setTimeout(() => { setShake(false); setErro(false); }, 700);
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "#140a05" }}
    >
      {/* Bolhas decorativas */}
      <Bubble text="Cuidar"  top="8%"  left="6%"   rotate={-6} tail="bottom" />
      <Bubble text="Amar"   top="12%" left="44%"  rotate={2}  tail="bottom" />
      <Bubble text="Servir" top="72%" left="5%"   rotate={-3} tail="top" />
      <Bubble text="Amar"   bottom="6%" right="4%"  rotate={4}  tail="top" />
      <Bubble text="Orar"   top="55%" right="5%"  rotate={-5} tail="left" />
      <CrossIcon style={{ top: "6%", right: "6%" }} />

      {/* Glow de fundo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #ea580c 0%, transparent 70%)" }} />
      </div>

      {/* Card */}
      <div
        className={`relative z-20 w-full max-w-md mx-4 rounded-2xl overflow-hidden ${shake ? "animate-shake" : ""}`}
        style={{
          background: "#1c1008",
          border: "1.5px solid #c2410c",
          boxShadow: "0 0 0 1px rgba(234,88,12,0.15), 0 32px 64px rgba(0,0,0,0.7), 0 0 80px rgba(234,88,12,0.08)",
        }}
      >
        {/* Linha de borda superior laranja */}
        <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, transparent, #f97316, #ea580c, #f97316, transparent)" }} />

        <div className="px-10 py-10 flex flex-col items-center">
          {/* Logo */}
          <div className="relative mb-5">
            <div
              className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center"
              style={{
                background: "#ea580c",
                boxShadow: "0 0 0 4px rgba(234,88,12,0.3), 0 0 32px rgba(234,88,12,0.4)",
              }}
            >
              <Image src="/hermom.png" alt="Igreja Hermom" width={96} height={96} className="object-cover w-full h-full" />
            </div>
          </div>

          {/* Nome */}
          <h1 className="text-white font-bold text-3xl tracking-tight mb-1">Igreja Hermom</h1>
          <p className="text-lg mb-4" style={{ color: "#f97316", fontStyle: "italic", fontFamily: "Georgia, serif" }}>
            Amar · Servir · Cuidar
          </p>

          {/* Divisor */}
          <div className="w-full h-px mb-4" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }} />

          {/* Label sistema */}
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            Acampa Hermom 2026
          </p>
          <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>
            Faça login para acessar o sistema.
          </p>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="w-full space-y-3">
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
              <input
                type={mostrar ? "text" : "password"}
                value={valor}
                onChange={(e) => { setValor(e.target.value); setErro(false); }}
                placeholder="Digite o PIN de acesso"
                autoFocus
                autoComplete="off"
                className="w-full rounded-xl pl-11 pr-12 py-4 text-white text-base tracking-widest placeholder-white/20 focus:outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: erro ? "1px solid rgba(248,113,113,0.6)" : "1px solid rgba(255,255,255,0.1)",
                  boxShadow: erro ? "0 0 0 3px rgba(248,113,113,0.1)" : "none",
                }}
              />
              <button type="button" tabIndex={-1} onClick={() => setMostrar(!mostrar)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "rgba(255,255,255,0.3)" }}>
                {mostrar ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {erro && (
              <p className="text-red-400 text-xs text-center">PIN incorreto. Tente novamente.</p>
            )}

            <button
              type="submit"
              disabled={carregando || !valor}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl py-4 font-bold text-base transition-all duration-200"
              style={{
                background: carregando ? "rgba(30,58,95,0.7)" : "#1e3a5f",
                color: "white",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                opacity: !valor ? 0.5 : 1,
              }}
            >
              {carregando ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Entrando...</>
              ) : (
                <><span>🔒</span> Entrar no Sistema</>
              )}
            </button>
          </form>

          <p className="text-xs mt-8" style={{ color: "rgba(255,255,255,0.2)" }}>
            Use o PIN definido pelo administrador.
          </p>
        </div>
      </div>
    </div>
  );
}
