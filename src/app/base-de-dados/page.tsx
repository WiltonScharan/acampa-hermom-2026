"use client";

import { useState } from "react";
import { criarInscricao } from "@/lib/firestore";
import { calcularValorTotal } from "@/lib/utils";
import { InscricaoForm, TipoQuarto, Genero } from "@/types";
import { Upload, CheckCircle, AlertCircle, Download, Info } from "lucide-react";

// Normalize: lowercase + remove accents + trim
function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

// Maps a CSV column header to our internal field name. Returns null to skip the column.
function mapearColuna(col: string): string | null {
  const n = norm(col);

  // --- Skip list ---
  if (n === "usado") return null;
  if (n === "codigo" || n === "código") return null;
  if (n.includes(" comprador")) return null;     // "e-mail do comprador", "telefone do comprador", etc.
  if (n.includes("igreja") || n.includes("regional")) return null;
  if (n === "status") return null;
  if (n === "cupom") return null;
  if (n.includes("transac") || n.includes("transaç") || n.startsWith("id da")) return null;
  if (n === "parcelas") return null;
  if (n.includes("data da compra") || n.includes("data do pedido")) return null;
  if (n.includes("lider") || n.includes("líder")) return null;
  if (n === "email" || n === "e-mail") return null;  // participant email — skip per user request

  // --- Sistema Acampamentos column names ---
  if (n === "comprador") return "nomeComprador";
  if (n === "nome") return "nome";
  if (n === "cpf") return "cpf";
  if (n === "celular") return "telefone";
  if (n === "tipo") return "tipoQuarto";
  if (n === "genero" || n === "gênero" || n === "sexo") return "genero";
  if (n.includes("nascimento")) return "dataNascimento";
  if (n.includes("transporte")) return "onibus";
  if (n.includes("metodo") || n.includes("método")) return "formaPagamento";
  if (n.includes("preco") && n.includes("cupom")) return "valorPago";

  // --- Nosso template (camelCase) ---
  if (n === "nomecomprador") return "nomeComprador";
  if (n === "datanascimento") return "dataNascimento";
  if (n === "tipoquarto") return "tipoQuarto";
  if (n === "telefone") return "telefone";
  if (n === "onibus") return "onibus";
  if (n === "valortotal") return "valorTotal";
  if (n === "valorpago") return "valorPago";
  if (n === "formapagamento") return "formaPagamento";
  if (n === "observacoes" || n === "observações") return "observacoes";

  return null; // unknown column → skip
}

const LABELS: Record<string, string> = {
  nomeComprador: "Comprador",
  nome: "Nome",
  cpf: "CPF",
  dataNascimento: "Data Nasc.",
  telefone: "Celular",
  tipoQuarto: "Tipo Quarto",
  genero: "Gênero",
  formaPagamento: "Pagamento",
  valorPago: "Valor Pago",
  valorTotal: "Valor Total",
  onibus: "Ônibus",
  observacoes: "Obs.",
};

