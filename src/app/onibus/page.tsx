"use client";

import { useState } from "react";
import Link from "next/link";
import { useInscricoes } from "@/hooks/useInscricoes";
import { formatarMoeda, formatarData } from "@/lib/utils";
import { Bus, Pencil } from "lucide-react";

const FILTROS = [
  { label: "Todos", value: "todos" },
  { label: "Homens", value: "masculino" },
  { label: "Mulheres", value: "feminino" },
  { label: "Crianças até 05", value: "criancas_ate_05" },
  { label: "Adolesc. 06-10", value: "adolescentes_06_10" },
  { label: "Adolesc. 11-14", value: "adolescentes_11_14" },
  { label: "Jovens 15-29", value: "jovens_15_29" },
  { label: "Adultos 30-59", value: "adultos_30_59" },
  { label: "Melhor Idade", value: "melhor_idade_60" },
];

export default function OnibusPage() {
  const { inscricoes, loading } = useInscricoes();
  const [filtro, setFiltro] = useState("todos");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const noOnibus = inscricoes.filter((i) => i.onibus);

  const filtrados = noOnibus.filter((i) => {
    if (filtro === "todos") return true;
    if (filtro === "masculino" || filtro === "feminino") return i.genero === filtro;
    return i.categoria === filtro;
  });

  // Contagens para os chips
  const contagens: Record<string, number> = {
    todos: noOnibus.length,
    masculino: noOnibus.filter((i) => i.genero === "masculino").length,
    feminino: noOnibus.filter((i) => i.genero === "feminino").length,
    criancas_ate_05: noOnibus.filter((i) => i.categoria === "criancas_ate_05").length,
    adolescentes_06_10: noOnibus.filter((i) => i.categoria === "adolescentes_06_10").length,
    adolescentes_11_14: noOnibus.filter((i) => i.categoria === "adolescentes_11_14").length,
    jovens_15_29: noOnibus.filter((i) => i.categoria === "jovens_15_29").length,
    adultos_30_59: noOnibus.filter((i) => i.categoria === "adultos_30_59").length,
    melhor_idade_60: noOnibus.filter((i) => i.categoria === "melhor_idade_60").length,
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Bus size={24} className="text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ônibus</h1>
          <p className="text-sm text-gray-500">
            {noOnibus.length} pessoa(s) optaram pelo transporte coletivo
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              filtro === f.value
                ? "bg-primary-600 text-white border-primary-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-primary-400 hover:text-primary-600"
            }`}
          >
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              filtro === f.value ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-500"
            }`}>
              {contagens[f.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Nome</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Nascimento</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Categoria</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Comprador</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Pago</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-red-500">A Pagar</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    Nenhum inscrito neste filtro.
                  </td>
                </tr>
              )}
              {filtrados.map((ins) => (
                <tr key={ins.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{ins.nome}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatarData(ins.dataNascimento)}
                    <span className="ml-1 text-xs text-gray-400">({ins.idadeNaData} anos)</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{ins.labelCategoria}</td>
                  <td className="px-4 py-3 text-gray-600">{ins.nomeComprador}</td>
                  <td className="px-4 py-3 text-right text-green-700">{formatarMoeda(ins.valorPago)}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${ins.valorAPagar > 0 ? "text-red-600" : "text-green-600"}`}>
                    {formatarMoeda(ins.valorAPagar)}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/inscritos/${ins.id}`} className="text-primary-600 hover:text-primary-800">
                      <Pencil size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtrados.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-sm text-gray-500">
            {filtrados.length} pessoa(s) exibida(s)
          </div>
        )}
      </div>
    </div>
  );
}
