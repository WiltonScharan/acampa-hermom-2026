"use client";

import { useEffect, useState } from "react";
import { criarAutorizacao, listarAutorizacoes, deletarAutorizacao, Autorizacao } from "@/lib/autorizacoes";
import { Plus, Copy, CheckCircle, Clock, ExternalLink, Trash2, Eye, X } from "lucide-react";
import Image from "next/image";

export default function AutorizacaoAdminPage() {
  const [autorizacoes, setAutorizacoes] = useState<Autorizacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [nomesMenores, setNomesMenores] = useState("");
  const [criando, setCriando] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [visualizando, setVisualizando] = useState<Autorizacao | null>(null);

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

  async function handleExcluir(id: string) {
    if (!confirm("Excluir esta autorização? Esta ação não pode ser desfeita.")) return;
    setExcluindo(id);
    try {
      await deletarAutorizacao(id);
      setAutorizacoes(autorizacoes.filter((a) => a.id !== id));
    } finally {
      setExcluindo(null);
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

  function isBase64(s: string) {
    return s.startsWith("data:image");
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
                      Assinado por: {a.nomeResponsavel}
                      {a.assinatura && !isBase64(a.assinatura) && (
                        <span className="italic ml-1">— "{a.assinatura}"</span>
                      )}
                      {a.assinatura && isBase64(a.assinatura) && (
                        <span className="ml-1 text-gray-400">(assinatura desenhada)</span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {a.status === "assinado" && (
                    <button
                      onClick={() => setVisualizando(a)}
                      className="btn-secondary text-xs flex items-center gap-1.5 py-1.5"
                      title="Ver documento"
                    >
                      <Eye size={13} /> Ver
                    </button>
                  )}
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
                  <button
                    onClick={() => handleExcluir(a.id)}
                    disabled={excluindo === a.id}
                    className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 text-red-500 hover:text-red-700 hover:border-red-300"
                    title="Excluir"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Ver Documento */}
      {visualizando && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setVisualizando(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-gray-800">Documento Assinado</h2>
              <button onClick={() => setVisualizando(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              {/* Cabeçalho */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 relative flex-shrink-0">
                  <Image src="/hermom.png" alt="Hermom" fill className="rounded-lg object-cover" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Autorização de Participação</p>
                  <p className="text-xs text-gray-500">Acampamento Hermom 2026 · 19 a 22 de novembro</p>
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-2 text-gray-700">
                <p className="text-center font-semibold border-b pb-2">AUTORIZAÇÃO DE PARTICIPAÇÃO PARA MENOR</p>
                <p>Eu, abaixo identificado(a), autorizo o(a)(s) menor(es):</p>
                <p className="font-semibold text-primary-800 bg-primary-50 rounded-lg p-2">{visualizando.nomesMenores}</p>
                <p>a participar do <strong>Acampamento Hermom 2026</strong>, realizado de 19 a 22 de novembro de 2026 no Acampamento Monte Horebe, Cesário Lange/SP.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Responsável</p>
                  <p className="font-medium text-gray-800">{visualizando.nomeResponsavel}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">CPF</p>
                  <p className="font-medium text-gray-800">{visualizando.cpfResponsavel || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Telefone</p>
                  <p className="font-medium text-gray-800">{visualizando.telefoneResponsavel || "—"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Assinatura</p>
                {isBase64(visualizando.assinatura) ? (
                  <div className="border border-gray-200 rounded-lg p-2 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={visualizando.assinatura} alt="Assinatura" className="max-h-24 w-auto" />
                  </div>
                ) : (
                  <p className="font-serif text-xl italic text-gray-800 border-b border-gray-300 pb-1 w-fit">
                    {visualizando.assinatura}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-green-700 bg-green-50 rounded-lg p-3">
                <CheckCircle size={16} />
                <span className="text-xs font-medium">Documento assinado e registrado digitalmente.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
