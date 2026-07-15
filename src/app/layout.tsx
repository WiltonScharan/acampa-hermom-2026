import type { Metadata } from "next";
import "./globals.css";
import { headers } from "next/headers";
import AppShell from "@/components/AppShell";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Acampa Hermom 2026",
  description: "Gestão de inscrições do Acampamento Hermom 2026",
};

// Força renderização dinâmica em TODA a aplicação — nunca cache
export const dynamic = "force-dynamic";
export const revalidate = 0;

const TOKEN = "acampa_v5_final";

function lerCookie(cookieHeader: string, nome: string): string | null {
  const partes = cookieHeader.split(";");
  for (const parte of partes) {
    const [chave, valor] = parte.trim().split("=");
    if (chave?.trim() === nome) return valor?.trim() ?? null;
  }
  return null;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie") ?? "";
  const isAuth = lerCookie(cookieHeader, "acampa_auth") === TOKEN;

  return (
    <html lang="pt-BR">
      <body>
        {isAuth ? <AppShell>{children}</AppShell> : <LoginForm />}
      </body>
    </html>
  );
}
