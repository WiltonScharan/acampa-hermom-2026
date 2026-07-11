"use client";

import { useState } from "react";
import Link from "next/link";
import { useInscricoes } from "@/hooks/useInscricoes";
import { formatarMoeda, formatarData, LABEL_TIPO_QUARTO } from "@/lib/utils";
import { Ban, Search, Pencil, AlertTriangle } from "lucide-react";

export default function CanceladosPage() {
  const { inscricoes, loading } = useInscricoes();
  const [busca, setBusca] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const cancelados = inscricoes.filter((i) => i.status === "cancelado");
  const q = busca.toLowerCase();
  const filtrados = q
    ? cancelados.filter((i) => i.nome.toLowerCase().includes(q) || i.nomeComprador.toLowerCase().includes(q))
    : cancelados;

  const totalDevolvidos = cancelados.reduce((s, i) => s + i.valorPago, 0);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Ban size={22} className="text-red-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cancelados</h1>
          <p className="text-sm text-gray-500">{cancelados.length} inscrição(ões) cancelada(s)</p>
        </div>
      </div>

      {/* Card valores a devolver */}
      {totalDevolvidos > 0 && (
        <div className="card border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800 text-sm">Valores a devolver</p>
              <p className="text-xs text-red-600 mt-0.5">
                {cancelados.filter((i) => i.valorPago > 0).length} pessoa(s) fizeram pagamento antes do cancelamento.
                Esses valores <strong>não entram</strong> nos totais do acampamento.
              </p>
            </div>
            <p className="text-2xl font-bold text-red-700 ml-auto">{formatarMoeda(totalDevolvidos)}</p>
          </div>
        </div>
      )}

      {cancelados.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Ban size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Nenhuma inscrição cancelada.</p>
        </div>
      ) : (
        <>
          {/* Busca */}
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              className="input-field pl-9 text-sm"
              placeholder="Buscar nome ou comprador..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {/* Tabela */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Nome</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Comprador</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Categoria</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Quarto</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Nascimento</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Total</th>
                    <th className="text-right px-4 py-3 font-semibold text-red-600">Pago (devolver)</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtrados.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-400">
                        Nenhum resultado para a busca.
                      </td>
                    </tr>
                  )}
                  {filtrados.map((ins) => (
                    <tr key={ins.id} className="hover:bg-red-50 opacity-80">
                      <td className="px-4 py-3 font-medium text-gray-700">{ins.nome}</td>
                      <td className="px-4 py-3 text-gray-500">{ins.nomeComprador}</td>
                      <td className="px-4 py-3 text-gray-500">{ins.labelCategoria}</td>
                      <td className="px-4 py-3 text-gray-500">{LABEL_TIPO_QUARTO[ins.tipoQuarto]}</td>
                      <td className="px-4 py-3 text-gray-500">{formatarData(ins.dataNascimento)}</td>
                      <td className="px-4 py-3 text-right text-gray-500 line-through">{formatarMoeda(ins.valorTotal)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-red-600">
                        {ins.valorPago > 0 ? formatarMoeda(ins.valorPago) : <span className="text-gray-400 font-normal">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
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
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-sm text-gray-500 flex justify-between">
                <span>{filtrados.length} cancelado(s) exibido(s)</span>
                {totalDevolvidos > 0 && (
                  <span className="font-medium text-red-700">
                    Total a devolver: {formatarMoeda(totalDevolvidos)}
                  </span>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
