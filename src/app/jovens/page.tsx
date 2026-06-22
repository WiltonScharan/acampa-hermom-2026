"use client";

import CategoriaTab from "@/components/CategoriaTab";

export default function JovensPage() {
  return (
    <CategoriaTab
      titulo="Jovens 15-29 anos"
      descricao="Jovens de 15 a 29 anos na data do evento"
      grupos={[
        {
          label: "Homens",
          filtro: (i) => i.categoria === "jovens_15_29" && i.genero === "masculino",
        },
        {
          label: "Mulheres",
          filtro: (i) => i.categoria === "jovens_15_29" && i.genero === "feminino",
        },
      ]}
    />
  );
}
