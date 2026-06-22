import CategoriaTab from "@/components/CategoriaTab";

export default function Adolescentes1114Page() {
  return (
    <CategoriaTab
      titulo="Adolescentes 11-14 anos"
      descricao="Adolescentes de 11 a 14 anos na data do evento — Valor integral"
      grupos={[
        {
          label: "Meninos",
          filtro: (i) => i.categoria === "adolescentes_11_14" && i.genero === "masculino",
        },
        {
          label: "Meninas",
          filtro: (i) => i.categoria === "adolescentes_11_14" && i.genero === "feminino",
        },
      ]}
    />
  );
}
