"use client";

import Image from "next/image";
import { useInscricoes } from "@/hooks/useInscricoes";
import { formatarMoeda } from "@/lib/utils";
import { InscricaoComCalculo } from "@/types";
import { TrendingUp, Users, DollarSign, Bus, Home, Calendar } from "lucide-react";

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

function CardFinanceiro({ label, valor, sub }: { label: string; valor: string; sub?: string }) {
  return (
    <div className="card text-center">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{valor}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { inscricoes, loading } = useInscricoes();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const total = inscricoes.length;
  const homens = inscricoes.filter((i) => i.genero === "masculino").length;
  const mulheres = inscricoes.filter((i) => i.genero === "feminino").length;

  const village = inscricoes.filter((i) => i.tipoQuarto === "village");
  const casaisVillage = new Set(village.map((i) => i.nomeComprador.toLowerCase())).size;

  const melhorIdadeMasc = inscricoes.filter((i) => i.categoria === "melhor_idade_60" && i.genero === "masculino").length;
  const melhorIdadeFem = inscricoes.filter((i) => i.categoria === "melhor_idade_60" && i.genero === "feminino").length;

  const criancasMasc = inscricoes.filter((i) => i.categoria === "criancas_ate_05" && i.genero === "masculino").length;
  const criancasFem = inscricoes.filter((i) => i.categoria === "criancas_ate_05" && i.genero === "feminino").length;

  const adol0610Masc = inscricoes.filter((i) => i.categoria === "adolescentes_06_10" && i.genero === "masculino").length;
  const adol0610Fem = inscricoes.filter((i) => i.categoria === "adolescentes_06_10" && i.genero === "feminino").length;

  const adol1114Masc = inscricoes.filter((i) => i.categoria === "adolescentes_11_14" && i.genero === "masculino").length;
  const adol1114Fem = inscricoes.filter((i) => i.categoria === "adolescentes_11_14" && i.genero === "feminino").length;

  const jovensMasc = inscricoes.filter((i) => i.categoria === "jovens_15_29" && i.genero === "masculino").length;
  const jovensFem = inscricoes.filter((i) => i.categoria === "jovens_15_29" && i.genero === "feminino").length;

  const adultosMasc = inscricoes.filter((i) => i.categoria === "adultos_30_59" && i.genero === "masculino").length;
  const adultosFem = inscricoes.filter((i) => i.categoria === "adultos_30_59" && i.genero === "feminino").length;

  const onibusTotal = inscricoes.filter((i) => i.onibus).length;
  const onibusMasc = inscricoes.filter((i) => i.onibus && i.genero === "masculino").length;
  const onibusFem = inscricoes.filter((i) => i.onibus && i.genero === "feminino").length;

  const confirmados = inscricoes.filter((i) => i.status === "confirmado").length;
  const pendentes = inscricoes.filter((i) => i.status === "pendente").length;
  const cancelados = inscricoes.filter((i) => i.status === "cancelado").length;

  const totalArrecadar = inscricoes.reduce((s, i) => s + i.valorTotal, 0);
  const totalPago = inscricoes.reduce((s, i) => s + i.valorPago, 0);
  const totalAPagar = inscricoes.reduce((s, i) => s + i.valorAPagar, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Image src="/hermom.png" alt="Hermom" width={56} height={56} className="rounded-xl object-cover" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Acampa Hermom 2026</h1>
          <p className="text-sm text-gray-500 flex items-center gap-1.5">
            <Calendar size={14} />
            19 a 22 de novembro de 2026 · Monte Horebe, Cesário Lange/SP
          </p>
        </div>
      </div>

      {/* Financeiro */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CardFinanceiro label="Total Inscritos" valor={String(total)} sub={`${homens}H / ${mulheres}M`} />
        <CardFinanceiro label="Total a Arrecadar" valor={formatarMoeda(totalArrecadar)} />
        <CardFinanceiro label="Total Pago" valor={formatarMoeda(totalPago)} />
        <CardFinanceiro label="A Receber" valor={formatarMoeda(totalAPagar)} sub={totalAPagar > 0 ? "pendente" : "quitado"} />
      </div>

      {/* Status */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Confirmados</p>
          <p className="text-2xl font-bold text-green-600">{confirmados}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-600">{pendentes}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Cancelados</p>
          <p className="text-2xl font-bold text-red-600">{cancelados}</p>
        </div>
      </div>

      {/* Grid analítico igual ao 2025 */}
      <div>
        <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
          <TrendingUp size={18} className="text-primary-600" />
          Distribuição por Categoria
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Total Inscritos */}
          <CardAnal label="Total Inscritos" accent>
            <Linha label="Inscritos" valor={total} />
            <Linha label="Homens" valor={homens} />
            <Linha label="Mulheres" valor={mulheres} />
          </CardAnal>

          {/* Village */}
          <CardAnal label="Village">
            <Linha label="Casais" valor={`${casaisVillage} (${village.length} pess.)`} />
          </CardAnal>

          {/* Melhor Idade */}
          <CardAnal label="Melhor Idade 60+">
            <Linha label="Homens" valor={melhorIdadeMasc} />
            <Linha label="Mulheres" valor={melhorIdadeFem} />
          </CardAnal>

          {/* Homens 30-59 */}
          <CardAnal label="Homens 30-59">
            <Linha label="Homens" valor={adultosMasc} />
          </CardAnal>

          {/* Mulheres 30-59 */}
          <CardAnal label="Mulheres 30-59">
            <Linha label="Mulheres" valor={adultosFem} />
          </CardAnal>

          {/* Jovens */}
          <CardAnal label="Jovens 15-29">
            <Linha label="Homens" valor={jovensMasc} />
            <Linha label="Mulheres" valor={jovensFem} />
          </CardAnal>

          {/* Adolesc. 11-14 */}
          <CardAnal label="Adolesc. 11-14">
            <Linha label="Homens" valor={adol1114Masc} />
            <Linha label="Mulheres" valor={adol1114Fem} />
          </CardAnal>

          {/* Adolesc. 06-10 */}
          <CardAnal label="Adolesc. 06-10">
            <Linha label="Homens" valor={adol0610Masc} />
            <Linha label="Mulheres" valor={adol0610Fem} />
          </CardAnal>

          {/* Crianças */}
          <CardAnal label="Crianças até 05">
            <Linha label="Meninos" valor={criancasMasc} />
            <Linha label="Meninas" valor={criancasFem} />
          </CardAnal>

          {/* Ônibus */}
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
