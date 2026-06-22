"use client";

import CategoriaTab from "@/components/CategoriaTab";

export default function CriancasPage() {
  return (
    <CategoriaTab
      titulo="Crianças até 05 anos"
      descricao="Crianças com até 5 anos na data do evento — Isentas de pagamento"
      grupos={[
        {
          label: "Meninos",
          filtro: (i) => i.categoria === "criancas_ate_05" && i.genero === "masculino",
        },
        {
          label: "Meninas",
          filtro: (i) => i.categoria === "criancas_ate_05" && i.genero === "feminino",
        },
      ]}
    />
  );
}
