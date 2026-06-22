import CategoriaTab from "@/components/CategoriaTab";

export default function Adolescentes0610Page() {
  return (
    <CategoriaTab
      titulo="Adolescentes 06-10 anos"
      descricao="Adolescentes de 6 a 10 anos na data do evento — Meia entrada (R$ 410,00)"
      grupos={[
        {
          label: "Meninos",
          filtro: (i) => i.categoria === "adolescentes_06_10" && i.genero === "masculino",
        },
        {
          label: "Meninas",
          filtro: (i) => i.categoria === "adolescentes_06_10" && i.genero === "feminino",
        },
      ]}
    />
  );
}
