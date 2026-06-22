import CategoriaTab from "@/components/CategoriaTab";

export default function MulheresPage() {
  return (
    <CategoriaTab
      titulo="Mulheres 30-59 anos"
      descricao="Mulheres de 30 a 59 anos na data do evento"
      grupos={[
        {
          label: "Mulheres (30-59 anos)",
          filtro: (i) => i.categoria === "adultos_30_59" && i.genero === "feminino",
        },
      ]}
    />
  );
}
