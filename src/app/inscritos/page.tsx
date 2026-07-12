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
  X,
  CalendarDays,
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
      if (i.status === "cancelado") return false;
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
  const [editingCell, setEditingCell] = useState<{ id: string; field: "valorTotal" | "status" } | null>(null);
  const [editValue, setEditValue] = useState("");

  // Modal pagamentos
  const [modalPagInsId, setModalPagInsId] = useState<string | null>(null);
  const modalPagIns = modalPagInsId ? (inscricoes.find((i) => i.id === modalPagInsId) ?? null) : null;
  const [novoPagValor, setNovoPagValor] = useState("");
  const [novoPagData, setNovoPagData] = useState(() => new Date().toISOString().split("T")[0]);
  const [salvandoPag, setSalvandoPag] = useState(false);

  // Modal devoluções
  const [modalDevInsId, setModalDevInsId] = useState<string | null>(null);
  const modalDevIns = modalDevInsId ? (inscricoes.find((i) => i.id === modalDevInsId) ?? null) : null;
  const [novaDevValor, setNovaDevValor] = useState("");
  const [novaDevData, setNovaDevData] = useState(() => new Date().toISOString().split("T")[0]);
  const [salvandoDev, setSalvandoDev] = useState(false);

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

  function startEdit(ins: InscricaoComCalculo, field: "valorTotal" | "status") {
    const val = field === "valorTotal" ? String(ins.valorTotal) : ins.status;
    setEditingCell({ id: ins.id, field });
    setEditValue(val);
  }

  async function saveEdit(ins: InscricaoComCalculo) {
    if (!editingCell || editingCell.id !== ins.id) return;
    setEditingCell(null);
    const { field } = editingCell;
    if (field === "valorTotal") {
      const num = parseFloat(editValue.replace(",", "."));
      if (!isNaN(num) && num >= 0 && num !== ins.valorTotal) {
        await atualizarInscricao(ins.id, { valorTotal: num });
      }
    }
  }

  // Pagamentos
  async function handleAdicionarPagamento() {
    if (!modalPagIns) return;
    const valor = parseFloat(novoPagValor.replace(",", "."));
    if (isNaN(valor) || valor <= 0) return;
    setSalvandoPag(true);
    try {
      const novoHistorico = [...(modalPagIns.historicoPagamentos || []), { valor, data: novoPagData }];
      const novoValorPago = (Number(modalPagIns.valorPago) || 0) + valor;
      const novoStatus: StatusInscricao =
        novoValorPago >= modalPagIns.valorTotal ? "confirmado" : modalPagIns.status;
      await atualizarInscricao(modalPagIns.id, {
        historicoPagamentos: novoHistorico,
        valorPago: novoValorPago,
        status: novoStatus,
      });
      setNovoPagValor("");
      setNovoPagData(new Date().toISOString().split("T")[0]);
    } finally {
      setSalvandoPag(false);
    }
  }

  async function handleRemoverPagamento(ins: InscricaoComCalculo, idx: number, valor: number) {
    if (!confirm(`Remover pagamento de ${formatarMoeda(valor)}?`)) return;
    const novaLista = (ins.historicoPagamentos || []).filter((_, i) => i !== idx);
    const novoValorPago = Math.max(0, ins.valorPago - valor);
    await atualizarInscricao(ins.id, { historicoPagamentos: novaLista, valorPago: novoValorPago });
  }

  // Devoluções
  async function handleAdicionarDevolucao() {
    if (!modalDevIns) return;
    const valor = parseFloat(novaDevValor.replace(",", "."));
    if (isNaN(valor) || valor <= 0) return;
    setSalvandoDev(true);
    try {
      const novoHistorico = [...(modalDevIns.historicoDevolvidos || []), { valor, data: novaDevData }];
      const novoValorDevolvido = (Number(modalDevIns.valorDevolvido) || 0) + valor;
      await atualizarInscricao(modalDevIns.id, {
        historicoDevolvidos: novoHistorico,
        valorDevolvido: novoValorDevolvido,
      });
      setNovaDevValor("");
      setNovaDevData(new Date().toISOString().split("T")[0]);
    } finally {
      setSalvandoDev(false);
    }
  }

  async function handleRemoverDevolucao(ins: InscricaoComCalculo, idx: number, valor: number) {
    if (!confirm(`Remover devolução de ${formatarMoeda(valor)}?`)) return;
    const novaLista = (ins.historicoDevolvidos || []).filter((_, i) => i !== idx);
    const novoValorDevolvido = Math.max(0, (ins.valorDevolvido || 0) - valor);
    await atualizarInscricao(ins.id, { historicoDevolvidos: novaLista, valorDevolvido: novoValorDevolvido });
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

  // Dados do modal pagamentos
  const sumPagHistory = (modalPagIns?.historicoPagamentos || []).reduce((s, p) => s + p.valor, 0);
  const saldoPagAnterior = modalPagIns ? Math.max(0, modalPagIns.valorPago - sumPagHistory) : 0;

  // Dados do modal devoluções
  const sumDevHistory = (modalDevIns?.historicoDevolvidos || []).reduce((s, p) => s + p.valor, 0);
  const saldoDevAnterior = modalDevIns ? Math.max(0, (modalDevIns.valorDevolvido || 0) - sumDevHistory) : 0;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inscritos</h1>
          <p className="text-sm text-gray-500">{inscricoes.filter(i => i.status !== "cancelado").length} inscrição(ões) no total</p>
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
                <th className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => toggleSort("nome")}>
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
                <th className="text-right px-4 py-3 font-semibold text-red-600">A Pagar</th>
                <th className="text-right px-4 py-3 font-semibold text-orange-600">Devolvido</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-gray-400">
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
                    {/* Total — inline edit */}
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
                    {/* Pago — abre modal */}
                    <td className="px-4 py-3 text-right text-green-700" onClick={(e) => { e.stopPropagation(); setModalPagInsId(ins.id); }}>
                      <span className="cursor-pointer hover:text-green-900 hover:underline decoration-dashed inline-flex items-center gap-1" title="Ver histórico de pagamentos">
                        {formatarMoeda(ins.valorPago)}
                        <Plus size={12} className="text-green-500" />
                      </span>
                    </td>
                    {/* A Pagar — leitura */}
                    <td className={clsx("px-4 py-3 text-right font-semibold", ins.valorAPagar > 0 ? "text-red-600" : "text-green-600")}>
                      {formatarMoeda(ins.valorAPagar)}
                    </td>
                    {/* Devolvido — abre modal */}
                    <td className="px-4 py-3 text-right text-orange-600" onClick={(e) => { e.stopPropagation(); setModalDevInsId(ins.id); }}>
                      <span className="cursor-pointer hover:text-orange-800 hover:underline decoration-dashed inline-flex items-center gap-1" title="Ver histórico de devoluções">
                        {formatarMoeda(ins.valorDevolvido || 0)}
                        <Plus size={12} className="text-orange-400" />
                      </span>
                    </td>
                    {/* Status — inline edit */}
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
                        <button onClick={() => handleExcluir(ins.id, ins.nome)} className="text-red-500 hover:text-red-700 p-1" title="Excluir">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandido === ins.id && (
                    <tr key={`${ins.id}-detail`} className="bg-orange-50">
                      <td colSpan={11} className="px-6 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div><span className="text-gray-500">Nascimento:</span> <span className="font-medium">{formatarData(ins.dataNascimento)}</span></div>
                          <div><span className="text-gray-500">Gênero:</span> <span className="font-medium capitalize">{ins.genero}</span></div>
                          <div><span className="text-gray-500">CPF:</span> <span className="font-medium">{ins.cpf || "—"}</span></div>
                          <div>
                            <span className="text-gray-500">Telefone:</span>{" "}
                            {ins.telefone ? (
                              <span className="inline-flex items-center gap-1.5 font-medium">
                                {formatarTelefone(ins.telefone)}
                                <a href={whatsAppLink(ins.telefone)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} title="Abrir no WhatsApp" className="text-green-500 hover:text-green-700">
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
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-sm flex flex-wrap gap-x-6 gap-y-1 justify-between items-center">
            <span className="text-gray-500">{filtrados.length} inscrito(s) exibido(s)</span>
            <span className="flex flex-wrap gap-x-5 gap-y-1 font-medium">
              <span className="text-gray-700">Total: {formatarMoeda(filtrados.reduce((s, i) => s + i.valorTotal, 0))}</span>
              <span className="text-green-700">Pago: {formatarMoeda(filtrados.reduce((s, i) => s + i.valorPago, 0))}</span>
              <span className="text-red-600">A receber: {formatarMoeda(filtrados.reduce((s, i) => s + i.valorAPagar, 0))}</span>
            </span>
          </div>
        )}
      </div>

      {/* ── Modal Pagamentos ── */}
      {modalPagIns && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setModalPagInsId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="font-bold text-gray-800">Histórico de Pagamentos</h2>
                <p className="text-sm text-gray-500">{modalPagIns.nome}</p>
              </div>
              <button onClick={() => setModalPagInsId(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-b flex items-center gap-5 text-sm">
              <span className="text-gray-600">Total: <strong className="text-gray-800">{formatarMoeda(modalPagIns.valorTotal)}</strong></span>
              <span className="text-green-700">Pago: <strong>{formatarMoeda(modalPagIns.valorPago)}</strong></span>
              <span className={modalPagIns.valorAPagar > 0 ? "text-red-600" : "text-green-600"}>
                A Pagar: <strong>{formatarMoeda(modalPagIns.valorAPagar)}</strong>
              </span>
            </div>
            <div className="px-6 py-4 max-h-60 overflow-y-auto space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Histórico</p>
              {saldoPagAnterior > 0 && (
                <div className="flex items-center justify-between text-sm text-gray-400 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                  <span className="italic">Pagamentos anteriores (sem data)</span>
                  <span className="font-medium">{formatarMoeda(saldoPagAnterior)}</span>
                </div>
              )}
              {(modalPagIns.historicoPagamentos || []).length === 0 && saldoPagAnterior === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">Nenhum pagamento registrado.</p>
              )}
              {(modalPagIns.historicoPagamentos || []).map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-green-50 px-3 py-2.5 rounded-lg border border-green-100">
                  <span className="flex items-center gap-2 text-gray-600">
                    <CalendarDays size={13} className="text-green-500 flex-shrink-0" />
                    {p.data ? formatarData(p.data) : <span className="italic text-gray-400">sem data</span>}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-semibold text-green-700">{formatarMoeda(p.valor)}</span>
                    <button onClick={() => handleRemoverPagamento(modalPagIns, i, p.valor)} className="text-red-400 hover:text-red-600 p-0.5" title="Remover"><Trash2 size={13} /></button>
                  </span>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Registrar novo pagamento</p>
              <div className="flex gap-2">
                <div className="flex-1 min-w-0">
                  <input type="number" min="0" step="0.01" placeholder="Valor (R$)" className="input-field text-sm"
                    value={novoPagValor} onChange={(e) => setNovoPagValor(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAdicionarPagamento(); }} />
                </div>
                <div style={{ width: "9rem", flexShrink: 0 }}>
                  <input type="date" className="input-field text-sm" value={novoPagData} onChange={(e) => setNovoPagData(e.target.value)} />
                </div>
              </div>
              <button onClick={handleAdicionarPagamento} disabled={salvandoPag || !novoPagValor || parseFloat(novoPagValor) <= 0}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                <Plus size={15} />
                {salvandoPag ? "Registrando..." : "Registrar pagamento"}
              </button>
              {modalPagIns.valorAPagar > 0 && (
                <p className="text-xs text-gray-400 text-center">
                  Ao quitar o valor total, o status muda para <strong className="text-green-700">Confirmado</strong> automaticamente.
                </p>
              )}
              {modalPagIns.status === "confirmado" && (
                <p className="text-xs text-green-700 text-center font-medium">Pagamento quitado — status Confirmado.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Devoluções ── */}
      {modalDevIns && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setModalDevInsId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="font-bold text-gray-800">Histórico de Devoluções</h2>
                <p className="text-sm text-gray-500">{modalDevIns.nome}</p>
              </div>
              <button onClick={() => setModalDevInsId(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-b flex items-center gap-5 text-sm">
              <span className="text-gray-600">Pago: <strong className="text-gray-800">{formatarMoeda(modalDevIns.valorPago)}</strong></span>
              <span className="text-orange-600">Devolvido: <strong>{formatarMoeda(modalDevIns.valorDevolvido || 0)}</strong></span>
            </div>
            <div className="px-6 py-4 max-h-60 overflow-y-auto space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Histórico</p>
              {saldoDevAnterior > 0 && (
                <div className="flex items-center justify-between text-sm text-gray-400 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                  <span className="italic">Devoluções anteriores (sem data)</span>
                  <span className="font-medium">{formatarMoeda(saldoDevAnterior)}</span>
                </div>
              )}
              {(modalDevIns.historicoDevolvidos || []).length === 0 && saldoDevAnterior === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">Nenhuma devolução registrada.</p>
              )}
              {(modalDevIns.historicoDevolvidos || []).map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-orange-50 px-3 py-2.5 rounded-lg border border-orange-100">
                  <span className="flex items-center gap-2 text-gray-600">
                    <CalendarDays size={13} className="text-orange-400 flex-shrink-0" />
                    {p.data ? formatarData(p.data) : <span className="italic text-gray-400">sem data</span>}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-semibold text-orange-700">{formatarMoeda(p.valor)}</span>
                    <button onClick={() => handleRemoverDevolucao(modalDevIns, i, p.valor)} className="text-red-400 hover:text-red-600 p-0.5" title="Remover"><Trash2 size={13} /></button>
                  </span>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Registrar devolução</p>
              <div className="flex gap-2">
                <div className="flex-1 min-w-0">
                  <input type="number" min="0" step="0.01" placeholder="Valor (R$)" className="input-field text-sm"
                    value={novaDevValor} onChange={(e) => setNovaDevValor(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAdicionarDevolucao(); }} />
                </div>
                <div style={{ width: "9rem", flexShrink: 0 }}>
                  <input type="date" className="input-field text-sm" value={novaDevData} onChange={(e) => setNovaDevData(e.target.value)} />
                </div>
              </div>
              <button onClick={handleAdicionarDevolucao} disabled={salvandoDev || !novaDevValor || parseFloat(novaDevValor) <= 0}
                className="w-full flex items-center justify-center gap-2 text-sm py-2 rounded-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-50">
                <Plus size={15} />
                {salvandoDev ? "Registrando..." : "Registrar devolução"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