function converterData(v: string): string {
  const m = v.trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (!m) return v;
  const [, d, mo, a] = m;
  const ano = a.length === 2 ? (parseInt(a) > 30 ? `19${a}` : `20${a}`) : a;
  return `${ano}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

type LinhaRaw = Record<string, string>;

function parseCSV(texto: string): LinhaRaw[] {
  const linhas = texto.trim().split(/\r?\n/);
  if (linhas.length < 2) return [];
  const sep = linhas[0].includes("\t") ? "\t" : linhas[0].includes(";") ? ";" : ",";
  const cabecalho = linhas[0].split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
  return linhas.slice(1).filter((l) => l.trim()).map((linha) => {
    const cols = linha.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
    const obj: LinhaRaw = {};
    cabecalho.forEach((col, i) => {
      const campo = mapearColuna(col);
      if (campo !== null) obj[campo] = cols[i] || "";
    });
    return obj;
  });
}

function converterLinha(row: LinhaRaw): InscricaoForm | null {
  const nome = row.nome?.trim();
  const dataNascimento = converterData(row.dataNascimento?.trim() || "");
  if (!nome || !dataNascimento) return null;

  const tipoStr = norm(row.tipoQuarto || "");
  const tipoQuarto: TipoQuarto = tipoStr.includes("village") ? "village" : "coletivo";

  const onibusStr = norm(row.onibus || "");
  const onibus =
    !onibusStr.includes("proprio") &&
    !onibusStr.includes("próprio") &&
    !onibusStr.includes("nao") &&
    !onibusStr.includes("não") &&
    onibusStr !== "" && onibusStr !== "n" &&
    (onibusStr.includes("sim") || onibusStr.includes("onibus") || onibusStr.includes("ônibus"));

  const generoStr = norm(row.genero || "");
  const genero: Genero = generoStr.startsWith("f") ? "feminino" : "masculino";

  const pagStr = norm(row.formaPagamento || "");
  const formaPagamento = (pagStr.includes("pix") ? "pix" :
    pagStr.includes("cart") ? "cartao" :
    pagStr.includes("dinheiro") ? "dinheiro" :
    pagStr.includes("boleto") ? "boleto" : "pix") as InscricaoForm["formaPagamento"];

  const valorPago = row.valorPago
    ? parseFloat(row.valorPago.replace(/[^\d,\.]/g, "").replace(",", ".")) : 0;
  const valorTotal = row.valorTotal
    ? parseFloat(row.valorTotal.replace(/[^\d,\.]/g, "").replace(",", "."))
    : calcularValorTotal(dataNascimento, tipoQuarto, onibus);

  return {
    nome,
    dataNascimento,
    genero,
    cpf: row.cpf || "",
    telefone: row.telefone || "",
    email: "",
    nomeComprador: row.nomeComprador || nome,
    ehComprador: !row.nomeComprador || row.nomeComprador === nome,
    tipoQuarto,
    onibus,
    valorTotal,
    valorPago,
    formaPagamento,
    status: "pendente",
    observacoes: row.observacoes || "",
  };
}

interface ResultadoImport {
  nome: string;
  status: "ok" | "erro";
  mensagem?: string;
}

export default function BaseDadosPage() {
  const [texto, setTexto] = useState("");
  const [linhas, setLinhas] = useState<LinhaRaw[]>([]);
  const [resultados, setResultados] = useState<ResultadoImport[]>([]);
  const [importando, setImportando] = useState(false);
  const [aba, setAba] = useState<"colar" | "upload">("colar");

  function processarTexto(t: string) {
    setTexto(t);
    setResultados([]);
    if (!t.trim()) { setLinhas([]); return; }
    try {
      setLinhas(parseCSV(t).slice(0, 1000));
    } catch {
      setLinhas([]);
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
    const todasLinhas = parseCSV(texto);
    setImportando(true);
    const res: ResultadoImport[] = [];

    for (const linha of todasLinhas) {
      const dados = converterLinha(linha);
      if (!dados) {
        res.push({ nome: linha.nome || "(sem nome)", status: "erro", mensagem: "Nome ou data de nascimento ausente" });
        continue;
      }
      try {
        await criarInscricao(dados);
        res.push({ nome: dados.nome, status: "ok" });
      } catch (err) {
        res.push({ nome: dados.nome, status: "erro", mensagem: String(err) });
      }
    }

    setResultados(res);
    setImportando(false);
  }

  function baixarModelo() {
    const cab = "nome;dataNascimento;genero;cpf;telefone;nomeComprador;tipoQuarto;onibus;valorTotal;valorPago;formaPagamento;observacoes";
    const ex = "João Silva;1990-05-15;masculino;000.000.000-00;(11) 99999-9999;João Silva;coletivo;nao;820;100;pix;";
    const blob = new Blob([`${cab}\n${ex}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "modelo-importacao.csv"; a.click();
  }

  // Columns present in the parsed rows
  const colunasMapeadas = linhas.length > 0
    ? Object.keys(linhas[0]).filter((k) => LABELS[k])
    : [];

  const preview = linhas.slice(0, 10);
  const sucessos = resultados.filter((r) => r.status === "ok").length;
  const erros = resultados.filter((r) => r.status === "erro").length;

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Base de Dados</h1>
          <p className="text-sm text-gray-500">Importe inscrições em lote — CSV do sistema ou nosso modelo</p>
        </div>
        <button onClick={baixarModelo} className="btn-secondary flex items-center gap-2 text-sm">
          <Download size={15} /> Baixar Modelo CSV
        </button>
      </div>

      {/* Instrução */}
      <div className="card bg-amber-50 border-amber-200">
        <div className="flex items-start gap-2">
          <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 space-y-1">
            <p className="font-semibold">Formatos aceitos</p>
            <p><strong>Exportação direta do sistema:</strong> cole o CSV sem precisar editar nada. As colunas desnecessárias são ignoradas automaticamente.</p>
            <p><strong>Nosso modelo:</strong> baixe o modelo acima, preencha e importe.</p>
            <p className="text-xs text-amber-600">Separador: vírgula, ponto-e-vírgula ou tabulação. Obrigatório: <strong>Nome</strong> e <strong>Data de Nascimento</strong> (DD/MM/AAAA ou AAAA-MM-DD).</p>
          </div>
        </div>
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
          placeholder="Cole aqui o CSV exportado do sistema..."
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
      {preview.length > 0 && colunasMapeadas.length > 0 && (
        <div className="card overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">
              Preview — {preview.length} de {linhas.length} linha(s)
            </h3>
            <span className="text-xs text-gray-400">{colunasMapeadas.length} colunas importadas</span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                {colunasMapeadas.map((k) => (
                  <th key={k} className="text-left pb-1.5 pr-3 font-medium text-gray-500 whitespace-nowrap">
                    {LABELS[k] ?? k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {preview.map((row, i) => (
                <tr key={i}>
                  {colunasMapeadas.map((k) => (
                    <td key={k} className="py-1.5 pr-3 text-gray-700 max-w-[160px] truncate">
                      {row[k] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Botão importar */}
      {texto && linhas.length > 0 && resultados.length === 0 && (
        <button
          onClick={handleImportar}
          disabled={importando}
          className="btn-primary flex items-center gap-2"
        >
          <Upload size={16} />
          {importando ? "Importando..." : `Importar ${linhas.length} registro(s)`}
        </button>
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
              <div
                key={i}
                className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${
                  r.status === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                }`}
              >
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
