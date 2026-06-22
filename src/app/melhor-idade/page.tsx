"use client";

import CategoriaTab from "@/components/CategoriaTab";

export default function MelhorIdadePage() {
  return (
    <CategoriaTab
      titulo="Melhor Idade 60+"
      descricao="Inscritos com 60 anos ou mais na data do evento (19/11/2026)"
      grupos={[
        {
          label: "Homens",
          filtro: (i) => i.categoria === "melhor_idade_60" && i.genero === "masculino",
        },
        {
          label: "Mulheres",
          filtro: (i) => i.categoria === "melhor_idade_60" && i.genero === "feminino",
        },
      ]}
    />
  );
}
