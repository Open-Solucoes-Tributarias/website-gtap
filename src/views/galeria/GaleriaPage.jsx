import "./GaleriaPage.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { EditionCard } from "./EditionCard";

export const GaleriaPage = ({ editions = [] }) => {
    // Banner e CTA apontam para a edição mais recente (a lista vem da mais nova).
    const latest = editions[0];

    return (
        <>
            <Navbar />
            <section className="container-banner-galeria">
                <div className="content-text-galeria-banner">
                    <div className="div-text-galeria">
                        <h5 data-enter>{latest?.editionText}</h5>
                        <p data-enter>A melhor edição de todos os tempos</p>
                    </div>
                    <div className="div-button-galeria-banner">
                        <a className="galeria-banner-cta btn btn--gold" href={latest?.href} data-enter>Acessar álbum completo</a>
                    </div>
                </div>
            </section>
            <section className="container-card-gtaps">
                <div className="card-gtaps-head">
                    <h3 data-reveal>Confira as fotos das <b>edições passadas</b></h3>
                    <p data-reveal>{editions.length} edições e {editions.reduce((total, item) => total + item.count, 0)} fotos do maior congresso de Gestão Tributária na Administração Pública.</p>
                </div>
                <div className="content-card-gtaps">
                    {/* A mais recente ganha destaque (2x2 no desktop). */}
                    {editions.map((edition, index) => (
                        <EditionCard edition={edition} featured={index === 0} key={edition.editionText} />
                    ))}
                </div>
            </section>
            <Footer />
        </>
    )
}
