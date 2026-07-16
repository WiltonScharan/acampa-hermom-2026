"use client";

import { useState, useEffect } from "react";
import { useInscricoes } from "@/hooks/useInscricoes";
import { formatarMoeda } from "@/lib/utils";
import { InscricaoComCalculo } from "@/types";
import { TrendingUp, Users, Calendar, Eye, EyeOff } from "lucide-react";

function ToggleSwitch({ visivel, onToggle }: { visivel: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      title={visivel ? "Ocultar valores" : "Mostrar valores"}
      style={{
        position: "relative",
        width: "52px",
        height: "28px",
        borderRadius: "14px",
        background: visivel ? "#f97316" : "#e2e8f0",
        border: "none",
        cursor: "pointer",
        transition: "background 0.25s",
        flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute",
        top: "3px",
        left: "3px",
        width: "22px",
        height: "22px",
        borderRadius: "50%",
        background: "white",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        transition: "transform 0.25s",
        transform: visivel ? "translateX(24px)" : "translateX(0)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {visivel
          ? <Eye size={11} color="#ea580c" />
          : <EyeOff size={11} color="#9ca3af" />
        }
      </span>
    </button>
  );
}

interface CardAnalProps {
  label: string;
  children: React.ReactNode;
  accent?: boolean;
}

function CardAnal({ label, children, accent }: CardAnalProps) {
  return (
    <div className={`rounded-xl p-4 border ${accent ? "bg-primary-600 border-primary-600 text-white" : "bg-primary-500 border-primary-500 text-white"}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-90 mb-2">{label}</p>
      <div className="space-y-1 text-sm font-medium">{children}</div>
    </div>
  );
}

function Linha({ label, valor }: { label: string; valor: string | number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="opacity-90">{label}:</span>
      <span className="font-bold">{valor}</span>
    </div>
  );
}

function CardFinanceiro({ label, valor, sub, cor, oculto }: { label: string; valor: string; sub?: string; cor?: string; oculto?: boolean }) {
  return (
    <div className="card text-center">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${oculto ? "text-gray-300" : (cor ?? "text-gray-800")}`}>
        {oculto ? "— — —" : valor}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{oculto ? "" : sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { inscricoes, loading } = useInscricoes();
  const [mostrarResumo, setMostrarResumo] = useState(false);

  // Lê do sessionStorage após montar — persiste na aba, some ao fechar ou sair
  useEffect(() => {
    setMostrarResumo(sessionStorage.getItem("dashboard_resumo") === "1");
  }, []);

  function toggleResumo() {
    const novo = !mostrarResumo;
    setMostrarResumo(novo);
    sessionStorage.setItem("dashboard_resumo", novo ? "1" : "0");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  // Cancelados ficam separados — não entram nos totais do evento
  const ativos = inscricoes.filter((i) => i.status !== "cancelado");
  const cancelados = inscricoes.filter((i) => i.status === "cancelado");

  const total = ativos.length;
  const homens = ativos.filter((i) => i.genero === "masculino").length;
  const mulheres = ativos.filter((i) => i.genero === "feminino").length;

  const village = ativos.filter((i) => i.tipoQuarto === "village");
  const casaisVillage = new Set(village.map((i) => i.nomeComprador.toLowerCase())).size;

  const melhorIdadeMasc = ativos.filter((i) => i.categoria === "melhor_idade_60" && i.genero === "masculino").length;
  const melhorIdadeFem = ativos.filter((i) => i.categoria === "melhor_idade_60" && i.genero === "feminino").length;

  const criancasMasc = ativos.filter((i) => i.categoria === "criancas_ate_05" && i.genero === "masculino").length;
  const criancasFem = ativos.filter((i) => i.categoria === "criancas_ate_05" && i.genero === "feminino").length;

  const adol0610Masc = ativos.filter((i) => i.categoria === "adolescentes_06_10" && i.genero === "masculino").length;
  const adol0610Fem = ativos.filter((i) => i.categoria === "adolescentes_06_10" && i.genero === "feminino").length;

  const adol1114Masc = ativos.filter((i) => i.categoria === "adolescentes_11_14" && i.genero === "masculino").length;
  const adol1114Fem = ativos.filter((i) => i.categoria === "adolescentes_11_14" && i.genero === "feminino").length;

  const jovensMasc = ativos.filter((i) => i.categoria === "jovens_15_29" && i.genero === "masculino").length;
  const jovensFem = ativos.filter((i) => i.categoria === "jovens_15_29" && i.genero === "feminino").length;

  const adultosMasc = ativos.filter((i) => i.categoria === "adultos_30_59" && i.genero === "masculino").length;
  const adultosFem = ativos.filter((i) => i.categoria === "adultos_30_59" && i.genero === "feminino").length;

  const onibusTotal = ativos.filter((i) => i.onibus).length;
  const onibusMasc = ativos.filter((i) => i.onibus && i.genero === "masculino").length;
  const onibusFem = ativos.filter((i) => i.onibus && i.genero === "feminino").length;

  const confirmados = ativos.filter((i) => i.status === "confirmado").length;
  const pendentes = ativos.filter((i) => i.status === "pendente").length;

  const totalArrecadar = ativos.reduce((s, i) => s + i.valorTotal, 0);
  const totalPago = ativos.reduce((s, i) => s + i.valorPago, 0);
  const totalAPagar = ativos.reduce((s, i) => s + i.valorAPagar, 0);
  const totalDevolvidos = inscricoes.reduce((s, i) => s + (i.valorDevolvido || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Acampa Hermom 2026</h1>
          <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
            <Calendar size={14} />
            19 a 22 de novembro de 2026 · Monte Horebe, Cesário Lange/SP
          </p>
        </div>
        <ToggleSwitch visivel={mostrarResumo} onToggle={toggleResumo} />
      </div>

      {/* Financeiro — sempre visível, valores mascarados quando oculto */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <CardFinanceiro label="Total Inscritos" valor={String(total)} sub={`${homens}H / ${mulheres}M`} oculto={!mostrarResumo} />
        <CardFinanceiro label="Total a Arrecadar" valor={formatarMoeda(totalArrecadar)} oculto={!mostrarResumo} />
        <CardFinanceiro label="Total Pago" valor={formatarMoeda(totalPago)} oculto={!mostrarResumo} />
        <CardFinanceiro label="A Receber" valor={formatarMoeda(totalAPagar)} sub={totalAPagar > 0 ? "pendente" : "quitado"} oculto={!mostrarResumo} />
        <CardFinanceiro label="Valores Devolvidos" valor={formatarMoeda(totalDevolvidos)} cor="text-orange-600" oculto={!mostrarResumo} />
      </div>

      {/* Status */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Confirmados</p>
          <p className={`text-2xl font-bold ${mostrarResumo ? "text-green-600" : "text-gray-300"}`}>
            {mostrarResumo ? confirmados : "—"}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pendentes</p>
          <p className={`text-2xl font-bold ${mostrarResumo ? "text-yellow-600" : "text-gray-300"}`}>
            {mostrarResumo ? pendentes : "—"}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Cancelados</p>
          <p className={`text-2xl font-bold ${mostrarResumo ? "text-red-600" : "text-gray-300"}`}>
            {mostrarResumo ? cancelados.length : "—"}
          </p>
        </div>
      </div>

      {/* Grid analítico — apenas ativos */}
      <div>
        <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
          <TrendingUp size={18} className="text-primary-600" />
          Distribuição por Categoria
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <CardAnal label="Total Inscritos" accent>
            <Linha label="Inscritos" valor={total} />
            <Linha label="Homens" valor={homens} />
            <Linha label="Mulheres" valor={mulheres} />
          </CardAnal>

          <CardAnal label="Village">
            <Linha label="Casais" valor={`${casaisVillage} (${village.length} pess.)`} />
          </CardAnal>

          <CardAnal label="Melhor Idade 60+">
            <Linha label="Homens" valor={melhorIdadeMasc} />
            <Linha label="Mulheres" valor={melhorIdadeFem} />
          </CardAnal>

          <CardAnal label="Homens 30-59">
            <Linha label="Homens" valor={adultosMasc} />
          </CardAnal>

          <CardAnal label="Mulheres 30-59">
            <Linha label="Mulheres" valor={adultosFem} />
          </CardAnal>

          <CardAnal label="Jovens 15-29">
            <Linha label="Homens" valor={jovensMasc} />
            <Linha label="Mulheres" valor={jovensFem} />
          </CardAnal>

          <CardAnal label="Adolesc. 11-14">
            <Linha label="Homens" valor={adol1114Masc} />
            <Linha label="Mulheres" valor={adol1114Fem} />
          </CardAnal>

          <CardAnal label="Adolesc. 06-10">
            <Linha label="Homens" valor={adol0610Masc} />
            <Linha label="Mulheres" valor={adol0610Fem} />
          </CardAnal>

          <CardAnal label="Crianças até 05">
            <Linha label="Meninos" valor={criancasMasc} />
            <Linha label="Meninas" valor={criancasFem} />
          </CardAnal>

          <CardAnal label="Ônibus">
            <Linha label="Total" valor={onibusTotal} />
            <Linha label="Homens" valor={onibusMasc} />
            <Linha label="Mulheres" valor={onibusFem} />
          </CardAnal>
        </div>
      </div>

      {total === 0 && (
        <div className="card text-center py-16 text-gray-400">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Nenhum inscrito ainda.</p>
          <p className="text-sm mt-1">Adicione inscrições na aba <strong>Inscritos</strong>.</p>
        </div>
      )}
    </div>
  );
}
