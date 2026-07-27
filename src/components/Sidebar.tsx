"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Home, Star, Baby, PersonStanding, User, Bus,
  ChevronLeft, ChevronRight, Tent, Info, FileText, ListOrdered, Ban,
  NotebookPen, LogOut, X,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inscritos", label: "Inscritos", icon: Users },
  { href: "/village", label: "Village", icon: Home },
  { href: "/lista-espera", label: "Lista de Espera Village", icon: ListOrdered },
  { href: "/melhor-idade", label: "Melhor Idade 60+", icon: Star },
  { href: "/criancas", label: "Crianças até 05", icon: Baby },
  { href: "/adolescentes-06-10", label: "Adolesc. 06-10", icon: PersonStanding },
  { href: "/adolescentes-11-14", label: "Adolesc. 11-14", icon: PersonStanding },
  { href: "/jovens", label: "Jovens 15-29", icon: User },
  { href: "/homens", label: "Homens 30-59", icon: User },
  { href: "/mulheres", label: "Mulheres 30-59", icon: User },
  { href: "/onibus", label: "Ônibus", icon: Bus },
  { href: "/cancelados", label: "Cancelados", icon: Ban },
  { href: "/autorizacao", label: "Autorização Menores", icon: FileText },
  { href: "/informacoes", label: "Informações", icon: Info },
  { href: "/anotacoes", label: "Anotações", icon: NotebookPen },
  { href: "/base-de-dados", label: "Base de Dados", icon: Tent },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (v: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onCollapsedChange, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        "fixed left-0 top-0 h-full bg-white border-r border-gray-200 flex flex-col z-40",
        "transition-transform md:transition-all duration-300",
        // Mobile: desliza para dentro/fora
        mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        // Desktop: sempre visível, ignora translate
        "md:translate-x-0",
        // Largura: no mobile usa 288px, no desktop respeita collapsed
        "w-72",
        collapsed ? "md:w-16" : "md:w-60",
      )}
    >
      {/* Logo */}
      <div className={clsx(
        "flex items-center gap-3 border-b border-gray-100 flex-shrink-0",
        collapsed ? "md:px-3 md:py-3 md:justify-center px-4 py-3" : "px-4 py-3"
      )}>
        <div className={clsx(
          "flex-shrink-0 relative",
          collapsed ? "md:w-9 md:h-9 w-10 h-10" : "w-10 h-10"
        )}>
          <Image src="/hermom.png" alt="Igreja Hermom" fill className="rounded-xl object-cover" />
        </div>
        <div className={clsx("overflow-hidden flex-1", collapsed ? "md:hidden" : "")}>
          <p className="font-bold text-primary-700 text-base leading-tight">Acampa</p>
          <p className="text-xs text-gray-500 leading-tight">Hermom 2026</p>
        </div>
        {/* Fechar — apenas mobile */}
        <button
          onClick={onMobileClose}
          className="md:hidden flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className={clsx("flex-shrink-0", active ? "text-primary-600" : "text-gray-400")} />
              <span className={clsx("truncate", collapsed ? "md:hidden" : "")}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Botão sair */}
      <button
        onClick={async () => {
          sessionStorage.clear();
          await fetch("/api/logout", { method: "POST" });
          window.location.href = "/";
        }}
        className={clsx(
          "flex items-center gap-3 mx-2 mb-1 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors flex-shrink-0",
          collapsed ? "md:justify-center" : ""
        )}
        title={collapsed ? "Sair" : undefined}
      >
        <LogOut size={18} className="flex-shrink-0" />
        <span className={clsx(collapsed ? "md:hidden" : "")}>Sair</span>
      </button>

      {/* Colapsar — apenas desktop */}
      <button
        onClick={() => onCollapsedChange(!collapsed)}
        className="hidden md:flex items-center justify-center py-3 border-t border-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
}
