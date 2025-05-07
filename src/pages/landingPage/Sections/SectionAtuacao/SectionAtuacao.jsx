import "./SectionAtuacao.css";
import image1 from "../../../../assets/image1.png";

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
            <i className="fa-regular fa-calendar"></i>16 e 17 de Outubro de 2025
          </h3>
          <h3>
            <i className="fa-solid fa-location-dot"></i>Salvador/BA
          </h3>
        </div>
      </div>
      <div className="right">
        <img src={image1} alt="banner evento gtap" />
      </div>
      <div className="bottom">
        <div className="container-box">
          <h3>Confira as áreas de atuação do público-alvo</h3>
          <h4>
            Quem lida com os desafios tributários da administração pública marca
            presença no IX GTAP.
          </h4>
          <div className="container-tags">
            <span>Recursos Humanos</span>
            <span>Gestão Orçamentária</span>
            <span>Licitações e Contratos</span>
            <span>Gestão Contábil</span>
            <span>Controle Interno</span>
            <span>Financeiro</span>
            <span>Jurídica</span>
            <span>Fiscal</span>
          </div>
        </div>
      </div>
    </section>
  );
};
