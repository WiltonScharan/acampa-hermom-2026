import { Timestamp } from "firebase/firestore";

export type Genero = "masculino" | "feminino";
export type TipoQuarto = "coletivo" | "village";
export type FormaPagamento =
  | "pix"
  | "dinheiro"
  | "cartao_credito"
  | "cartao_debito"
  | "outro";
export type StatusInscricao = "confirmado" | "pendente" | "cancelado";

export type CategoriaIdade =
  | "criancas_ate_05"
  | "adolescentes_06_10"
  | "adolescentes_11_14"
  | "jovens_15_29"
  | "adultos_30_59"
  | "melhor_idade_60";

export interface Inscricao {
  id: string;
  // Dados pessoais
  nome: string;
  dataNascimento: string; // "YYYY-MM-DD"
  genero: Genero;
  telefone: string;
  cpf: string;
  email: string;
  // Família
  nomeComprador: string;
  ehComprador: boolean;
  // Acomodação
  tipoQuarto: TipoQuarto;
  onibus: boolean;
  // Financeiro
  valorTotal: number;
  valorPago: number;
  formaPagamento: FormaPagamento | "";
  comprovantes: string[]; // Firebase Storage URLs
  // Controle
  status: StatusInscricao;
  observacoes: string;
  origemImportacao?: boolean;
  criadoEm: Timestamp | null;
  atualizadoEm: Timestamp | null;
}

export type InscricaoForm = Omit<Inscricao, "id" | "criadoEm" | "atualizadoEm" | "comprovantes">;

export interface InscricaoComCalculo extends Inscricao {
  idadeNaData: number;
  categoria: CategoriaIdade;
  valorAPagar: number;
  labelCategoria: string;
}
