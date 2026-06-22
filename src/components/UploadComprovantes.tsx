"use client";

import { useState } from "react";
import { uploadComprovante, excluirComprovante } from "@/lib/storage";
import { atualizarComprovantes } from "@/lib/firestore";
import { Upload, Trash2, FileText, ExternalLink } from "lucide-react";

interface Props {
  inscricaoId: string;
  comprovantes: string[];
  onUpdate: (urls: string[]) => void;
}

export default function UploadComprovantes({ inscricaoId, comprovantes, onUpdate }: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map((f) => uploadComprovante(inscricaoId, f)));
      const novasUrls = [...comprovantes, ...urls];
      await atualizarComprovantes(inscricaoId, novasUrls);
      onUpdate(novasUrls);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleExcluir(url: string) {
    if (!confirm("Excluir este comprovante?")) return;
    await excluirComprovante(url);
    const novas = comprovantes.filter((u) => u !== url);
    await atualizarComprovantes(inscricaoId, novas);
    onUpdate(novas);
  }

  function nomeArquivo(url: string) {
    try {
      const decoded = decodeURIComponent(url.split("/o/")[1].split("?")[0]);
      return decoded.split("/").pop() || "Comprovante";
    } catch {
      return "Comprovante";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">
          Comprovantes ({comprovantes.length})
        </h4>
        <label className="btn-secondary text-sm cursor-pointer flex items-center gap-2">
          <Upload size={14} />
          {uploading ? "Enviando..." : "Adicionar"}
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/*,.pdf"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {comprovantes.length === 0 && (
        <p className="text-sm text-gray-400 italic">Nenhum comprovante anexado.</p>
      )}

      <div className="space-y-2">
        {comprovantes.map((url) => (
          <div
            key={url}
            className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200"
          >
            <FileText size={16} className="text-primary-500 flex-shrink-0" />
            <span className="text-sm text-gray-700 truncate flex-1">{nomeArquivo(url)}</span>
            <div className="flex gap-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-800"
                title="Abrir"
              >
                <ExternalLink size={15} />
              </a>
              <button
                onClick={() => handleExcluir(url)}
                className="text-red-500 hover:text-red-700"
                title="Excluir"
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
