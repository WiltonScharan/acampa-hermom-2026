import CategoriaTab from "@/components/CategoriaTab";

export default function OnibusPage() {
  return (
    <CategoriaTab
      titulo="Ônibus"
      descricao="Inscritos que optaram pelo transporte coletivo (+R$ 150,00/pessoa)"
      grupos={[
        {
          label: "Homens",
          filtro: (i) => i.onibus && i.genero === "masculino",
        },
        {
          label: "Mulheres",
          filtro: (i) => i.onibus && i.genero === "feminino",
        },
      ]}
    />
  );
}
