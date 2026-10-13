import ResponsiveImage from "../../components/ResponsiveImage/ResponsiveImage";
import { Icon } from "../../components/Icon/Icon";
import "./EditionCard.css";

// Card de edição (galeria e navegação entre álbuns): capa otimizada, nome e total de fotos.
export const EditionCard = ({ edition, featured = false, label }) => (
  <a className={`edition-card${featured ? " edition-card--featured" : ""}`} href={edition.href} data-reveal="scale">
    <ResponsiveImage
      image={edition.cover}
      alt=""
      sizes={featured ? "(max-width: 768px) 100vw, 800px" : "(max-width: 768px) 100vw, 400px"}
      className="edition-card-img"
    />
    <span className="edition-card-body">
      {label && <span className="edition-card-label">{label}</span>}
      <span className="edition-card-title">{edition.editionText}</span>
      <span className="edition-card-meta">
        {edition.count} fotos
        <span className="edition-card-cta">Ver álbum <Icon name="chevron-right" /></span>
      </span>
    </span>
  </a>
);
