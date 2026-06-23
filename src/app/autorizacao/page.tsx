"use client";

import { useEffect, useState } from "react";
import { criarAutorizacao, listarAutorizacoes, Autorizacao } from "@/lib/autorizacoes";
import { Plus, Copy, CheckCircle, Clock, ExternalLink } from "lucide-react";

export default function AutorizacaoAdminPage() {
  const [autorizacoes, setAutorizacoes] = useState<Autorizacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [nomesMenores, setNomesMenores] = useState("");
  const [criando, setCriando] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => {
    listarAutorizacoes().then((data) => {
      setAutorizacoes(data);
      setLoading(false);
    });
  }, []);

  async function handleCriar() {
    if (!nomesMenores.trim()) return;
    setCriando(true);
    try {
      const id = await criarAutorizacao(nomesMenores.trim());
      const nova: Autorizacao = {
        id, nomesMenores: nomesMenores.trim(),
        nomeResponsavel: "", cpfResponsavel: "", telefoneResponsavel: "",
        assinatura: "", status: "pendente", criadoEm: null, assinadoEm: null,
      };
      setAutorizacoes([nova, ...autorizacoes]);
      setNomesMenores("");
    } finally {
      setCriando(false);
    }
  }

  function linkAutorizacao(id: string) {
    return `${window.location.origin}/autorizacao/assinar/${id}`;
  }

  async function copiarLink(id: string) {
    await navigator.clipboard.writeText(linkAutorizacao(id));
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  }

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Autorização para Menores</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gere um link para o responsável preencher e assinar digitalmente.
        </p>
      </div>

      {/* Criar nova */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-3">Gerar nova autorização</h3>
        <div className="flex gap-2">
          <input
            className="input-field flex-1"
            placeholder="Nome(s) do(s) menor(es) — ex: Maria Silva, Pedro Silva"
            value={nomesMenores}
            onChange={(e) => setNomesMenores(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCriar()}
          />
          <button
            onClick={handleCriar}
            disabled={!nomesMenores.trim() || criando}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            {criando ? "Criando..." : "Gerar Link"}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Após gerar, copie o link e envie pelo WhatsApp para o responsável assinar.
        </p>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : autorizacoes.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          Nenhuma autorização criada ainda.
        </div>
      ) : (
        <div className="space-y-3">
          {autorizacoes.map((a) => (
            <div key={a.id} className={`card border-l-4 ${a.status === "assinado" ? "border-l-green-500" : "border-l-yellow-400"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {a.status === "assinado" ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        <CheckCircle size={11} /> Assinado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                        <Clock size={11} /> Pendente
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-gray-800 text-sm">{a.nomesMenores}</p>
                  {a.status === "assinado" && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Assinado por: {a.nomeResponsavel} — {a.assinatura}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => copiarLink(a.id)}
                    className="btn-secondary text-xs flex items-center gap-1.5 py-1.5"
                    title="Copiar link"
                  >
                    {copiado === a.id ? <CheckCircle size={13} className="text-green-600" /> : <Copy size={13} />}
                    {copiado === a.id ? "Copiado!" : "Copiar link"}
                  </button>
                  <a
                    href={`/autorizacao/assinar/${a.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs flex items-center gap-1.5 py-1.5"
                    title="Abrir"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
