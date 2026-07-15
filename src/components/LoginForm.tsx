"use client";
import { useState } from "react";

export default function LoginForm() {
  const [pin, setPin] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [erro, setErro] = useState(false);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pin || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        window.location.href = "/";
      } else {
        setErro(true);
        setShake(true);
        setPin("");
        setTimeout(() => { setShake(false); setErro(false); }, 700);
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "16px",
    }}>
      <div style={{
        background: "white",
        borderRadius: "20px",
        padding: "48px 40px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
        animation: shake ? "shake 0.5s ease-in-out" : "none",
      }}>
        {/* Ícone e título */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            width: "72px",
            height: "72px",
            background: "linear-gradient(135deg, #ea580c, #f97316)",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
            margin: "0 auto 20px",
            boxShadow: "0 8px 24px rgba(234,88,12,0.35)",
          }}>
            ⛺
          </div>
          <h1 style={{
            fontSize: "22px",
            fontWeight: "800",
            color: "#0f172a",
            margin: "0 0 6px",
            letterSpacing: "-0.5px",
          }}>
            Acampa Hermom 2026
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            Acesse o sistema de gestão
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <label style={{
            display: "block",
            fontSize: "13px",
            fontWeight: "600",
            color: "#374151",
            marginBottom: "8px",
          }}>
            PIN de acesso
          </label>

          <div style={{ position: "relative", marginBottom: "12px" }}>
            <input
              type={mostrar ? "text" : "password"}
              value={pin}
              onChange={e => { setPin(e.target.value); setErro(false); }}
              placeholder="••••••••"
              autoFocus
              autoComplete="off"
              style={{
                width: "100%",
                padding: "14px 48px 14px 16px",
                fontSize: "18px",
                border: `2px solid ${erro ? "#ef4444" : "#e2e8f0"}`,
                borderRadius: "12px",
                outline: "none",
                boxSizing: "border-box",
                letterSpacing: mostrar ? "normal" : "0.3em",
                color: "#0f172a",
                background: erro ? "#fef2f2" : "#f8fafc",
                transition: "border-color 0.2s",
              }}
            />
            <button
              type="button"
              onClick={() => setMostrar(!mostrar)}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                fontSize: "20px",
                padding: "4px",
                lineHeight: 1,
              }}
            >
              {mostrar ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>

          {erro && (
            <p style={{
              color: "#ef4444",
              fontSize: "13px",
              margin: "0 0 14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}>
              ✕ PIN incorreto. Tente novamente.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !pin}
            style={{
              width: "100%",
              padding: "15px",
              background: !pin || loading
                ? "#cbd5e1"
                : "linear-gradient(135deg, #1e3a5f, #2563eb)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "700",
              cursor: !pin || loading ? "not-allowed" : "pointer",
              marginTop: erro ? "0" : "4px",
              transition: "all 0.2s",
              letterSpacing: "0.3px",
            }}
          >
            {loading ? "Verificando..." : "Entrar no Sistema"}
          </button>
        </form>

        <p style={{
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "12px",
          marginTop: "28px",
          marginBottom: 0,
        }}>
          Igreja Hermom · Sistema Restrito
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-8px); }
          30%       { transform: translateX(8px); }
          45%       { transform: translateX(-6px); }
          60%       { transform: translateX(6px); }
          75%       { transform: translateX(-3px); }
          90%       { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
}
