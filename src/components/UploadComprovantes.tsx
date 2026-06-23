"use client";

import { useState } from "react";
import { atualizarComprovantes } from "@/lib/firestore";
import { Plus, Trash2, ExternalLink, Link } from "lucide-react";

interface Props {
  inscricaoId: string;
  comprovantes: string[];
  onUpdate: (urls: string[]) => void;
}

export default function Comprovantes({ inscricaoId, comprovantes, onUpdate }: Props) {
  const [novoLink, setNovoLink] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleAdicionar() {
    const link = novoLink.trim();
    if (!link) return;
    setSalvando(true);
    try {
      const novas = [...comprovantes, link];
      await atualizarComprovantes(inscricaoId, novas);
      onUpdate(novas);
      setNovoLink("");
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(link: string) {
    if (!confirm("Remover este comprovante?")) return;
    const novas = comprovantes.filter((u) => u !== link);
    await atualizarComprovantes(inscricaoId, novas);
    onUpdate(novas);
  }

  function labelLink(link: string) {
    try {
      const url = new URL(link);
      return url.hostname.replace("www.", "") + url.pathname.slice(0, 30);
    } catch {
      return link.slice(0, 50);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">
          Comprovantes ({comprovantes.length})
        </h4>
      </div>

      {/* Campo para adicionar link */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link size={15} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="url"
            className="input-field pl-9 text-sm"
            placeholder="Cole o link do comprovante (Google Drive, WhatsApp...)"
            value={novoLink}
            onChange={(e) => setNovoLink(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdicionar()}
          />
        </div>
        <button
          onClick={handleAdicionar}
          disabled={!novoLink.trim() || salvando}
          className="btn-primary flex items-center gap-1.5 text-sm"
        >
          <Plus size={15} />
          {salvando ? "Salvando..." : "Adicionar"}
        </button>
      </div>

      <p className="text-xs text-gray-400">
        Compartilhe o arquivo no Google Drive (com link ativo) e cole o link aqui.
      </p>

      {comprovantes.length === 0 && (
        <p className="text-sm text-gray-400 italic">Nenhum comprovante vinculado ainda.</p>
      )}

      <div className="space-y-2">
        {comprovantes.map((link, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200"
          >
            <Link size={15} className="text-primary-500 flex-shrink-0" />
            <span className="text-sm text-gray-700 truncate flex-1">{labelLink(link)}</span>
            <div className="flex gap-2">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-800"
                title="Abrir link"
              >
                <ExternalLink size={15} />
              </a>
              <button
                onClick={() => handleExcluir(link)}
                className="text-red-500 hover:text-red-700"
                title="Remover"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
