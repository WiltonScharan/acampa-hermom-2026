"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import clsx from "clsx";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const semSidebar = pathname === "/login" || pathname.startsWith("/autorizacao/assinar/");
  const [liberado, setLiberado] = useState(semSidebar);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (semSidebar) return;
    if (sessionStorage.getItem("acampa_tab")) {
      setLiberado(true);
    } else {
      fetch("/api/logout", { method: "POST" }).finally(() => {
        window.location.href = "/";
      });
    }
  }, [semSidebar]);

  // Fecha sidebar ao navegar no mobile
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!liberado) return null;
  if (semSidebar) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Backdrop mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main
        className={clsx(
          "flex-1 min-h-screen min-w-0 transition-[margin] duration-300",
          collapsed ? "md:ml-16" : "md:ml-60"
        )}
      >
        {/* Barra superior mobile */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 flex-shrink-0"
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
          <span className="font-bold text-primary-700 text-base truncate">Acampa Hermom 2026</span>
        </header>

        {children}
      </main>
    </div>
  );
}
