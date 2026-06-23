"use client";

import { useState } from "react";
import { FileText, Printer, ExternalLink, Info } from "lucide-react";

export default function AutorizacaoPage() {
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [nomesMenores, setNomesMenores] = useState("");
  const [cpfResponsavel, setCpfResponsavel] = useState("");
  const [telefoneResponsavel, setTelefoneResponsavel] = useState("");

  function handlePrint() {
    window.print();
  }

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Autorização para Menores</h1>
        <p className="text-sm text-gray-500 mt-1">
          Obrigatório para menores de 14 anos. De 15 a 18 anos com autorização assinada entregue antes do evento.
        </p>
      </div>

      {/* Aviso */}
      <div className="card bg-amber-50 border-amber-200 flex gap-3">
        <Info size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-1">Como usar este documento</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Preencha os campos abaixo com os dados do responsável e do(s) menor(es)</li>
            <li>Clique em <strong>"Imprimir / Salvar PDF"</strong> para gerar o documento</li>
            <li>O responsável assina e entrega ao Wilton antes do evento</li>
          </ol>
          <p className="mt-2">
            Para assinatura 100% digital (sem imprimir), use o{" "}
            <a
              href="https://docs.google.com/forms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold"
            >
              Google Forms
            </a>{" "}
            ou o{" "}
            <a
              href="https://www.docusign.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold"
            >
              DocuSign
            </a>.
          </p>
        </div>
      </div>

      {/* Formulário de preenchimento */}
      <div className="card print:hidden">
        <h3 className="font-semibold text-gray-700 mb-4">Preencha para gerar o documento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label-field">Nome completo do responsável</label>
            <input
              className="input-field"
              placeholder="Ex: João da Silva"
              value={nomeResponsavel}
              onChange={(e) => setNomeResponsavel(e.target.value)}
            />
          </div>
          <div>
            <label className="label-field">CPF do responsável</label>
            <input
              className="input-field"
              placeholder="000.000.000-00"
              value={cpfResponsavel}
              onChange={(e) => setCpfResponsavel(e.target.value)}
            />
          </div>
          <div>
            <label className="label-field">Telefone do responsável</label>
            <input
              className="input-field"
              placeholder="(11) 99999-9999"
              value={telefoneResponsavel}
              onChange={(e) => setTelefoneResponsavel(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label-field">Nome(s) do(s) menor(es) autorizado(s)</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Ex: Maria da Silva, Pedro da Silva"
              value={nomesMenores}
              onChange={(e) => setNomesMenores(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
            <Printer size={16} />
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      {/* Documento imprimível */}
      <div className="card border-2 border-gray-300 print:border-0 print:shadow-none" id="documento-autorizacao">
        {/* Cabeçalho do documento */}
        <div className="text-center border-b border-gray-300 pb-4 mb-6">
          <p className="text-lg font-bold uppercase tracking-wide">Igreja Hermom</p>
          <p className="text-base font-semibold mt-1">AUTORIZAÇÃO DE PARTICIPAÇÃO PARA MENOR</p>
          <p className="text-sm text-gray-600 mt-1">Acampamento Hermom 2026 — 19 a 22 de novembro de 2026</p>
          <p className="text-xs text-gray-500">Acampamento Monte Horebe · Cesário Lange/SP</p>
        </div>

        <div className="text-sm text-gray-800 space-y-4 leading-relaxed">
          <p>
            Eu, <strong>{nomeResponsavel || "_________________________________"}</strong>,
            portador(a) do CPF <strong>{cpfResponsavel || "___________________"}</strong>,
            telefone <strong>{telefoneResponsavel || "___________________"}</strong>,
            na qualidade de pai/mãe ou responsável legal, autorizo o(a)(s) menor(es):
          </p>

          <div className="border border-gray-300 rounded-lg p-3 min-h-[60px] bg-gray-50">
            <p className="font-medium">
              {nomesMenores || "________________________________________________________________________"}
            </p>
          </div>

          <p>
            a participar do <strong>Acampamento Hermom 2026</strong>, evento realizado pela Igreja Hermom
            no período de <strong>19 a 22 de novembro de 2026</strong>, no Acampamento Monte Horebe,
            localizado em Cesário Lange/SP.
          </p>

          <p>
            Estou ciente de todas as regras do evento, incluindo:
          </p>

          <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
            <li>Check-in: 19/11 das 20h às 23h. Check-out: 22/11 até 18h.</li>
            <li>Menores de 14 anos somente acompanhados dos pais ou responsáveis.</li>
            <li>De 15 a 18 anos, esta autorização deve ser entregue em mãos antes do evento.</li>
            <li>A Igreja Hermom não se responsabiliza por objetos esquecidos, perdidos ou danificados.</li>
            <li>Objetos quebrados ou danificados serão cobrados do responsável.</li>
          </ul>

          <p>
            Declaro que as informações acima são verdadeiras e assumo total responsabilidade pela
            participação do(a)(s) menor(es) no referido evento.
          </p>

          <div className="mt-8 pt-6 border-t border-gray-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-b border-gray-400 mb-2 pb-8"></div>
              <p>Assinatura do Responsável</p>
              <p className="mt-1 text-gray-500">{nomeResponsavel || "Nome do Responsável"}</p>
            </div>
            <div>
              <div className="border-b border-gray-400 mb-2 pb-8"></div>
              <p>Data e Local</p>
              <p className="mt-1 text-gray-500">_________ / _________ / 2026</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body > * { visibility: hidden; }
          #documento-autorizacao, #documento-autorizacao * { visibility: visible; }
          #documento-autorizacao { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
