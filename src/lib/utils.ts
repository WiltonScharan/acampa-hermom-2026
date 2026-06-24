import { differenceInYears, parseISO } from "date-fns";
import { CategoriaIdade, InscricaoComCalculo, Inscricao, TipoQuarto } from "@/types";

// Data do evento para cálculo de idade
export const DATA_EVENTO = new Date(2026, 10, 19); // 19 de novembro de 2026

// Preços base
export const PRECO_COLETIVO = 820;
export const PRECO_VILLAGE = 1050;
export const PRECO_ONIBUS = 150;

export function calcularIdadeNaData(dataNascimento: string, dataReferencia: Date = DATA_EVENTO): number {
  try {
    return differenceInYears(dataReferencia, parseISO(dataNascimento));
  } catch {
    return 0;
  }
}

export function determinarCategoria(idade: number): CategoriaIdade {
  if (idade <= 5) return "criancas_ate_05";
  if (idade <= 10) return "adolescentes_06_10";
  if (idade <= 14) return "adolescentes_11_14";
  if (idade <= 29) return "jovens_15_29";
  if (idade <= 59) return "adultos_30_59";
  return "melhor_idade_60";
}

export const LABELS_CATEGORIA: Record<CategoriaIdade, string> = {
  criancas_ate_05: "Crianças até 05 anos",
  adolescentes_06_10: "Adolescentes 06-10 anos",
  adolescentes_11_14: "Adolescentes 11-14 anos",
  jovens_15_29: "Jovens 15-29 anos",
  adultos_30_59: "Adultos 30-59 anos",
  melhor_idade_60: "Melhor Idade 60+ anos",
};

export function calcularValorBase(idade: number, tipoQuarto: TipoQuarto): number {
  if (idade <= 5) return 0;
  if (idade <= 10) {
    // Meia entrada - base no quarto coletivo
    return PRECO_COLETIVO / 2;
  }
  return tipoQuarto === "village" ? PRECO_VILLAGE : PRECO_COLETIVO;
}

export function calcularValorTotal(
  dataNascimento: string,
  tipoQuarto: TipoQuarto,
  onibus: boolean
): number {
  const idade = calcularIdadeNaData(dataNascimento);
  const base = calcularValorBase(idade, tipoQuarto);
  const transporte = onibus ? PRECO_ONIBUS : 0;
  return base + transporte;
}

export function enriquecerInscricao(inscricao: Inscricao): InscricaoComCalculo {
  const idadeNaData = calcularIdadeNaData(inscricao.dataNascimento);
  const categoria = determinarCategoria(idadeNaData);
  return {
    ...inscricao,
    idadeNaData,
    categoria,
    valorAPagar: Math.max(0, inscricao.valorTotal - inscricao.valorPago),
    labelCategoria: LABELS_CATEGORIA[categoria],
  };
}

export function formatarCPF(cpf: string): string {
  const nums = cpf.replace(/\D/g, "");
  return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatarTelefone(tel: string): string {
  const nums = tel.replace(/\D/g, "");
  // Strip leading country code 55 if present
  const local = nums.startsWith("55") && nums.length > 11 ? nums.slice(2) : nums;
  if (local.length === 11) return `+55 (${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  if (local.length === 10) return `+55 (${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  return tel;
}

export function whatsAppLink(tel: string): string {
  const nums = tel.replace(/\D/g, "");
  const comDDI = nums.startsWith("55") ? nums : `55${nums}`;
  return `https://wa.me/${comDDI}`;
}

export function inferirGenero(nome: string): "masculino" | "feminino" {
  const primeiro = nome.trim().split(" ")[0].toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (primeiro.endsWith("a")) return "feminino";
  if (primeiro.endsWith("ane") || primeiro.endsWith("iane")) return "feminino";
  if (primeiro.endsWith("elle") || primeiro.endsWith("ice")) return "feminino";
  return "masculino";
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function formatarData(data: string): string {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export const LABEL_FORMA_PAGAMENTO: Record<string, string> = {
  pix: "PIX",
  dinheiro: "Dinheiro",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
  outro: "Outro",
  "": "—",
};

export const LABEL_STATUS: Record<string, string> = {
  confirmado: "Confirmado",
  pendente: "Pendente",
  cancelado: "Cancelado",
};

export const LABEL_TIPO_QUARTO: Record<string, string> = {
  coletivo: "Quarto Coletivo",
  village: "Village (Casal)",
};
