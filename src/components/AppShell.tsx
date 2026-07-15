"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const semSidebar = pathname === "/login" || pathname.startsWith("/autorizacao/assinar/");

  // Começa como false para páginas protegidas — não renderiza nada até confirmar sessão
  const [liberado, setLiberado] = useState(semSidebar);

  useEffect(() => {
    if (semSidebar) return;

    if (sessionStorage.getItem("acampa_tab")) {
      setLiberado(true);
    } else {
      // Sem flag de sessão: limpa cookie e manda para login
      fetch("/api/logout", { method: "POST" }).finally(() => {
        window.location.href = "/";
      });
    }
  }, [semSidebar]);

  if (!liberado) return null;

  if (semSidebar) return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen">{children}</main>
    </div>
  );
}
