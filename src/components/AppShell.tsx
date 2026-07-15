"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import LoginPage, { STORAGE_KEY } from "./LoginPage";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname.startsWith("/autorizacao/assinar/");
  const [autenticado, setAutenticado] = useState<boolean | null>(null);

  useEffect(() => {
    const ok = sessionStorage.getItem(STORAGE_KEY) === "1";
    setAutenticado(ok);
  }, []);

  if (isPublic) return <>{children}</>;

  // Aguarda hidratação para evitar flash
  if (autenticado === null) return null;

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
