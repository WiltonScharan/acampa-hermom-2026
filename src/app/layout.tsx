import type { Metadata } from "next";
import "./globals.css";
import { cookies } from "next/headers";
import AppShell from "@/components/AppShell";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Acampa Hermom 2026",
  description: "Gestão de inscrições do Acampamento Hermom 2026",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isAuth = cookieStore.get("acampa_auth")?.value === "ok_hermom2026";

  return (
    <html lang="pt-BR">
      <body>
        {isAuth ? (
          <AppShell>{children}</AppShell>
        ) : (
          <LoginForm />
        )}
      </body>
    </html>
  );
}
