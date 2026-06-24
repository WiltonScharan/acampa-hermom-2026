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
import { excluirInscricao, atualizarInscricao } from "@/lib/firestore";
import { calcularValorTotal, formatarTelefone, whatsAppLink } from "@/lib/utils";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Bus,
  ChevronDown,
  ChevronUp,
  MessageCircle,
} from "lucide-react";
import clsx from "clsx";
import { InscricaoComCalculo, StatusInscricao } from "@/types";

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

  const [togglingOnibus, setTogglingOnibus] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ id: string; field: "valorTotal" | "valorPago" | "valorAPagar" | "status" } | null>(null);
  const [editValue, setEditValue] = useState("");

  async function handleExcluir(id: string, nome: string) {
    if (!confirm(`Excluir inscrição de "${nome}"?`)) return;
    await excluirInscricao(id);
  }

  async function handleToggleOnibus(ins: InscricaoComCalculo) {
    setTogglingOnibus(ins.id);
    try {
      const novoOnibus = !ins.onibus;
      const novoTotal = calcularValorTotal(ins.dataNascimento, ins.tipoQuarto, novoOnibus);
      await atualizarInscricao(ins.id, { onibus: novoOnibus, valorTotal: novoTotal });
    } finally {
      setTogglingOnibus(null);
    }
  }

  function startEdit(ins: InscricaoComCalculo, field: "valorTotal" | "valorPago" | "valorAPagar" | "status") {
    const val = field === "valorTotal" ? String(ins.valorTotal)
      : field === "valorPago" ? String(ins.valorPago)
      : field === "valorAPagar" ? String(ins.valorAPagar)
      : ins.status;
    setEditingCell({ id: ins.id, field });
    setEditValue(val);
  }

  async function saveEdit(ins: InscricaoComCalculo) {
    if (!editingCell || editingCell.id !== ins.id) return;
    setEditingCell(null);
    const { field } = editingCell;
    const num = parseFloat(editValue.replace(",", "."));
    if (isNaN(num) || num < 0) return;
    if (field === "valorTotal" && num !== ins.valorTotal) {
      await atualizarInscricao(ins.id, { valorTotal: num });
    } else if (field === "valorPago" && num !== ins.valorPago) {
      await atualizarInscricao(ins.id, { valorPago: num });
    } else if (field === "valorAPagar") {
      const newPago = Math.max(0, ins.valorTotal - num);
      if (newPago !== ins.valorPago) await atualizarInscricao(ins.id, { valorPago: newPago });
    }
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
                <th className="text-center px-4 py-3 font-semibold text-gray-600">
                  <span className="flex items-center justify-center gap-1"><Bus size={14} /> Ônibus</span>
                </th>
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
                  <td colSpan={10} className="text-center py-12 text-gray-400">
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
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleOnibus(ins)}
                        disabled={togglingOnibus === ins.id}
                        title={ins.onibus ? "Remover ônibus (−R$150)" : "Adicionar ônibus (+R$150)"}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                          ins.onibus
                            ? "bg-primary-100 text-primary-700 border-primary-300 hover:bg-primary-200"
                            : "bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        <Bus size={12} />
                        {ins.onibus ? "Sim" : "Não"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right font-medium" onClick={(e) => { e.stopPropagation(); startEdit(ins, "valorTotal"); }}>
                      {editingCell?.id === ins.id && editingCell.field === "valorTotal" ? (
                        <input autoFocus type="number" min="0" step="0.01"
                          className="w-24 text-right border border-primary-400 rounded px-1.5 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit(ins)}
                          onKeyDown={(e) => { if (e.key === "Enter") saveEdit(ins); if (e.key === "Escape") setEditingCell(null); }}
                        />
                      ) : (
                        <span className="cursor-pointer hover:text-primary-700 hover:underline decoration-dashed" title="Clique para editar">{formatarMoeda(ins.valorTotal)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-green-700" onClick={(e) => { e.stopPropagation(); startEdit(ins, "valorPago"); }}>
                      {editingCell?.id === ins.id && editingCell.field === "valorPago" ? (
                        <input autoFocus type="number" min="0" step="0.01"
                          className="w-24 text-right border border-green-400 rounded px-1.5 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit(ins)}
                          onKeyDown={(e) => { if (e.key === "Enter") saveEdit(ins); if (e.key === "Escape") setEditingCell(null); }}
                        />
                      ) : (
                        <span className="cursor-pointer hover:text-green-900 hover:underline decoration-dashed" title="Clique para editar">{formatarMoeda(ins.valorPago)}</span>
                      )}
                    </td>
                    <td className={clsx("px-4 py-3 text-right font-semibold", ins.valorAPagar > 0 ? "text-red-600" : "text-green-600")} onClick={(e) => { e.stopPropagation(); startEdit(ins, "valorAPagar"); }}>
                      {editingCell?.id === ins.id && editingCell.field === "valorAPagar" ? (
                        <input autoFocus type="number" min="0" step="0.01"
                          className="w-24 text-right border border-red-400 rounded px-1.5 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit(ins)}
                          onKeyDown={(e) => { if (e.key === "Enter") saveEdit(ins); if (e.key === "Escape") setEditingCell(null); }}
                        />
                      ) : (
                        <span className="cursor-pointer hover:underline decoration-dashed" title="Clique para editar">{formatarMoeda(ins.valorAPagar)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      {editingCell?.id === ins.id && editingCell.field === "status" ? (
                        <select autoFocus
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          value={editValue}
                          onChange={(e) => {
                            const newStatus = e.target.value as StatusInscricao;
                            setEditingCell(null);
                            atualizarInscricao(ins.id, { status: newStatus });
                          }}
                          onBlur={() => setEditingCell(null)}
                        >
                          <option value="pendente">Pendente</option>
                          <option value="confirmado">Confirmado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      ) : (
                        <span className={`badge-${ins.status} cursor-pointer`} onClick={() => startEdit(ins, "status")} title="Clique para editar">
                          {LABEL_STATUS[ins.status]}
                        </span>
                      )}
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
                      <td colSpan={10} className="px-6 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div><span className="text-gray-500">Nascimento:</span> <span className="font-medium">{formatarData(ins.dataNascimento)}</span></div>
                          <div><span className="text-gray-500">Gênero:</span> <span className="font-medium capitalize">{ins.genero}</span></div>
                          <div><span className="text-gray-500">CPF:</span> <span className="font-medium">{ins.cpf || "—"}</span></div>
                          <div>
                            <span className="text-gray-500">Telefone:</span>{" "}
                            {ins.telefone ? (
                              <span className="inline-flex items-center gap-1.5 font-medium">
                                {formatarTelefone(ins.telefone)}
                                <a
                                  href={whatsAppLink(ins.telefone)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  title="Abrir no WhatsApp"
                                  className="text-green-500 hover:text-green-700"
                                >
                                  <MessageCircle size={15} />
                                </a>
                              </span>
                            ) : <span className="font-medium">—</span>}
                          </div>
                          <div><span className="text-gray-500">E-mail:</span> <span className="font-medium">{ins.email || "—"}</span></div>
                          <div><span className="text-gray-500">Pagamento:</span> <span className="font-medium">{ins.formaPagamento || "—"}</span></div>
                          <div><span className="text-gray-500">Comprovantes:</span> <span className="font-medium">{ins.comprovantes?.length || 0}</span></div>
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
