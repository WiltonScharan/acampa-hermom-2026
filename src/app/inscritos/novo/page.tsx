"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import InscricaoForm from "@/components/InscricaoForm";
import { criarInscricao } from "@/lib/firestore";
import { InscricaoForm as IForm } from "@/types";

export default function NovaInscricaoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(data: IForm) {
    setLoading(true);
    try {
      await criarInscricao(data);
      router.push("/inscritos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <InscricaoForm onSubmit={handleSubmit} loading={loading} titulo="Nova Inscrição" />
    </div>
  );
}
