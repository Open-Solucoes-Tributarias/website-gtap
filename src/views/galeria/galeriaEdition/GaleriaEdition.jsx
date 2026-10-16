import "./GaleriaEdition.css";
import { Navbar } from "../../../components/Navbar/Navbar";
import { Footer } from "../../../components/Footer/Footer";
import ResponsiveImage from "../../../components/ResponsiveImage/ResponsiveImage";
import { Icon } from "../../../components/Icon/Icon";
import { AlbumGrid } from "./AlbumGrid";
import { EditionCard } from "../EditionCard";

export const GaleriaEdition = ({ editionText, images, cover, logo, logoWidth, logoHeight, newer, older, photographer, faceAlbum }) => {

    return (
        <>
            <Navbar />
            {/* Abertura: foto de capa do álbum (LCP, sem animação) com o logo da edição. */}
            <section className="album-hero">
                <ResponsiveImage
                    image={cover}
                    alt=""
                    loading="eager"
                    fetchPriority="high"
                    sizes="100vw"
                    className="album-hero-img"
                />
                <div className="album-hero-content">
                    <a className="album-back" href="/galeria/" data-enter>
                        <Icon name="chevron-left" /> Todas as edições
                    </a>
                    <img className="album-logo" src={logo} alt={`${editionText} logo`} width={logoWidth} height={logoHeight} data-enter />
                    <hr data-enter="line" />
                    <p data-enter>Reviva os <b>melhores momentos</b> do maior congresso de Gestão Tributária na Administração Pública.</p>
                    <div className="album-hero-actions" data-enter>
                        <a className="btn btn--gold" href="#fotos">Ver as {images.length} fotos</a>
                        {photographer && <p className="album-credit">{`Fotos: ${photographer}`}</p>}
                    </div>
                </div>
            </section>

            <section className="album-fotos" id="fotos" aria-label={`Fotos do ${editionText}`}>
                <AlbumGrid images={images} editionText={editionText} faceAlbum={faceAlbum} />
            </section>

            {(newer || older) && (
                <nav className="album-nav" aria-label="Outras edições">
                    <h3 data-reveal>Veja <b>outras edições</b></h3>
                    <div className="album-nav-cards">
                        {older && <EditionCard edition={older} label="Edição anterior" />}
                        {newer && <EditionCard edition={newer} label="Próxima edição" />}
                    </div>
                    <a className="btn btn--navy album-nav-all" href="/galeria/" data-reveal>Todas as edições</a>
                </nav>
            )}
            <Footer />
        </>
    )
}
