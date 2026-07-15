"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import LoginPage, { STORAGE_KEY } from "./LoginPage";

function lerAuth(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname.startsWith("/autorizacao/assinar/");

  // mounted evita renderizar conteúdo no SSR antes de checar sessionStorage
  const [mounted, setMounted] = useState(false);
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    setAutenticado(lerAuth());
    setMounted(true);
  }, []);

  // Página pública (assinatura de autorização) — sem proteção
  if (isPublic) return <>{children}</>;

  // Aguarda montar no client para não mostrar flash do conteúdo protegido
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #431407 0%, #7c2d12 30%, #9a3412 60%, #c2410c 100%)" }}>
        <div className="w-8 h-8 border-2 border-orange-300/40 border-t-orange-300 rounded-full animate-spin" />
      </div>
    );
  }

  if (!autenticado) {
    return <LoginPage onSuccess={() => setAutenticado(true)} />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen">{children}</main>
    </div>
  );
}
