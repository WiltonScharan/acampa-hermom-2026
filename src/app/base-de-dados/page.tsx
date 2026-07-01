"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { criarInscricao, listarInscricoes, contarInscricoesImportadas, excluirInscricoesImportadas } from "@/lib/firestore";
import { calcularValorTotal, inferirGenero } from "@/lib/utils";
import { InscricaoForm, TipoQuarto, Genero } from "@/types";
import { Upload, CheckCircle, AlertCircle, Download, Info, Users, UserCheck, Trash2 } from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

function mapearColuna(col: string): string | null {
  const n = norm(col);
  if (!n) return null;

  // --- Skip list ---
  if (n === "usado") return null;
  if (n === "codigo") return null;
  if (n.includes(" comprador")) return null;   // "e-mail do comprador" etc (not "comprador" itself)
  if (n.includes("igreja") || n.includes("regional")) return null;
  if (n === "status") return null;
  if (n === "cupom" && !n.includes("preco")) return null;
  if (n.includes("transac") || n.startsWith("id da")) return null;
  if (n === "parcelas") return null;
  if (n.includes("data da compra") || n.includes("data do pedido")) return null;
  if (n.includes("lider")) return null;
  if (n === "email" || n === "e-mail") return null;

  // --- Exact matches (our template) ---
  if (n === "comprador") return "nomeComprador";
  if (n === "nome") return "nome";
  if (n === "cpf") return "cpf";
  if (n === "celular") return "telefone";
  if (n === "telefone") return "telefone";
  if (n === "tipo") return "tipoQuarto";
  if (n === "genero" || n === "sexo") return "genero";
  if (n === "nomecomprador") return "nomeComprador";
  if (n === "datanascimento") return "dataNascimento";
  if (n === "tipoquarto") return "tipoQuarto";
  if (n === "onibus") return "onibus";
  if (n === "valortotal") return "valorTotal";
  if (n === "valorpago") return "valorPago";
  if (n === "formapagamento") return "formaPagamento";
  if (n === "observacoes") return "observacoes";

  // --- Flexible matches (handles "Nome Completo", "Nome Co CPF", etc.) ---
  if (n.includes("nome") && !n.includes("comprador")) return "nome";
  if (n.includes("cpf")) return "cpf";
  if (n.includes("nascimento")) return "dataNascimento";
  if (n.includes("transporte")) return "onibus";
  if (n.includes("metodo") || n.includes("forma") && n.includes("pag")) return "formaPagamento";
  if (n.includes("preco") && n.includes("cupom")) return "valorPago";
  if (n.includes("celular") || n.includes("fone")) return "telefone";
  if (n.includes("genero") || n.includes("sexo")) return "genero";

  return null;
}

const LABELS: Record<string, string> = {
  nomeComprador: "Comprador", nome: "Nome", cpf: "CPF",
  dataNascimento: "Data Nasc.", telefone: "Celular", tipoQuarto: "Tipo Quarto",
  genero: "Gênero", formaPagamento: "Pagamento", valorPago: "Valor Pago",
  valorTotal: "Valor Total", onibus: "Ônibus", observacoes: "Obs.",
};

