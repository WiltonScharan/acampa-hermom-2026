"use client";

import { useEffect, useState, useRef } from "react";
import { ouvirListaEspera, adicionarListaEspera, atualizarListaEspera, excluirListaEspera } from "@/lib/firestore";
import { formatarTelefone, whatsAppLink } from "@/lib/utils";
import { ItemListaEspera } from "@/types";
import { Plus, Trash2, Home, MessageCircle, Pencil, Check, X } from "lucide-react";

export default function ListaEsperaPage() {
  const [lista, setLista] = useState<ItemListaEspera[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado do novo item
  const [adicionando, setAdicionando] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [novoObs, setNovoObs] = useState("");
  const [salvando, setSalvando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Estado de edição inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editTelefone, setEditTelefone] = useState("");
  const [editObs, setEditObs] = useState("");

  useEffect(() => {
    const unsub = ouvirListaEspera((items) => {
      setLista(items);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (adicionando) inputRef.current?.focus();
  }, [adicionando]);

  async function handleAdicionar() {
    if (!novoNome.trim()) return;
    setSalvando(true);
    try {
      await adicionarListaEspera({
        nomeCasal: novoNome.trim(),
        telefone: novoTelefone.trim(),
        observacoes: novoObs.trim(),
      });
      setNovoNome("");
      setNovoTelefone("");
      setNovoObs("");
      setAdicionando(false);
    } finally {
      setSalvando(false);
    }
  }

  function startEdit(item: ItemListaEspera) {
    setEditingId(item.id);
    setEditNome(item.nomeCasal);
    setEditTelefone(item.telefone);
    setEditObs(item.observacoes);
  }

  async function saveEdit(id: string) {
    if (!editNome.trim()) return;
    await atualizarListaEspera(id, {
      nomeCasal: editNome.trim(),
      telefone: editTelefone.trim(),
      observacoes: editObs.trim(),
    });
    setEditingId(null);
  }

  async function handleExcluir(id: string, nome: string) {
    if (!confirm(`Remover "${nome}" da lista de espera?`)) return;
    await excluirListaEspera(id);
  }

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
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Home size={22} className="text-primary-600" />
            Lista de Espera — Village
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {lista.length} casal(is) na fila • por ordem de chegada
          </p>
        </div>
        {!adicionando && (
          <button
            onClick={() => setAdicionando(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> Adicionar casal
          </button>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-center px-4 py-3 font-semibold text-gray-500 w-12">#</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 w-80">Nome do Casal</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap w-52">Telefone</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Observações</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 w-24">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lista.length === 0 && !adicionando && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  Nenhum casal na lista de espera.
                </td>
              </tr>
            )}

            {lista.map((item, idx) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {/* Número */}
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                    {idx + 1}
                  </span>
                </td>

                {editingId === item.id ? (
                  <>
                    {/* Modo edição */}
                    <td className="px-3 py-2">
                      <input
                        autoFocus
                        className="input-field text-sm py-1.5"
                        value={editNome}
                        onChange={(e) => setEditNome(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(item.id); if (e.key === "Escape") setEditingId(null); }}
                        placeholder="Nome do casal"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="input-field text-sm py-1.5"
                        value={editTelefone}
                        onChange={(e) => setEditTelefone(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(item.id); if (e.key === "Escape") setEditingId(null); }}
                        placeholder="Telefone"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="input-field text-sm py-1.5"
                        value={editObs}
                        onChange={(e) => setEditObs(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(item.id); if (e.key === "Escape") setEditingId(null); }}
                        placeholder="Observações"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => saveEdit(item.id)}
                          className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                          title="Salvar"
                        >
                          <Check size={15} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100"
                          title="Cancelar"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    {/* Modo visualização */}
                    <td className="px-4 py-3 font-medium text-gray-900">{item.nomeCasal}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {item.telefone ? (
                        <span className="inline-flex items-center gap-1.5">
                          {formatarTelefone(item.telefone)}
                          <a
                            href={whatsAppLink(item.telefone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-500 hover:text-green-700"
                            title="Abrir no WhatsApp"
                          >
                            <MessageCircle size={14} />
                          </a>
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.observacoes || <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1.5 text-primary-500 hover:text-primary-700 hover:bg-primary-50 rounded-lg"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleExcluir(item.id, item.nomeCasal)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Remover"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}

            {/* Linha de novo item */}
            {adicionando && (
              <tr className="bg-primary-50">
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-200 text-primary-700 text-xs font-bold">
                    {lista.length + 1}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <input
                    ref={inputRef}
                    className="input-field text-sm py-1.5"
                    placeholder="Nome do casal *"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAdicionar(); if (e.key === "Escape") setAdicionando(false); }}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="input-field text-sm py-1.5"
                    placeholder="Telefone"
                    value={novoTelefone}
                    onChange={(e) => setNovoTelefone(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAdicionar(); if (e.key === "Escape") setAdicionando(false); }}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="input-field text-sm py-1.5"
                    placeholder="Observações"
                    value={novoObs}
                    onChange={(e) => setNovoObs(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAdicionar(); if (e.key === "Escape") setAdicionando(false); }}
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={handleAdicionar}
                      disabled={salvando || !novoNome.trim()}
                      className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                      title="Salvar"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      onClick={() => { setAdicionando(false); setNovoNome(""); setNovoTelefone(""); setNovoObs(""); }}
                      className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
                      title="Cancelar"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {lista.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-sm text-gray-500">
            {lista.length} casal(is) aguardando vaga no Village
          </div>
        )}
      </div>
    </div>
  );
}
