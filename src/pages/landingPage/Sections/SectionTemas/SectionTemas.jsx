import "./SectionTemas.css";
import bgTemas from "../../../../assets/bgtemas.svg";
import bgTemas2 from "../../../../assets/bgtemas2.svg";
export const SectionTemas = ({ data }) => {
  const temas = data.filter((tema) => tema.type === 1);

  return (
    <section className="section-temas" id="temas">
      <div className="section-temas-content">
        <h3>Temas confirmados</h3>
        <h5>
          Prepare-se para entender os impactos da Reforma Tributária sobre a
          Administração Pública
          <br />
          (enquanto sujeito ativo e passivo de obrigações)
        </h5>

        <div className="container-cards-tema">
          {temas.map((tema, index) => {
            const isInvert = index % 2 === 0; // inverte Bg (cards 5, 6 e 7)
            return (
              <div
                key={tema.id}
                className={`card-tema ${isInvert ? "bgTemas" : "bgTemas2"}`}
              >
                <div className="circle-number">
                  <span>{Number(tema?.title)}</span>
                </div>
                <p>{tema.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