function converterData(v: string): string {
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(v.trim())) return v.trim();
  const m = v.trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (!m) return v;
  const [, d, mo, a] = m;
  const ano = a.length === 2 ? (parseInt(a) > 30 ? `19${a}` : `20${a}`) : a;
  return `${ano}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

type LinhaRaw = Record<string, string>;

let _ultimosHeadersBrutos: string[] = [];

function parseLinhas(cabecalho: string[], valores: string[][]): LinhaRaw[] {
  _ultimosHeadersBrutos = cabecalho.filter(Boolean);
  return valores.filter((cols) => cols.some((c) => c.trim())).map((cols) => {
    const obj: LinhaRaw = {};
    cabecalho.forEach((col, i) => {
      const campo = mapearColuna(col);
      if (campo !== null) obj[campo] = (cols[i] ?? "").toString().trim();
    });
    return obj;
  });
}

function parseCSV(texto: string): LinhaRaw[] {
  const linhas = texto.trim().split(/\r?\n/);
  if (linhas.length < 2) return [];
  const sep = linhas[0].includes("\t") ? "\t" : linhas[0].includes(";") ? ";" : ",";
  const cabecalho = linhas[0].split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
  const valores = linhas.slice(1).map((l) => l.split(sep).map((c) => c.trim().replace(/^"|"$/g, "")));
  return parseLinhas(cabecalho, valores);
}

function parseXLSX(buffer: ArrayBuffer): LinhaRaw[] {
  const wb = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<(string | number | Date)[]>(sheet, {
    header: 1,
    raw: false,
    dateNF: "DD/MM/YYYY",
  });
  if (rows.length < 2) return [];
  const cabecalho = (rows[0] as string[]).map(String);
  const valores = rows.slice(1).map((r) => (r as (string | number)[]).map(String));
  return parseLinhas(cabecalho, valores);
}

// Chave de dedup: Nome + Comprador + DataNascimento + Quarto
// (DataNasc é mais preciso que Categoria — evita falsa colisão entre pessoas de mesmo nome na mesma faixa etária)
function chaveQuatro(nomePart: string, comprador: string, dataNasc: string, tipoQuarto: TipoQuarto): string {
  return `${norm(nomePart)}|${norm(comprador)}|${dataNasc}|${tipoQuarto}`;
}

function chaveQuatroDaLinha(row: LinhaRaw): string {
  const nome = row.nome?.trim() || "";
  const comprador = row.nomeComprador?.trim() || nome;
  const dob = converterData(row.dataNascimento?.trim() || "");
  const tipoStr = norm(row.tipoQuarto || "");
  const tipoQuarto: TipoQuarto = tipoStr.includes("village") ? "village" : "coletivo";
  return chaveQuatro(nome, comprador, dob, tipoQuarto);
}

function converterLinha(row: LinhaRaw): InscricaoForm | null {
  const nome = row.nome?.trim();
  const dataNascimento = converterData(row.dataNascimento?.trim() || "");
  if (!nome || !dataNascimento) return null;

  const tipoStr = norm(row.tipoQuarto || "");
  const tipoQuarto: TipoQuarto = tipoStr.includes("village") ? "village" : "coletivo";

  const onibusStr = norm(row.onibus || "");
  const onibus =
    !onibusStr.includes("proprio") && !onibusStr.includes("próprio") &&
    !onibusStr.includes("nao") && !onibusStr.includes("não") &&
    onibusStr !== "" && onibusStr !== "n" &&
    (onibusStr.includes("sim") || onibusStr.includes("onibus") || onibusStr.includes("ônibus"));

  const generoStr = norm(row.genero || "");
  const genero: Genero = generoStr.startsWith("f") ? "feminino"
    : generoStr.startsWith("m") ? "masculino"
    : inferirGenero(nome);

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
    nome, dataNascimento, genero,
    cpf: row.cpf || "", telefone: row.telefone || "", email: "",
    nomeComprador: row.nomeComprador || nome,
    ehComprador: !row.nomeComprador || row.nomeComprador === nome,
    tipoQuarto, onibus, valorTotal, valorPago, formaPagamento,
    status: "pendente", observacoes: row.observacoes || "",
    origemImportacao: true,
  };
}

interface ResultadoImport { nome: string; status: "ok" | "erro"; mensagem?: string; }

// ─── Component ──────────────────────────────────────────────────────────────

export default function BaseDadosPage() {
  const [novas, setNovas] = useState<LinhaRaw[]>([]);
  const [existentes, setExistentes] = useState<LinhaRaw[]>([]);
  const [verificando, setVerificando] = useState(false);
  const [resultados, setResultados] = useState<ResultadoImport[]>([]);
  const [importando, setImportando] = useState(false);
  const [aba, setAba] = useState<"upload" | "colar">("upload");
  const [texto, setTexto] = useState("");
  const [arrastando, setArrastando] = useState(false);
  const [totalImportados, setTotalImportados] = useState<number | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [headersBrutos, setHeadersBrutos] = useState<string[]>([]);
  const [incluirExistentes, setIncluirExistentes] = useState(false);
  const [descartadas, setDescartadas] = useState<LinhaRaw[]>([]);

  async function processarLinhas(linhas: LinhaRaw[]) {
    setHeadersBrutos([..._ultimosHeadersBrutos]);
    if (!linhas.length) return;
    setVerificando(true);
    setResultados([]);
    try {
      const inscritos = await listarInscricoes();

      // Chave Firebase: Nome + Comprador + Categoria + Quarto
      const chavesExistentes = new Set<string>();
      for (const i of inscritos) {
        chavesExistentes.add(chaveQuatro(i.nome, i.nomeComprador, i.dataNascimento, i.tipoQuarto));
      }

      // Deduplicar a própria planilha pela mesma chave (mesma pessoa aparecendo 2x)
      const vistosNaPlanilha = new Map<string, LinhaRaw>(); // chave → primeira ocorrência
      const linhasUnicas: LinhaRaw[] = [];
      const desc: LinhaRaw[] = [];
      for (const linha of linhas) {
        if (!norm(linha.nome || "")) {
          desc.push({ ...linha, _motivo: "nome vazio" } as LinhaRaw);
          continue;
        }
        const chave = chaveQuatroDaLinha(linha);
        if (vistosNaPlanilha.has(chave)) {
          desc.push({ ...linha, _motivo: "duplicata" } as LinhaRaw);
          continue;
        }
        vistosNaPlanilha.set(chave, linha);
        linhasUnicas.push(linha);
      }

      const nov: LinhaRaw[] = [];
      const ex: LinhaRaw[] = [];
      for (const linha of linhasUnicas) {
        (chavesExistentes.has(chaveQuatroDaLinha(linha)) ? ex : nov).push(linha);
      }
      setNovas(nov);
      setExistentes(ex);
      setDescartadas(desc);
    } finally {
      setVerificando(false);
    }
  }

  async function processarArquivo(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "xlsx" || ext === "xls") {
      const buf = await file.arrayBuffer();
      await processarLinhas(parseXLSX(buf));
    } else {
      const content = await file.text();
      await processarLinhas(parseCSV(content));
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    await processarArquivo(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setArrastando(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setArrastando(false);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setArrastando(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processarArquivo(file);
  }

  async function handleColar() {
    if (!texto.trim()) return;
    await processarLinhas(parseCSV(texto));
  }

  async function handleImportar() {
    setImportando(true);
    const res: ResultadoImport[] = [];
    const linhasParaImportar = incluirExistentes ? [...novas, ...existentes] : novas;
    for (const linha of linhasParaImportar) {
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
    const a = document.createElement("a"); a.href = url; a.download = "modelo-importacao.csv"; a.click();
  }

  function limpar() {
    setNovas([]); setExistentes([]); setResultados([]); setTexto(""); setIncluirExistentes(false); setDescartadas([]);
  }

  async function verificarImportados() {
    const total = await contarInscricoesImportadas();
    setTotalImportados(total);
  }

  async function handleExcluirImportados() {
    if (!confirm(`Excluir ${totalImportados} inscrito(s) importados via planilha? Quem foi cadastrado manualmente não será afetado.`)) return;
    setExcluindo(true);
    try {
      const removidos = await excluirInscricoesImportadas();
      alert(`${removidos} inscrito(s) removido(s) com sucesso.`);
      setTotalImportados(0);
    } finally {
      setExcluindo(false);
    }
  }

  const colunasMapeadas = novas.length > 0
    ? Object.keys(novas[0]).filter((k) => LABELS[k])
    : existentes.length > 0
    ? Object.keys(existentes[0]).filter((k) => LABELS[k])
    : [];

  const sucessos = resultados.filter((r) => r.status === "ok").length;
  const erros = resultados.filter((r) => r.status === "erro").length;
  const temDados = novas.length > 0 || existentes.length > 0;

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Base de Dados</h1>
          <p className="text-sm text-gray-500">Importe inscrições em lote — detecta automaticamente quem já está cadastrado</p>
        </div>
        <button onClick={baixarModelo} className="btn-secondary flex items-center gap-2 text-sm">
          <Download size={15} /> Baixar Modelo CSV
        </button>
      </div>

      {/* Gerenciar importados */}
      <div className="card border-red-100 bg-red-50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-red-800 text-sm flex items-center gap-2">
              <Trash2 size={15} /> Excluir inscritos importados via planilha
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Remove apenas quem foi importado pela planilha. Cadastros manuais não são afetados.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {totalImportados === null ? (
              <button onClick={verificarImportados} className="btn-secondary text-xs py-1.5">
                Verificar total
              </button>
            ) : totalImportados === 0 ? (
              <span className="text-xs text-gray-500">Nenhum inscrito importado.</span>
            ) : (
              <>
                <span className="text-sm font-semibold text-red-700">{totalImportados} inscrito(s)</span>
                <button
                  onClick={handleExcluirImportados}
                  disabled={excluindo}
                  className="btn-secondary text-xs py-1.5 text-red-600 hover:text-red-800 border-red-300 hover:border-red-500"
                >
                  <Trash2 size={13} className="inline mr-1" />
                  {excluindo ? "Excluindo..." : "Excluir todos"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="card bg-amber-50 border-amber-200">
        <div className="flex items-start gap-2">
          <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 space-y-1">
            <p className="font-semibold">Como funciona</p>
            <p>Faça upload do seu arquivo <strong>.xlsx</strong> ou <strong>.csv</strong> exportado do sistema. O importador compara com os inscritos já cadastrados (por CPF ou nome+data de nascimento) e mostra <strong>somente os novos</strong> para importar.</p>
          </div>
        </div>
      </div>

      {/* Input — só mostra se não tem dados carregados */}
      {!temDados && !verificando && (
        <>
          <div className="flex gap-2 border-b border-gray-200">
            {(["upload", "colar"] as const).map((a) => (
              <button key={a} onClick={() => setAba(a)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${aba === a ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                {a === "upload" ? "Upload de arquivo" : "Colar CSV"}
              </button>
            ))}
          </div>

          {aba === "upload" ? (
            <label
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 cursor-pointer transition-colors ${arrastando ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-primary-400"}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload size={32} className={`mb-2 ${arrastando ? "text-primary-500" : "text-gray-400"}`} />
              <p className="text-sm font-medium text-gray-600">
                {arrastando ? "Solte o arquivo aqui" : "Clique ou arraste o arquivo"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Aceita <strong>.xlsx</strong>, <strong>.xls</strong> e <strong>.csv</strong></p>
              <input type="file" accept=".csv,.xlsx,.xls,.txt" className="hidden" onChange={handleUpload} />
            </label>
          ) : (
            <div className="space-y-2">
              <textarea
                className="input-field font-mono text-xs h-40 resize-none"
                placeholder="Cole aqui o conteúdo CSV..."
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
              />
              <button onClick={handleColar} disabled={!texto.trim()} className="btn-primary flex items-center gap-2">
                <CheckCircle size={15} /> Verificar duplicatas
              </button>
            </div>
          )}
        </>
      )}

      {/* Verificando... */}
      {verificando && (
        <div className="card flex items-center gap-3 text-gray-600">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 flex-shrink-0" />
          Comparando com os inscritos já cadastrados...
        </div>
      )}

      {/* Resultado da verificação */}
      {temDados && !verificando && resultados.length === 0 && (
        <div className="space-y-4">
          {/* Resumo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card border-l-4 border-l-green-500">
              <div className="flex items-center gap-2 mb-1">
                <Users size={16} className="text-green-600" />
                <span className="font-semibold text-green-700">Novos — prontos para importar</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{novas.length}</p>
              <p className="text-xs text-gray-500 mt-1">Não encontrados no sistema</p>
            </div>
            <div className={`card border-l-4 transition-colors ${incluirExistentes ? "border-l-amber-400 bg-amber-50" : "border-l-gray-300"}`}>
              <div className="flex items-center gap-2 mb-1">
                <UserCheck size={16} className={incluirExistentes ? "text-amber-600" : "text-gray-500"} />
                <span className={`font-semibold ${incluirExistentes ? "text-amber-700" : "text-gray-500"}`}>
                  Já cadastrados — {incluirExistentes ? "serão reimportados" : "serão ignorados"}
                </span>
              </div>
              <p className={`text-3xl font-bold ${incluirExistentes ? "text-amber-700" : "text-gray-400"}`}>{existentes.length}</p>
              <p className="text-xs text-gray-400 mt-1">Mesmos Nome + Comprador + Data Nasc. + Quarto</p>
              {existentes.length > 0 && (
                <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={incluirExistentes}
                    onChange={(e) => setIncluirExistentes(e.target.checked)}
                    className="w-4 h-4 accent-amber-500"
                  />
                  <span className="text-xs font-medium text-gray-600">Importar mesmo assim</span>
                </label>
              )}
            </div>
          </div>

          {/* Tabela novos */}
          {novas.length > 0 && colunasMapeadas.length > 0 && (
            <div className="card overflow-x-auto">
              <h3 className="font-semibold text-gray-700 mb-3">
                {novas.length} registro(s) novos para importar
              </h3>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b">
                      {colunasMapeadas.map((k) => (
                        <th key={k} className="text-left pb-1.5 pr-3 font-medium text-gray-500 whitespace-nowrap">{LABELS[k]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {novas.map((row, i) => (
                      <tr key={i}>
                        {colunasMapeadas.map((k) => (
                          <td key={k} className="py-1.5 pr-3 text-gray-700 max-w-[160px] truncate">{row[k] || "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tabela existentes (colapsada) */}
          {existentes.length > 0 && (
            <details className="card">
              <summary className="cursor-pointer text-sm font-medium text-gray-500 select-none">
                Ver {existentes.length} já cadastrado(s) que serão ignorados
              </summary>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      {colunasMapeadas.map((k) => (
                        <th key={k} className="text-left pb-1.5 pr-3 font-medium text-gray-400 whitespace-nowrap">{LABELS[k]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 opacity-60">
                    {existentes.map((row, i) => (
                      <tr key={i}>
                        {colunasMapeadas.map((k) => (
                          <td key={k} className="py-1.5 pr-3 text-gray-500 max-w-[160px] truncate">{row[k] || "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}

          {/* Linhas descartadas como duplicata da própria planilha */}
          {descartadas.length > 0 && (
            <details className="card bg-orange-50 border-orange-200">
              <summary className="cursor-pointer text-sm font-medium text-orange-700 select-none flex items-center gap-2">
                <AlertCircle size={15} />
                {descartadas.length} linha(s) removida(s) como duplicata interna da planilha (clique para ver)
              </summary>
              <p className="text-xs text-orange-600 mt-2 mb-3">
                Essas linhas têm exatamente os mesmos Nome + Comprador + Data Nasc. + Quarto de outra linha da planilha e foram ignoradas.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b">
                    {["Nome", "Comprador", "Data Nasc.", "Quarto", "Motivo"].map(h => (
                      <th key={h} className="text-left pb-1.5 pr-3 font-medium text-orange-600">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {descartadas.map((r, i) => (
                      <tr key={i} className="border-b border-orange-100">
                        <td className="py-1.5 pr-3 font-medium">{r.nome || <span className="italic text-orange-400">sem nome</span>}</td>
                        <td className="py-1.5 pr-3">{r.nomeComprador || "—"}</td>
                        <td className="py-1.5 pr-3">{r.dataNascimento || "—"}</td>
                        <td className="py-1.5 pr-3">{r.tipoQuarto || "—"}</td>
                        <td className="py-1.5 pr-3 text-orange-600 italic">{(r as Record<string,string>)._motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}

          {/* Ações */}
          <div className="flex gap-3">
            {(novas.length > 0 || incluirExistentes) && (
              <button onClick={handleImportar} disabled={importando} className="btn-primary flex items-center gap-2">
                <Upload size={16} />
                {importando ? "Importando..." : `Importar ${novas.length + (incluirExistentes ? existentes.length : 0)} registro(s)`}
              </button>
            )}
            <button onClick={limpar} className="btn-secondary">
              Carregar outro arquivo
            </button>
          </div>
        </div>
      )}

      {/* Resultados da importação */}
      {resultados.length > 0 && (
        <div className="space-y-4">
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

          {/* Diagnóstico: mostra quando todos falharam */}
          {sucessos === 0 && headersBrutos.length > 0 && (
            <div className="card bg-yellow-50 border-yellow-200">
              <p className="text-sm font-semibold text-yellow-800 mb-2">
                Diagnóstico — colunas detectadas no arquivo ({headersBrutos.length}):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {headersBrutos.map((h, i) => (
                  <span key={i} className="text-xs bg-white border border-yellow-300 text-yellow-800 px-2 py-0.5 rounded-full font-mono">
                    {h || "(vazio)"}
                  </span>
                ))}
              </div>
              <p className="text-xs text-yellow-700 mt-2">
                Envie essa lista para verificar qual coluna contém o Nome e a Data de Nascimento.
              </p>
            </div>
          )}

          <button onClick={limpar} className="btn-secondary">Carregar outro arquivo</button>
        </div>
      )}
    </div>
  );
}
