import "./SectionAtuacao.css";
import image1 from "../../../../assets/image1.jpg";

export const SectionAtuacao = () => {
  return (
    <section className="section-atuacao">
      <div className="left">
        <h2 className="text-title">
          O único congresso do país sobre <b>Gestão Tributária</b> voltado
          exclusivamente para a <b>Administração Pública</b> e <b>Sistema S</b>.
        </h2>
        <div>
          <hr />
        </div>
        <div className="data-section">
          <h3>
            <i class="fa-regular fa-calendar"></i>16 e 17 de Outubro de 2025
          </h3>
          <h3>
            <i class="fa-solid fa-location-dot"></i>Salvador/BA
          </h3>
        </div>
      </div>
      <div className="right">
        <img src={image1} alt="banner evento gtap" />
      </div>
    </section>
  );
};
