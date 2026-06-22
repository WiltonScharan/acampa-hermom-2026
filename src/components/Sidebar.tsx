"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Home,
  Star,
  Baby,
  PersonStanding,
  User,
  Bus,
  ChevronLeft,
  ChevronRight,
  Tent,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inscritos", label: "Inscritos", icon: Users },
  { href: "/village", label: "Village", icon: Home },
  { href: "/melhor-idade", label: "Melhor Idade 60+", icon: Star },
  { href: "/criancas", label: "Crianças até 05", icon: Baby },
  { href: "/adolescentes-06-10", label: "Adolesc. 06-10", icon: PersonStanding },
  { href: "/adolescentes-11-14", label: "Adolesc. 11-14", icon: PersonStanding },
  { href: "/jovens", label: "Jovens 15-29", icon: User },
  { href: "/homens", label: "Homens 30-59", icon: User },
  { href: "/mulheres", label: "Mulheres 30-59", icon: User },
  { href: "/onibus", label: "Ônibus", icon: Bus },
  { href: "/base-de-dados", label: "Base de Dados", icon: Tent },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        "fixed left-0 top-0 h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <Image
          src="/hermom.png"
          alt="Igreja Hermom"
          width={36}
          height={36}
          className="rounded-full flex-shrink-0 object-cover"
        />
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-primary-700 text-sm leading-tight">Acampa</p>
            <p className="text-xs text-gray-500 leading-tight">Hermom 2026</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon
                size={18}
                className={clsx("flex-shrink-0", active ? "text-primary-600" : "text-gray-400")}
              />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-3 border-t border-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
}
