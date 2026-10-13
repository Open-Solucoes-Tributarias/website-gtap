import ResponsiveImage from "../../../../components/ResponsiveImage/ResponsiveImage";
import { Icon } from "../../../../components/Icon/Icon";
import "./SectionAtuacao.css";
import { getMedia } from "../../../../data/media";
import image2 from "../../../../assets/image-mobile.webp";

export const SectionAtuacao = ({ localImages = {} }) => {
  return (
    <section className="section-atuacao">
      <div className="left">
        <h2 className="text-title" data-reveal>
          O único congresso do país sobre <b>Gestão Tributária</b> voltado
          exclusivamente para a <b>Administração Pública</b> e <b>Sistema S</b>.
          <hr className="mobile-hr-display" />
          <div className="data-section-mobile">
            <h3>
              <Icon name="calendar"  />Data a confirmar
            </h3>
            <h3>
              <Icon name="location-dot"  />Salvador/BA
            </h3>
          </div>
          <div className="image-mobile-phone">
            <ResponsiveImage image={localImages.image2} sizes="(max-width: 768px) 90vw, 600px" src={image2.src} width={image2.width} height={image2.height} alt="banner evento gtap" loading="lazy" />
          </div>
        </h2>
        <div>
          <hr data-reveal="line" />
        </div>
        <div className="data-section">
          <h3 data-reveal>
            <Icon name="calendar"  />Data a confirmar
          </h3>
          <h3 data-reveal>
            <Icon name="location-dot"  />Salvador/BA
          </h3>
        </div>
      </div>
      <div className="right">
        {/* Colagem: três fotos independentes, cada uma com entrada e hover próprios. */}
        <div className="atuacao-collage">
          <figure className="atuacao-photo atuacao-photo--main" data-reveal="scale">
            <ResponsiveImage image={getMedia("src/assets/temas-foto-1.webp")} sizes="(max-width: 768px) 0px, 500px" alt="Participante fotografando o palco do GTAP" loading="lazy" />
          </figure>
          <figure className="atuacao-photo atuacao-photo--city" data-reveal="scale">
            <ResponsiveImage image={getMedia("src/assets/atuacao-salvador.webp")} sizes="(max-width: 768px) 0px, 200px" alt="Elevador Lacerda, em Salvador" loading="lazy" />
          </figure>
          <figure className="atuacao-photo atuacao-photo--speaker" data-reveal="scale">
            <ResponsiveImage image={getMedia("src/assets/temas-foto-2.webp")} sizes="(max-width: 768px) 0px, 200px" alt="Palestrante no GTAP" loading="lazy" />
          </figure>
        </div>
      </div>
      <div className="bottom">
        <div className="container-box" data-reveal>
          <h3>Confira as áreas de atuação do <b>público-alvo</b></h3>
          <div className="container-tags" data-reveal-stagger>
            <span data-reveal="scale">Recursos Humanos</span>
            <span data-reveal="scale">Gestão Orçamentária</span>
            <span data-reveal="scale">Licitações e Contratos</span>
            <span data-reveal="scale">Gestão Contábil</span>
            <span data-reveal="scale">Controle Interno</span>
            <span data-reveal="scale">Financeiro</span>
            <span data-reveal="scale">Jurídica</span>
            <span data-reveal="scale">Fiscal</span>
          </div>
        </div>
      </div>
    </section>
  );
};
