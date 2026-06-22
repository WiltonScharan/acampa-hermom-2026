"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { InscricaoForm as IForm, TipoQuarto } from "@/types";
import { calcularValorTotal, formatarMoeda, DATA_EVENTO } from "@/lib/utils";
import { calcularIdadeNaData, determinarCategoria, LABELS_CATEGORIA } from "@/lib/utils";
import { Info } from "lucide-react";

interface Props {
  defaultValues?: Partial<IForm>;
  onSubmit: (data: IForm) => Promise<void>;
  loading?: boolean;
  titulo?: string;
}

const CAMPOS_OBRIGATORIOS = "Campo obrigatório";

export default function InscricaoForm({ defaultValues, onSubmit, loading, titulo = "Nova Inscrição" }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IForm>({
    defaultValues: {
      nome: "",
      dataNascimento: "",
      genero: "masculino",
      telefone: "",
      cpf: "",
      email: "",
      nomeComprador: "",
      ehComprador: true,
      tipoQuarto: "coletivo",
      onibus: false,
      valorTotal: 0,
      valorPago: 0,
      formaPagamento: "",
      status: "pendente",
      observacoes: "",
      ...defaultValues,
    },
  });

  const [previewValor, setPreviewValor] = useState<number | null>(null);
  const [previewCategoria, setPreviewCategoria] = useState<string>("");

  const dataNascimento = watch("dataNascimento");
  const tipoQuarto = watch("tipoQuarto") as TipoQuarto;
  const onibus = watch("onibus");
  const valorTotalManual = watch("valorTotal");

  useEffect(() => {
    if (dataNascimento) {
      const idade = calcularIdadeNaData(dataNascimento);
      const cat = determinarCategoria(idade);
      setPreviewCategoria(`${idade} anos na data do evento — ${LABELS_CATEGORIA[cat]}`);

      if (!defaultValues?.valorTotal) {
        const calculado = calcularValorTotal(dataNascimento, tipoQuarto, onibus);
        setPreviewValor(calculado);
        setValue("valorTotal", calculado);
      }
    }
  }, [dataNascimento, tipoQuarto, onibus, defaultValues?.valorTotal, setValue]);

  function aplicarMascaraCPF(value: string) {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);
  }

  function aplicarMascaraTelefone(value: string) {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{4})$/, "$1-$2")
      .slice(0, 15);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">{titulo}</h2>

      {/* Dados pessoais */}
      <div className="card">
        <h3 className="text-base font-semibold text-gray-700 mb-4 pb-2 border-b">Dados Pessoais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label-field">Nome completo *</label>
            <input
              className="input-field"
              {...register("nome", { required: CAMPOS_OBRIGATORIOS })}
              placeholder="Nome completo"
            />
            {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
          </div>

          <div>
            <label className="label-field">Data de nascimento *</label>
            <input
              type="date"
              className="input-field"
              {...register("dataNascimento", { required: CAMPOS_OBRIGATORIOS })}
            />
            {dataNascimento && (
              <p className="text-xs text-primary-600 mt-1 flex items-center gap-1">
                <Info size={12} /> {previewCategoria}
              </p>
            )}
            {errors.dataNascimento && (
              <p className="text-red-500 text-xs mt-1">{errors.dataNascimento.message}</p>
            )}
          </div>

          <div>
            <label className="label-field">Gênero *</label>
            <select className="input-field" {...register("genero", { required: CAMPOS_OBRIGATORIOS })}>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
            </select>
          </div>

          <div>
            <label className="label-field">CPF</label>
            <input
              className="input-field"
              placeholder="000.000.000-00"
              {...register("cpf")}
              onChange={(e) => setValue("cpf", aplicarMascaraCPF(e.target.value))}
            />
          </div>

          <div>
            <label className="label-field">Telefone / WhatsApp</label>
            <input
              className="input-field"
              placeholder="(11) 99999-9999"
              {...register("telefone")}
              onChange={(e) => setValue("telefone", aplicarMascaraTelefone(e.target.value))}
            />
          </div>

          <div className="md:col-span-2">
            <label className="label-field">E-mail</label>
            <input
              type="email"
              className="input-field"
              placeholder="email@exemplo.com"
              {...register("email")}
            />
          </div>
        </div>
      </div>

      {/* Família / Comprador */}
      <div className="card">
        <h3 className="text-base font-semibold text-gray-700 mb-4 pb-2 border-b">Responsável pela Inscrição</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label-field">Nome do comprador *</label>
            <input
              className="input-field"
              placeholder="Nome de quem realizou a inscrição"
              {...register("nomeComprador", { required: CAMPOS_OBRIGATORIOS })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Todos inscritos pela mesma pessoa compartilham esse campo (facilita busca por família)
            </p>
            {errors.nomeComprador && (
              <p className="text-red-500 text-xs mt-1">{errors.nomeComprador.message}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="ehComprador"
              className="w-4 h-4 accent-primary-600"
              {...register("ehComprador")}
            />
            <label htmlFor="ehComprador" className="text-sm text-gray-700">
              Esta pessoa é o próprio comprador
            </label>
          </div>
        </div>
      </div>

      {/* Acomodação */}
      <div className="card">
        <h3 className="text-base font-semibold text-gray-700 mb-4 pb-2 border-b">Acomodação e Transporte</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-field">Tipo de quarto *</label>
            <select className="input-field" {...register("tipoQuarto", { required: CAMPOS_OBRIGATORIOS })}>
              <option value="coletivo">Quarto Coletivo — R$ 820,00</option>
              <option value="village">Village (Casal) — R$ 1.050,00</option>
            </select>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <input
              type="checkbox"
              id="onibus"
              className="w-4 h-4 accent-primary-600"
              {...register("onibus")}
            />
            <label htmlFor="onibus" className="text-sm text-gray-700">
              Vai de ônibus (+R$ 150,00)
            </label>
          </div>
        </div>
      </div>

      {/* Financeiro */}
      <div className="card">
        <h3 className="text-base font-semibold text-gray-700 mb-4 pb-2 border-b">Financeiro</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label-field">Valor total (R$)</label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              {...register("valorTotal", { valueAsNumber: true })}
            />
            {previewValor !== null && (
              <p className="text-xs text-primary-600 mt-1">
                Calculado automaticamente: {formatarMoeda(previewValor)}
              </p>
            )}
          </div>

          <div>
            <label className="label-field">Valor pago (R$)</label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              {...register("valorPago", { valueAsNumber: true })}
            />
          </div>

          <div>
            <label className="label-field">Valor a pagar (R$)</label>
            <input
              type="text"
              readOnly
              className="input-field bg-gray-50 text-gray-500"
              value={formatarMoeda(Math.max(0, (valorTotalManual || 0) - (watch("valorPago") || 0)))}
            />
          </div>

          <div>
            <label className="label-field">Forma de pagamento</label>
            <select className="input-field" {...register("formaPagamento")}>
              <option value="">Selecione...</option>
              <option value="pix">PIX</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="cartao_debito">Cartão de Débito</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div>
            <label className="label-field">Status</label>
            <select className="input-field" {...register("status")}>
              <option value="pendente">Pendente</option>
              <option value="confirmado">Confirmado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="card">
        <label className="label-field">Observações</label>
        <textarea
          className="input-field resize-none"
          rows={3}
          placeholder="Anotações sobre este inscrito..."
          {...register("observacoes")}
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button type="button" className="btn-secondary" onClick={() => window.history.back()}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Inscrição"}
        </button>
      </div>
    </form>
  );
}
