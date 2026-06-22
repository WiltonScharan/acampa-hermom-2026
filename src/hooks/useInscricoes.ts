"use client";

import { useEffect, useState } from "react";
import { ouvirInscricoes } from "@/lib/firestore";
import { enriquecerInscricao } from "@/lib/utils";
import { InscricaoComCalculo } from "@/types";

export function useInscricoes() {
  const [inscricoes, setInscricoes] = useState<InscricaoComCalculo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = ouvirInscricoes((dados) => {
      setInscricoes(dados.map(enriquecerInscricao));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { inscricoes, loading };
}
