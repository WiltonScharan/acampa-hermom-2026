import CategoriaTab from "@/components/CategoriaTab";

export default function HomensPage() {
  return (
    <CategoriaTab
      titulo="Homens 30-59 anos"
      descricao="Homens de 30 a 59 anos na data do evento"
      grupos={[
        {
          label: "Homens (30-59 anos)",
          filtro: (i) => i.categoria === "adultos_30_59" && i.genero === "masculino",
        },
      ]}
    />
  );
}
