"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { buscarAutorizacao, assinarAutorizacao, Autorizacao } from "@/lib/autorizacoes";
import { CheckCircle, PenLine } from "lucide-react";
import Image from "next/image";

export default function AssinarAutorizacaoPage() {
  const params = useParams();
  const id = params.id as string;

  const [autorizacao, setAutorizacao] = useState<Autorizacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [assinado, setAssinado] = useState(false);

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [assinatura, setAssinatura] = useState("");

  function maskCPF(v: string) {
    return v.replace(/\D/g, "").slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  function maskPhone(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 10) return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
    return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
  }

  // Canvas para assinatura desenhada
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [desenhando, setDesenhando] = useState(false);
  const [tipoAssinatura, setTipoAssinatura] = useState<"digitar" | "desenhar">("digitar");
  const [temDesenho, setTemDesenho] = useState(false);

  useEffect(() => {
    buscarAutorizacao(id).then((data) => {
      setAutorizacao(data);
      if (data?.status === "assinado") setAssinado(true);
      setLoading(false);
    });
  }, [id]);

  // Canvas drawing
  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setDesenhando(true);
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!desenhando) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
    setTemDesenho(true);
  }

  function stopDraw() { setDesenhando(false); }

  function limparCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setTemDesenho(false);
  }

  async function handleAssinar() {
    if (!nome.trim()) return alert("Preencha seu nome completo.");
    if (!cpf.trim()) return alert("Preencha seu CPF.");
    if (!telefone.trim()) return alert("Preencha seu telefone.");

    let assinaturaFinal = "";
    if (tipoAssinatura === "digitar") {
      if (!assinatura.trim()) return alert("Digite sua assinatura.");
      assinaturaFinal = assinatura;
    } else {
      if (!temDesenho) return alert("Desenhe sua assinatura.");
      assinaturaFinal = canvasRef.current?.toDataURL() || "";
    }

    setSalvando(true);
    try {
      await assinarAutorizacao(id, {
        nomeResponsavel: nome,
        cpfResponsavel: cpf,
        telefoneResponsavel: telefone,
        assinatura: assinaturaFinal,
      });
      setAssinado(true);
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!autorizacao) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold">Link inválido ou expirado.</p>
        </div>
      </div>
    );
  }

  if (assinado) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-green-50">
        <div className="text-center max-w-sm">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Autorização Assinada!</h2>
          <p className="text-gray-600">
            A autorização de <strong>{autorizacao.nomesMenores}</strong> foi registrada com sucesso.
            A Igreja Hermom já recebeu sua confirmação.
          </p>
          <p className="text-sm text-gray-400 mt-4">Você pode fechar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 relative mx-auto mb-3">
            <Image src="/hermom.png" alt="Hermom" fill className="rounded-xl object-cover" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Autorização de Participação</h1>
          <p className="text-sm text-gray-500">Acampamento Hermom 2026 · 19 a 22 de novembro</p>
        </div>

        {/* Documento */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm text-gray-700 space-y-3">
          <p className="text-center font-semibold text-base border-b pb-3">AUTORIZAÇÃO DE PARTICIPAÇÃO PARA MENOR</p>
          <p>
            Eu, abaixo identificado(a), na qualidade de pai/mãe ou responsável legal, autorizo o(a)(s) menor(es):
          </p>
          <div className="bg-primary-50 rounded-lg p-3 font-semibold text-primary-800">
            {autorizacao.nomesMenores}
          </div>
          <p>
            a participar do <strong>Acampamento Hermom 2026</strong>, realizado de 19 a 22 de novembro de 2026
            no Acampamento Monte Horebe, Cesário Lange/SP.
          </p>
          <p>Declaro estar ciente de todas as regras do evento.</p>
        </div>

        {/* Dados do responsável */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-700">Seus dados</h3>
          <div>
            <label className="label-field">Nome completo *</label>
            <input className="input-field" placeholder="Seu nome completo" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">CPF *</label>
              <input className="input-field" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(maskCPF(e.target.value))} />
            </div>
            <div>
              <label className="label-field">Telefone *</label>
              <input className="input-field" placeholder="(11) 99999-9999" value={telefone} onChange={(e) => setTelefone(maskPhone(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Assinatura */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <PenLine size={16} /> Assinatura
            </h3>
            <div className="flex gap-1 text-xs">
              <button
                onClick={() => setTipoAssinatura("digitar")}
                className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${tipoAssinatura === "digitar" ? "bg-primary-600 text-white border-primary-600" : "border-gray-300 text-gray-600"}`}
              >
                Digitar
              </button>
              <button
                onClick={() => setTipoAssinatura("desenhar")}
                className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${tipoAssinatura === "desenhar" ? "bg-primary-600 text-white border-primary-600" : "border-gray-300 text-gray-600"}`}
              >
                Desenhar
              </button>
            </div>
          </div>

          {tipoAssinatura === "digitar" ? (
            <input
              className="input-field font-serif text-lg italic"
              placeholder="Digite seu nome como assinatura"
              value={assinatura}
              onChange={(e) => setAssinatura(e.target.value)}
            />
          ) : (
            <div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={520}
                  height={120}
                  className="w-full touch-none cursor-crosshair"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />
              </div>
              <button onClick={limparCanvas} className="text-xs text-gray-400 hover:text-gray-600 mt-1">
                Limpar assinatura
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleAssinar}
          disabled={salvando}
          className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
        >
          <CheckCircle size={18} />
          {salvando ? "Registrando assinatura..." : "Confirmar e Assinar"}
        </button>

        <p className="text-xs text-center text-gray-400">
          Ao clicar em "Confirmar e Assinar", sua autorização é registrada digitalmente e enviada à Igreja Hermom.
        </p>
      </div>
    </div>
  );
}
