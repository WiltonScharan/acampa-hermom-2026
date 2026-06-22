"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import InscricaoForm from "@/components/InscricaoForm";
import UploadComprovantes from "@/components/UploadComprovantes";
import { buscarInscricao, atualizarInscricao } from "@/lib/firestore";
import { Inscricao, InscricaoForm as IForm } from "@/types";

export default function EditarInscricaoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [inscricao, setInscricao] = useState<Inscricao | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);

  useEffect(() => {
    buscarInscricao(id).then((data) => {
      setInscricao(data);
      setLoadingDados(false);
    });
  }, [id]);

  async function handleSubmit(data: IForm) {
    setLoading(true);
    try {
      await atualizarInscricao(id, data);
      router.push("/inscritos");
    } finally {
      setLoading(false);
    }
  }

  if (loadingDados) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!inscricao) {
    return <div className="p-6 text-gray-500">Inscrição não encontrada.</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <InscricaoForm
        defaultValues={inscricao}
        onSubmit={handleSubmit}
        loading={loading}
        titulo={`Editar: ${inscricao.nome}`}
      />

      {/* Comprovantes */}
      <div className="card">
        <h3 className="text-base font-semibold text-gray-700 mb-4 pb-2 border-b">
          Comprovantes de Pagamento
        </h3>
        <UploadComprovantes
          inscricaoId={id}
          comprovantes={inscricao.comprovantes || []}
          onUpdate={(urls) => setInscricao((prev) => prev ? { ...prev, comprovantes: urls } : prev)}
        />
      </div>
    </div>
  );
}
