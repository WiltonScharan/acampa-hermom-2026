"use client";

import { useState } from "react";
import { criarInscricao } from "@/lib/firestore";
import { calcularValorTotal, calcularIdadeNaData } from "@/lib/utils";
import { InscricaoForm, TipoQuarto, Genero } from "@/types";
import { Upload, CheckCircle, AlertCircle, Download } from "lucide-react";

interface LinhaPlanilha {
  nome: string;
  dataNascimento: string;
  genero: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  nomeComprador: string;
  tipoQuarto: string;
  onibus: string;
  valorTotal?: string;
  valorPago?: string;
  formaPagamento?: string;
  observacoes?: string;
}

interface ResultadoImport {
  nome: string;
  status: "ok" | "erro";
  mensagem?: string;
}

const COLUNAS_ESPERADAS = [
  "nome", "dataNascimento", "genero", "cpf", "telefone",
  "email", "nomeComprador", "tipoQuarto", "onibus",
  "valorTotal", "valorPago", "formaPagamento", "observacoes"
];

function parseCSV(texto: string): LinhaPlanilha[] {
  const linhas = texto.trim().split("\n");
  const cabecalho = linhas[0].split(/[,;\t]/).map((c) => c.trim().replace(/"/g, ""));
  return linhas.slice(1).map((linha) => {
    const cols = linha.split(/[,;\t]/).map((c) => c.trim().replace(/"/g, ""));
    const obj: Record<string, string> = {};
    cabecalho.forEach((col, i) => { obj[col] = cols[i] || ""; });
    return obj as unknown as LinhaPlanilha;
  });
}

function normalizar(v: string, opcoes: string[]): string {
  const lv = v.toLowerCase().trim();
  return opcoes.find((o) => o.toLowerCase().includes(lv) || lv.includes(o.toLowerCase())) || opcoes[0];
}

export default function BaseDadosPage() {
  const [texto, setTexto] = useState("");
  const [preview, setPreview] = useState<LinhaPlanilha[]>([]);
  const [resultados, setResultados] = useState<ResultadoImport[]>([]);
  const [importando, setImportando] = useState(false);
  const [aba, setAba] = useState<"colar" | "upload">("colar");

  function processarTexto(t: string) {
    setTexto(t);
    if (!t.trim()) { setPreview([]); return; }
    try {
      const linhas = parseCSV(t);
      setPreview(linhas.slice(0, 10));
    } catch {
      setPreview([]);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    processarTexto(content);
    e.target.value = "";
  }

  async function handleImportar() {
    const linhas = parseCSV(texto);
    setImportando(true);
    const res: ResultadoImport[] = [];

    for (const linha of linhas) {
      try {
        if (!linha.nome || !linha.dataNascimento) {
          res.push({ nome: linha.nome || "(sem nome)", status: "erro", mensagem: "Nome ou data de nascimento ausente" });
          continue;
        }

        const genero = (linha.genero?.toLowerCase().startsWith("f") ? "feminino" : "masculino") as Genero;
        const tipoQuarto = (linha.tipoQuarto?.toLowerCase().includes("village") ? "village" : "coletivo") as TipoQuarto;
        const onibus = ["s", "sim", "yes", "1", "true"].includes(linha.onibus?.toLowerCase()?.trim() || "");
        const valorTotal = linha.valorTotal ? parseFloat(linha.valorTotal.replace(",", ".")) : calcularValorTotal(linha.dataNascimento, tipoQuarto, onibus);
        const valorPago = linha.valorPago ? parseFloat(linha.valorPago.replace(",", ".")) : 0;

        const data: InscricaoForm = {
          nome: linha.nome,
          dataNascimento: linha.dataNascimento,
          genero,
          cpf: linha.cpf || "",
          telefone: linha.telefone || "",
          email: linha.email || "",
          nomeComprador: linha.nomeComprador || linha.nome,
          ehComprador: linha.nomeComprador === linha.nome || !linha.nomeComprador,
          tipoQuarto,
          onibus,
          valorTotal,
          valorPago,
          formaPagamento: (linha.formaPagamento as InscricaoForm["formaPagamento"]) || "",
          status: "pendente",
          observacoes: linha.observacoes || "",
        };

        await criarInscricao(data);
        res.push({ nome: linha.nome, status: "ok" });
      } catch (err) {
        res.push({ nome: linha.nome || "?", status: "erro", mensagem: String(err) });
      }
    }

    setResultados(res);
    setImportando(false);
  }

  function baixarModelo() {
    const cabecalho = COLUNAS_ESPERADAS.join(";");
    const exemplo = [
      "João Silva",
      "1990-05-15",
      "masculino",
      "000.000.000-00",
      "(11) 99999-9999",
      "joao@email.com",
      "João Silva",
      "coletivo",
      "nao",
      "820",
      "100",
      "pix",
      ""
    ].join(";");
    const csv = `${cabecalho}\n${exemplo}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo-importacao.csv";
    a.click();
  }

  const sucessos = resultados.filter((r) => r.status === "ok").length;
  const erros = resultados.filter((r) => r.status === "erro").length;

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Base de Dados</h1>
          <p className="text-sm text-gray-500">Importe inscrições em lote via planilha CSV</p>
        </div>
        <button onClick={baixarModelo} className="btn-secondary flex items-center gap-2 text-sm">
          <Download size={15} /> Baixar Modelo CSV
        </button>
      </div>

      {/* Instruções */}
      <div className="card bg-amber-50 border-amber-200">
        <h3 className="font-semibold text-amber-800 mb-2">Como usar</h3>
        <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
          <li>Baixe o modelo CSV e preencha com os dados dos inscritos</li>
          <li>Cole o conteúdo abaixo ou faça upload do arquivo</li>
          <li>Revise o preview e clique em Importar</li>
        </ol>
        <p className="text-xs text-amber-600 mt-2">
          Colunas obrigatórias: <strong>nome</strong>, <strong>dataNascimento</strong> (AAAA-MM-DD).
          Separador: vírgula, ponto-e-vírgula ou tab.
        </p>
      </div>

      {/* Abas */}
      <div className="flex gap-2 border-b border-gray-200">
        {(["colar", "upload"] as const).map((a) => (
          <button
            key={a}
            onClick={() => setAba(a)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              aba === a ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {a === "colar" ? "Colar dados" : "Upload CSV"}
          </button>
        ))}
      </div>

      {aba === "colar" ? (
        <textarea
          className="input-field font-mono text-xs h-48 resize-none"
          placeholder={`nome;dataNascimento;genero;...\nJoão Silva;1990-05-15;masculino;...`}
          value={texto}
          onChange={(e) => processarTexto(e.target.value)}
        />
      ) : (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-12 cursor-pointer hover:border-primary-400 transition-colors">
          <Upload size={32} className="text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Clique para selecionar ou arraste um arquivo .csv</p>
          <input type="file" accept=".csv,.txt" className="hidden" onChange={handleUpload} />
        </label>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <div className="card overflow-x-auto">
          <h3 className="font-semibold text-gray-700 mb-3">Preview (primeiras {preview.length} linhas)</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                {Object.keys(preview[0]).map((k) => (
                  <th key={k} className="text-left pb-1.5 pr-3 font-medium text-gray-500">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {preview.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((v, j) => (
                    <td key={j} className="py-1.5 pr-3 text-gray-700">{v || "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Botão importar */}
      {texto && preview.length > 0 && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleImportar}
            disabled={importando}
            className="btn-primary flex items-center gap-2"
          >
            <Upload size={16} />
            {importando ? "Importando..." : `Importar ${parseCSV(texto).length} registro(s)`}
          </button>
        </div>
      )}

      {/* Resultados */}
      {resultados.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-4 mb-4">
            <span className="flex items-center gap-1 text-green-700 font-semibold">
              <CheckCircle size={16} /> {sucessos} importado(s)
            </span>
            {erros > 0 && (
              <span className="flex items-center gap-1 text-red-600 font-semibold">
                <AlertCircle size={16} /> {erros} erro(s)
              </span>
            )}
          </div>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {resultados.map((r, i) => (
              <div key={i} className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${r.status === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                {r.status === "ok" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                <span className="font-medium">{r.nome}</span>
                {r.mensagem && <span className="text-xs opacity-75">— {r.mensagem}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
