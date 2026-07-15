"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, Lock, ArrowRight } from "lucide-react";

const PIN = "wDj@180115";
export const STORAGE_KEY = "acampa_hermom_auth";

export default function LoginPage({ onSuccess }: { onSuccess: () => void }) {
  const [valor, setValor] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [erro, setErro] = useState(false);
  const [shake, setShake] = useState(false);
  const [carregando, setCarregando] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (valor === PIN) {
      setCarregando(true);
      sessionStorage.setItem(STORAGE_KEY, "1");
      setTimeout(() => onSuccess(), 400);
    } else {
      setErro(true);
      setShake(true);
      setValor("");
      setTimeout(() => { setShake(false); setErro(false); }, 800);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #431407 0%, #7c2d12 30%, #9a3412 60%, #c2410c 100%)" }}>

      {/* Blobs de fundo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #fb923c, transparent)" }} />
        <div className="absolute -bottom-40 -right-20 w-[600px] h-[600px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #f97316, transparent)" }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #fbbf24, transparent)" }} />
        {/* Linhas decorativas sutis */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Card principal */}
      <div
        className={`relative z-10 w-full max-w-sm mx-4 ${shake ? "animate-shake" : ""}`}
        style={{ filter: "drop-shadow(0 25px 60px rgba(0,0,0,0.5))" }}
      >
        {/* Borda luminosa */}
        <div className="absolute inset-0 rounded-3xl" style={{ background: "linear-gradient(135deg, rgba(251,146,60,0.4), rgba(255,255,255,0.05), rgba(194,65,12,0.3))", padding: "1px" }}>
          <div className="w-full h-full rounded-3xl" style={{ background: "rgba(0,0,0,0.01)" }} />
        </div>

        <div className="relative rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.12)" }}>

          {/* Faixa superior decorativa */}
          <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #f97316, #fb923c, #fbbf24, #fb923c, #ea580c)" }} />

          <div className="px-10 pt-10 pb-10">
            {/* Logo + nome */}
            <div className="flex flex-col items-center mb-10">
              <div className="relative mb-5" style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.4))" }}>
                <div className="w-24 h-24 rounded-2xl overflow-hidden" style={{ boxShadow: "0 0 0 3px rgba(251,146,60,0.4), 0 0 0 6px rgba(251,146,60,0.1)" }}>
                  <Image src="/hermom.png" alt="Igreja Hermom" width={96} height={96} className="object-cover w-full h-full" />
                </div>
                {/* Brilho no logo */}
                <div className="absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)" }} />
              </div>

              <h1 className="text-white font-bold text-2xl tracking-tight leading-none">Acampa Hermom</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-px w-8" style={{ background: "rgba(251,146,60,0.5)" }} />
                <p className="text-orange-300 text-xs font-medium tracking-widest uppercase">2026</p>
                <div className="h-px w-8" style={{ background: "rgba(251,146,60,0.5)" }} />
              </div>
              <p className="text-white/40 text-xs mt-1.5">Gestão de Inscrições</p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-orange-200/80 text-xs font-semibold uppercase tracking-widest mb-2.5">
                  <Lock size={11} />
                  PIN de acesso
                </label>
                <div className="relative">
                  <input
                    type={mostrar ? "text" : "password"}
                    value={valor}
                    onChange={(e) => { setValor(e.target.value); setErro(false); }}
                    placeholder="••••••••••"
                    autoFocus
                    autoComplete="off"
                    className="w-full rounded-xl px-4 py-3.5 pr-12 text-white text-lg tracking-widest placeholder-white/20 focus:outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: erro ? "1px solid rgba(248,113,113,0.7)" : "1px solid rgba(255,255,255,0.15)",
                      boxShadow: erro ? "0 0 0 3px rgba(248,113,113,0.15)" : "inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                    onFocus={(e) => { e.currentTarget.style.border = erro ? "1px solid rgba(248,113,113,0.7)" : "1px solid rgba(251,146,60,0.6)"; e.currentTarget.style.boxShadow = erro ? "0 0 0 3px rgba(248,113,113,0.15)" : "0 0 0 3px rgba(251,146,60,0.15)"; }}
                    onBlur={(e) => { e.currentTarget.style.border = erro ? "1px solid rgba(248,113,113,0.7)" : "1px solid rgba(255,255,255,0.15)"; e.currentTarget.style.boxShadow = erro ? "0 0 0 3px rgba(248,113,113,0.15)" : "inset 0 1px 0 rgba(255,255,255,0.05)"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrar(!mostrar)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors p-0.5"
                    tabIndex={-1}
                  >
                    {mostrar ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {erro && (
                  <p className="flex items-center gap-1 text-red-300 text-xs mt-2">
                    <span className="text-red-400">✕</span> PIN incorreto. Tente novamente.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={carregando || valor.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-base text-white transition-all duration-200 disabled:opacity-40"
                style={{ background: carregando ? "rgba(234,88,12,0.6)" : "linear-gradient(135deg, #ea580c, #f97316)", boxShadow: "0 4px 20px rgba(234,88,12,0.4)" }}
                onMouseEnter={(e) => { if (!carregando) e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(234,88,12,0.55)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(234,88,12,0.4)"; }}
              >
                {carregando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Rodapé */}
            <p className="text-center text-white/20 text-xs mt-8">
              Igreja Hermom · 19–22 Nov 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
