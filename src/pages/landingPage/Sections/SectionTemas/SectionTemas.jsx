import "./SectionTemas.css";
// import image1 from "../../../../assets/image1.png";

const temas = [
  {
    id: 0,
    number: 1,
    description: "Retenção de IBS/CBS nas compras pela administração pública;",
  },
  {
    id: 1,
    number: 2,
    description:
      "O mecanismo do split payment e suas implicações para adquirentes e fornecedores;",
  },
  {
    id: 2,
    number: 3,
    description:
      "Local de incidência do ISS e do IBS: o princípio do destino e seus desdobramentos práticos;",
  },
  {
    id: 3,
    number: 4,
    description:
      "O uso da tecnologia como pilar fundamental do novo sistema de tributação;",
  },
  {
    id: 4,
    number: 5,
    description:
      "Impactos da reforma tributária nas obrigações acessórias e documentos fiscais;",
  },
  {
    id: 5,
    number: 6,
    description:
      "Da lista de serviços da Lei Complementar 116 para a NBS: desafios da transição;",
  },
  {
    id: 6,
    number: 7,
    description:
      "Impactos da reforma tributária na planilha de formação de preços dos contratos públicos.",
  },
];

export const SectionTemas = () => {
  return (
    <section className="section-temas">
      <div className="section-temas-left">
        <h3>Temas confirmados</h3>
        <h5>
          Prepare-se para entender os impactos da Reforma Tributária sobre a
          Administração Pública (enquanto sujeito ativo e passivo de obrigações)
        </h5>
        {temas.map((tema) => (
          <div className="card-tema" key={tema.id}>
            <span>{tema.number}</span>
            <p>{tema.description}</p>
          </div>
        ))}
      </div>
      <div className="section-temas-right">
        <p>teste</p>
      </div>
    </section>
  );
};
