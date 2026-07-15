"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, Lock } from "lucide-react";

function Bubble({ text, style }: { text: string; style: React.CSSProperties }) {
  return (
    <div className="absolute select-none" style={{ ...style, zIndex: 5 }}>
      <div
        className="relative px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg"
        style={{ background: "#f0dfc4", color: "#2a1204" }}
      >
        {text}
        <div
          className="absolute -bottom-2.5 left-1/2 -translate-x-1/2"
          style={{
            width: 0, height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: "12px solid #f0dfc4",
          }}
        />
      </div>
    </div>
  );
}

export default function LoginForm() {
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
        window.location.href = "/";
      } else {
        setErro(true);
        setShake(true);
        setValor("");
        setTimeout(() => { setShake(false); setErro(false); }, 700);
      }
    } catch {
      setCarregando(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "#140a05" }}
    >
      {/* Bolhas decorativas */}
      <Bubble text="Cuidar" style={{ top: "8%",  left: "6%",  transform: "rotate(-6deg)" }} />
      <Bubble text="Amar"   style={{ top: "10%", left: "44%", transform: "rotate(2deg)"  }} />
      <Bubble text="Amar"   style={{ bottom: "6%", right: "3%", transform: "rotate(4deg)" }} />

      {/* Cruz decorativa */}
      <div
        className="absolute select-none"
        style={{ top: "6%", right: "6%", zIndex: 5 }}
      >
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
          style={{
            background: "#1a0c07",
            border: "2px solid #7c2d12",
            color: "#ea580c",
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          ✝
        </div>
      </div>

      {/* Glow central */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(234,88,12,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Card */}
      <div
        className={`relative z-10 w-full max-w-md mx-4 rounded-2xl overflow-hidden ${shake ? "animate-shake" : ""}`}
        style={{
          background: "#1c1008",
          border: "1.5px solid #c2410c",
          boxShadow: "0 0 0 1px rgba(234,88,12,0.1), 0 32px 64px rgba(0,0,0,0.7)",
        }}
      >
        {/* Linha topo */}
        <div
          className="h-[3px] w-full"
          style={{ background: "linear-gradient(90deg, transparent, #f97316, #ea580c, #f97316, transparent)" }}
        />

        <div className="px-10 py-10 flex flex-col items-center">
          {/* Logo */}
          <div
            className="w-24 h-24 rounded-full overflow-hidden mb-5 flex-shrink-0"
            style={{
              background: "#ea580c",
              boxShadow: "0 0 0 4px rgba(234,88,12,0.3), 0 0 32px rgba(234,88,12,0.35)",
            }}
          >
            <Image src="/hermom.png" alt="Igreja Hermom" width={96} height={96} className="object-cover w-full h-full" />
          </div>

          {/* Nome */}
          <h1 className="text-white font-bold text-3xl tracking-tight mb-1">Igreja Hermom</h1>

          {/* Slogan */}
          <p
            className="text-lg mb-4"
            style={{ color: "#f97316", fontStyle: "italic", fontFamily: "Georgia, serif" }}
          >
            Amar · Servir · Cuidar
          </p>

          {/* Divisor */}
          <div
            className="w-full h-px mb-4"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }}
          />

          {/* Label */}
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
            Acampa Hermom 2026
          </p>
          <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.45)" }}>
            Faça login para acessar o sistema.
          </p>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="w-full space-y-3">
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(255,255,255,0.3)" }}
              />
              <input
                type={mostrar ? "text" : "password"}
                value={valor}
                onChange={(e) => { setValor(e.target.value); setErro(false); }}
                placeholder="Digite o PIN de acesso"
                autoFocus
                autoComplete="off"
                className="w-full rounded-xl pl-11 pr-12 py-4 text-white text-base placeholder-white/20 focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: erro ? "1px solid rgba(248,113,113,0.6)" : "1px solid rgba(255,255,255,0.1)",
                  outline: "none",
                  letterSpacing: mostrar ? "normal" : "0.15em",
                }}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setMostrar(!mostrar)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {mostrar ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {erro && (
              <p className="text-red-400 text-xs text-center">PIN incorreto. Tente novamente.</p>
            )}

            <button
              type="submit"
              disabled={carregando || !valor}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl py-4 font-bold text-base text-white transition-all"
              style={{
                background: "#1e3a5f",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                opacity: !valor ? 0.5 : 1,
              }}
            >
              {carregando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <><span>🔒</span> Entrar como Administrador</>
              )}
            </button>
          </form>

          <p className="text-xs mt-8" style={{ color: "rgba(255,255,255,0.2)" }}>
            Use as credenciais definidas pelo administrador.
          </p>
        </div>
      </div>
    </div>
  );
}
