"use client";

import { useState } from "react";
import Link from "next/link";
import { useInscricoes } from "@/hooks/useInscricoes";
import { InscricaoComCalculo } from "@/types";
import { formatarMoeda, formatarData, LABEL_TIPO_QUARTO } from "@/lib/utils";
import { Pencil, Bus, Search } from "lucide-react";

interface GrupoConfig {
  label: string;
  filtro: (i: InscricaoComCalculo) => boolean;
}

interface Props {
  titulo: string;
  descricao?: string;
  grupos: GrupoConfig[];
}

function TabelaGrupo({ titulo, inscritos }: { titulo: string; inscritos: InscricaoComCalculo[] }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-700">{titulo}</h3>
        <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2.5 py-1 rounded-full">
          {inscritos.length}
        </span>
      </div>
      {inscritos.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Nenhum inscrito nesta categoria.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-2 font-medium text-gray-500">Nome</th>
                <th className="text-left pb-2 font-medium text-gray-500">Nascimento</th>
                <th className="text-left pb-2 font-medium text-gray-500">Comprador</th>
                <th className="text-left pb-2 font-medium text-gray-500">Quarto</th>
                <th className="text-right pb-2 font-medium text-gray-500">Pago</th>
                <th className="text-right pb-2 font-medium text-gray-500 text-red-500">A Pagar</th>
                <th className="text-center pb-2 font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inscritos.map((ins) => (
                <tr key={ins.id} className="hover:bg-gray-50">
                  <td className="py-2.5 pr-3 font-medium text-gray-900">
                    <span className="flex items-center gap-1.5">
                      {ins.nome}
                      {ins.onibus && <Bus size={13} className="text-primary-500" aria-label="Ônibus" />}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-gray-500">
                    {formatarData(ins.dataNascimento)}
                    <span className="ml-1 text-xs text-gray-400">({ins.idadeNaData} anos)</span>
                  </td>
                  <td className="py-2.5 pr-3 text-gray-600">{ins.nomeComprador}</td>
                  <td className="py-2.5 pr-3 text-gray-600">{LABEL_TIPO_QUARTO[ins.tipoQuarto]}</td>
                  <td className="py-2.5 pr-3 text-right text-green-700">{formatarMoeda(ins.valorPago)}</td>
                  <td className={`py-2.5 pr-3 text-right font-semibold ${ins.valorAPagar > 0 ? "text-red-600" : "text-green-600"}`}>
                    {formatarMoeda(ins.valorAPagar)}
                  </td>
                  <td className="py-2.5 text-center">
                    <Link href={`/inscritos/${ins.id}`} className="text-primary-600 hover:text-primary-800">
                      <Pencil size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function CategoriaTab({ titulo, descricao, grupos }: Props) {
  const { inscricoes, loading } = useInscricoes();
  const [busca, setBusca] = useState("");
  const [filtroQuarto, setFiltroQuarto] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  // Cancelados nunca aparecem nas abas de categoria
  const ativos = inscricoes.filter((i) => i.status !== "cancelado");
  const q = busca.toLowerCase();
  const filtrados = ativos.filter((i) => {
    if (q && !i.nome.toLowerCase().includes(q) && !i.nomeComprador.toLowerCase().includes(q)) return false;
    if (filtroQuarto && i.tipoQuarto !== filtroQuarto) return false;
    return true;
  });

  const total = grupos.reduce((sum, g) => sum + filtrados.filter(g.filtro).length, 0);

  return (
    <div className="p-6 space-y-5">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">{titulo}</h1>
          <span className="bg-primary-600 text-white text-sm font-bold px-3 py-0.5 rounded-full">
            {total}
          </span>
        </div>
        {descricao && <p className="text-sm text-gray-500 mt-1">{descricao}</p>}
      </div>

      {/* Busca + Filtro de quarto */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            className="input-field pl-9 text-sm"
            placeholder="Buscar nome ou comprador..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <select
          className="input-field text-sm"
          style={{ width: "13rem", flexShrink: 0 }}
          value={filtroQuarto}
          onChange={(e) => setFiltroQuarto(e.target.value)}
        >
          <option value="">Todos os quartos</option>
          <option value="coletivo">Quarto Coletivo</option>
          <option value="village">Village</option>
        </select>
      </div>

      {grupos.map((g) => (
        <TabelaGrupo
          key={g.label}
          titulo={g.label}
          inscritos={filtrados.filter(g.filtro)}
        />
      ))}
    </div>
  );
}
