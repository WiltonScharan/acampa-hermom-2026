"use client";

import { useInscricoes } from "@/hooks/useInscricoes";
import { formatarMoeda, LABEL_STATUS } from "@/lib/utils";
import Link from "next/link";
import { Pencil, Bus, Users } from "lucide-react";
import { InscricaoComCalculo } from "@/types";

export default function VillagePage() {
  const { inscricoes, loading } = useInscricoes();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const villagers = inscricoes.filter((i) => i.tipoQuarto === "village");

  // Agrupar por nomeComprador (cada comprador = um casal)
  const casais = villagers.reduce<Record<string, InscricaoComCalculo[]>>((acc, ins) => {
    const key = ins.nomeComprador.trim().toLowerCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(ins);
    return acc;
  }, {});

  const nomesCasais = Object.keys(casais).sort((a, b) => a.localeCompare(b, "pt-BR"));
  const totalPessoas = villagers.length;
  const totalCasais = nomesCasais.length;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Village</h1>
          <p className="text-sm text-gray-500 mt-1">Quartos exclusivos para casais</p>
        </div>
        <div className="flex gap-3">
          <div className="card py-3 px-4 text-center min-w-[80px]">
            <p className="text-2xl font-bold text-primary-600">{totalCasais}</p>
            <p className="text-xs text-gray-500">Casais</p>
          </div>
          <div className="card py-3 px-4 text-center min-w-[80px]">
            <p className="text-2xl font-bold text-primary-600">{totalPessoas}</p>
            <p className="text-xs text-gray-500">Pessoas</p>
          </div>
        </div>
      </div>

      {nomesCasais.length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          Nenhum inscrito no Village ainda.
        </div>
      )}

      {nomesCasais.map((key, idx) => {
        const membros = casais[key];
        const nomeExibicao = membros[0].nomeComprador;
        const totalCasal = membros.reduce((s, m) => s + m.valorTotal, 0);
        const pagoCasal = membros.reduce((s, m) => s + m.valorPago, 0);
        const apagarCasal = membros.reduce((s, m) => s + m.valorAPagar, 0);

        return (
          <div key={key} className="card border-l-4 border-l-primary-500">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-primary-500" />
                <h3 className="font-semibold text-gray-800">Casal #{idx + 1} — {nomeExibicao}</h3>
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                  {membros.length} pessoa(s)
                </span>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-gray-500">Total: <strong>{formatarMoeda(totalCasal)}</strong></span>
                <span className="text-green-700">Pago: <strong>{formatarMoeda(pagoCasal)}</strong></span>
                {apagarCasal > 0 && (
                  <span className="text-red-600">A pagar: <strong>{formatarMoeda(apagarCasal)}</strong></span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left pb-2 font-medium text-gray-500">Nome</th>
                    <th className="text-left pb-2 font-medium text-gray-500">Gênero</th>
                    <th className="text-right pb-2 font-medium text-gray-500">Total</th>
                    <th className="text-right pb-2 font-medium text-gray-500">Pago</th>
                    <th className="text-right pb-2 font-medium text-gray-500 text-red-500">A Pagar</th>
                    <th className="text-center pb-2 font-medium text-gray-500">Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {membros.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="py-2.5 pr-3 font-medium text-gray-900">
                        <span className="flex items-center gap-1.5">
                          {m.nome}
                          {m.onibus && <Bus size={13} className="text-primary-500" />}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 capitalize text-gray-600">{m.genero}</td>
                      <td className="py-2.5 pr-3 text-right">{formatarMoeda(m.valorTotal)}</td>
                      <td className="py-2.5 pr-3 text-right text-green-700">{formatarMoeda(m.valorPago)}</td>
                      <td className={`py-2.5 pr-3 text-right font-semibold ${m.valorAPagar > 0 ? "text-red-600" : "text-green-600"}`}>
                        {formatarMoeda(m.valorAPagar)}
                      </td>
                      <td className="py-2.5 pr-3 text-center">
                        <span className={`badge-${m.status}`}>{LABEL_STATUS[m.status]}</span>
                      </td>
                      <td className="py-2.5">
                        <Link href={`/inscritos/${m.id}`} className="text-primary-600 hover:text-primary-800">
                          <Pencil size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
