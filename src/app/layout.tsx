import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Acampa Hermom 2026",
  description: "Gestão de inscrições do Acampamento Hermom 2026",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-60 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
