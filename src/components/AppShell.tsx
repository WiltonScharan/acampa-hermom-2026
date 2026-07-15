"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Se não há flag de sessão desta aba, força logout e redireciona para login
    if (!sessionStorage.getItem("acampa_tab")) {
      fetch("/api/logout", { method: "POST" }).finally(() => {
        window.location.href = "/";
      });
    }
  }, []);

  const semSidebar =
    pathname === "/login" ||
    pathname.startsWith("/autorizacao/assinar/");

  if (semSidebar) return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen">{children}</main>
    </div>
  );
}
