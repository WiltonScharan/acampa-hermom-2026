"use client";

import { useEffect, useRef, useState } from "react";
import { ouvirAnotacoes, criarAnotacao, atualizarAnotacao, excluirAnotacao, Anotacao } from "@/lib/firestore";
import { NotebookPen, Plus, Trash2, Check } from "lucide-react";

const CORES: { valor: string; bg: string; borda: string; titulo: string }[] = [
  { valor: "yellow",  bg: "bg-yellow-50",  borda: "border-yellow-300", titulo: "text-yellow-800" },
  { valor: "blue",    bg: "bg-blue-50",    borda: "border-blue-300",   titulo: "text-blue-800"   },
  { valor: "green",   bg: "bg-green-50",   borda: "border-green-300",  titulo: "text-green-800"  },
  { valor: "pink",    bg: "bg-pink-50",    borda: "border-pink-300",   titulo: "text-pink-800"   },
  { valor: "purple",  bg: "bg-purple-50",  borda: "border-purple-300", titulo: "text-purple-800" },
  { valor: "orange",  bg: "bg-orange-50",  borda: "border-orange-300", titulo: "text-orange-800" },
];

function corConfig(cor: string) {
  return CORES.find((c) => c.valor === cor) ?? CORES[0];
}

function NotaCard({ nota, onDelete }: { nota: Anotacao; onDelete: () => void }) {
  const [titulo, setTitulo] = useState(nota.titulo);
  const [conteudo, setConteudo] = useState(nota.conteudo);
  const [cor, setCor] = useState(nota.cor || "yellow");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sincroniza se a nota mudar externamente (onSnapshot)
  useEffect(() => { setTitulo(nota.titulo); }, [nota.titulo]);
  useEffect(() => { setConteudo(nota.conteudo); }, [nota.conteudo]);
  useEffect(() => { setCor(nota.cor); }, [nota.cor]);

  function agendar(campo: Partial<Pick<Anotacao, "titulo" | "conteudo" | "cor">>) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSalvando(true);
      await atualizarAnotacao(nota.id, campo);
      setSalvando(false);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 1500);
    }, 600);
  }

  async function mudarCor(novaCor: string) {
    setCor(novaCor);
    await atualizarAnotacao(nota.id, { cor: novaCor });
  }

  const cfg = corConfig(cor);

  return (
    <div className={`rounded-2xl border ${cfg.bg} ${cfg.borda} p-4 flex flex-col gap-3 shadow-sm`}>
      {/* Título */}
      <input
        type="text"
        placeholder="Título..."
        className={`bg-transparent font-semibold text-base placeholder-opacity-50 outline-none border-none w-full ${cfg.titulo}`}
        value={titulo}
        onChange={(e) => {
          setTitulo(e.target.value);
          agendar({ titulo: e.target.value });
        }}
      />

      {/* Conteúdo */}
      <textarea
        placeholder="Escreva aqui..."
        rows={5}
        className="bg-transparent text-sm text-gray-700 resize-none outline-none border-none w-full placeholder-gray-400 leading-relaxed"
        value={conteudo}
        onChange={(e) => {
          setConteudo(e.target.value);
          agendar({ conteudo: e.target.value });
        }}
      />

      {/* Rodapé */}
      <div className="flex items-center justify-between pt-1 border-t border-black/5">
        {/* Seletor de cor */}
        <div className="flex items-center gap-1.5">
          {CORES.map((c) => (
            <button
              key={c.valor}
              onClick={() => mudarCor(c.valor)}
              className={`w-4 h-4 rounded-full border-2 transition-transform ${
                cor === c.valor ? "scale-125 border-gray-500" : "border-transparent"
              } bg-${c.valor}-300`}
              style={{ backgroundColor: colorHex(c.valor) }}
              title={c.valor}
            />
          ))}
        </div>

        {/* Status + Excluir */}
        <div className="flex items-center gap-3">
          {salvando && <span className="text-xs text-gray-400">Salvando...</span>}
          {salvo && !salvando && (
            <span className="text-xs text-green-600 flex items-center gap-0.5">
              <Check size={11} /> Salvo
            </span>
          )}
          <button
            onClick={() => {
              if (confirm("Excluir esta anotação?")) onDelete();
            }}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Excluir anotação"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function colorHex(cor: string): string {
  const map: Record<string, string> = {
    yellow: "#fde68a",
    blue:   "#93c5fd",
    green:  "#86efac",
    pink:   "#f9a8d4",
    purple: "#c4b5fd",
    orange: "#fdba74",
  };
  return map[cor] ?? "#fde68a";
}

export default function AnotacoesPage() {
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [criando, setCriando] = useState(false);

  useEffect(() => {
    const unsub = ouvirAnotacoes((data) => {
      setAnotacoes(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleNova() {
    setCriando(true);
    await criarAnotacao();
    setCriando(false);
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
        <div className="flex items-center gap-3">
          <NotebookPen size={22} className="text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Anotações</h1>
            <p className="text-sm text-gray-500">{anotacoes.length} anotação(ões)</p>
          </div>
        </div>
        <button
          onClick={handleNova}
          disabled={criando}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          {criando ? "Criando..." : "Nova Anotação"}
        </button>
      </div>

      {anotacoes.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <NotebookPen size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Nenhuma anotação ainda.</p>
          <p className="text-sm mt-1">Clique em <strong>Nova Anotação</strong> para começar.</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {anotacoes.map((nota) => (
            <div key={nota.id} className="break-inside-avoid mb-4">
              <NotaCard
                nota={nota}
                onDelete={() => excluirAnotacao(nota.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
