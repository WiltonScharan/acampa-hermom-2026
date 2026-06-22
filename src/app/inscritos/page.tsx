"use client";

import { useState } from "react";
import Link from "next/link";
import { useInscricoes } from "@/hooks/useInscricoes";
import {
  formatarMoeda,
  formatarData,
  LABEL_STATUS,
  LABEL_TIPO_QUARTO,
} from "@/lib/utils";
import { excluirInscricao } from "@/lib/firestore";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Bus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import clsx from "clsx";
import { InscricaoComCalculo } from "@/types";

export default function InscritosPage() {
  const { inscricoes, loading } = useInscricoes();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroQuarto, setFiltroQuarto] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [sort, setSort] = useState<{ col: keyof InscricaoComCalculo; dir: "asc" | "desc" }>({
    col: "nome",
    dir: "asc",
  });
  const [expandido, setExpandido] = useState<string | null>(null);

  const filtrados = inscricoes
    .filter((i) => {
      const q = busca.toLowerCase();
      if (q && !i.nome.toLowerCase().includes(q) && !i.nomeComprador.toLowerCase().includes(q))
        return false;
      if (filtroStatus && i.status !== filtroStatus) return false;
      if (filtroQuarto && i.tipoQuarto !== filtroQuarto) return false;
      if (filtroCategoria && i.categoria !== filtroCategoria) return false;
      return true;
    })
    .sort((a, b) => {
      const v = String(a[sort.col] ?? "").localeCompare(String(b[sort.col] ?? ""), "pt-BR");
      return sort.dir === "asc" ? v : -v;
    });

  async function handleExcluir(id: string, nome: string) {
    if (!confirm(`Excluir inscrição de "${nome}"?`)) return;
    await excluirInscricao(id);
  }

  function toggleSort(col: keyof InscricaoComCalculo) {
    setSort((prev) =>
      prev.col === col ? { col, dir: prev.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" }
    );
  }

  const SortIcon = ({ col }: { col: keyof InscricaoComCalculo }) =>
    sort.col === col ? (
      sort.dir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
    ) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inscritos</h1>
          <p className="text-sm text-gray-500">{inscricoes.length} inscrição(ões) no total</p>
        </div>
        <Link href="/inscritos/novo" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Nova Inscrição
        </Link>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              className="input-field pl-9"
              placeholder="Buscar nome ou comprador..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <select className="input-field" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <select className="input-field" value={filtroQuarto} onChange={(e) => setFiltroQuarto(e.target.value)}>
            <option value="">Todos os quartos</option>
            <option value="coletivo">Quarto Coletivo</option>
            <option value="village">Village</option>
          </select>
          <select className="input-field" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
            <option value="">Todas as categorias</option>
            <option value="criancas_ate_05">Crianças até 05</option>
            <option value="adolescentes_06_10">Adolesc. 06-10</option>
            <option value="adolescentes_11_14">Adolesc. 11-14</option>
            <option value="jovens_15_29">Jovens 15-29</option>
            <option value="adultos_30_59">Adultos 30-59</option>
            <option value="melhor_idade_60">Melhor Idade 60+</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-gray-900"
                  onClick={() => toggleSort("nome")}
                >
                  <span className="flex items-center gap-1">Nome <SortIcon col="nome" /></span>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Comprador</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Categoria</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Quarto</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Total</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Pago</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-red-600">A Pagar</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400">
                    Nenhum inscrito encontrado.
                  </td>
                </tr>
              )}
              {filtrados.map((ins) => (
                <>
                  <tr
                    key={ins.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandido(expandido === ins.id ? null : ins.id)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <span className="flex items-center gap-2">
                        {ins.nome}
                        {ins.onibus && <Bus size={14} className="text-primary-500" aria-label="Vai de ônibus" />}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{ins.nomeComprador}</td>
                    <td className="px-4 py-3 text-gray-600">{ins.labelCategoria}</td>
                    <td className="px-4 py-3 text-gray-600">{LABEL_TIPO_QUARTO[ins.tipoQuarto]}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatarMoeda(ins.valorTotal)}</td>
                    <td className="px-4 py-3 text-right text-green-700">{formatarMoeda(ins.valorPago)}</td>
                    <td className={clsx("px-4 py-3 text-right font-semibold", ins.valorAPagar > 0 ? "text-red-600" : "text-green-600")}>
                      {formatarMoeda(ins.valorAPagar)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge-${ins.status}`}>{LABEL_STATUS[ins.status]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Link href={`/inscritos/${ins.id}`} className="text-primary-600 hover:text-primary-800 p-1" title="Editar">
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => handleExcluir(ins.id, ins.nome)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandido === ins.id && (
                    <tr key={`${ins.id}-detail`} className="bg-orange-50">
                      <td colSpan={9} className="px-6 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div><span className="text-gray-500">Nascimento:</span> <span className="font-medium">{formatarData(ins.dataNascimento)}</span></div>
                          <div><span className="text-gray-500">Gênero:</span> <span className="font-medium capitalize">{ins.genero}</span></div>
                          <div><span className="text-gray-500">CPF:</span> <span className="font-medium">{ins.cpf || "—"}</span></div>
                          <div><span className="text-gray-500">Telefone:</span> <span className="font-medium">{ins.telefone || "—"}</span></div>
                          <div><span className="text-gray-500">E-mail:</span> <span className="font-medium">{ins.email || "—"}</span></div>
                          <div><span className="text-gray-500">Pagamento:</span> <span className="font-medium">{ins.formaPagamento || "—"}</span></div>
                          <div><span className="text-gray-500">Comprovantes:</span> <span className="font-medium">{ins.comprovantes?.length || 0}</span></div>
                          <div><span className="text-gray-500">Ônibus:</span> <span className="font-medium">{ins.onibus ? "Sim" : "Não"}</span></div>
                          {ins.observacoes && (
                            <div className="col-span-4">
                              <span className="text-gray-500">Observação:</span>{" "}
                              <span className="font-medium">{ins.observacoes}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        {filtrados.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-sm text-gray-500 flex justify-between">
            <span>{filtrados.length} inscrito(s) exibido(s)</span>
            <span className="font-medium text-gray-700">
              Total a receber: {formatarMoeda(filtrados.reduce((s, i) => s + i.valorAPagar, 0))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
