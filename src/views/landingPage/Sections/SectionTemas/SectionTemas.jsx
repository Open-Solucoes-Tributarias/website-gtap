import gallery from "../../../../data/gallery-media.json";
import { xGtapFullUrl } from "../../../../data/xgtap";
import { ThemesPhotos } from "./ThemesPhotos";
import "./SectionTemas.css";

// Fotos do X GTAP (2026) que se alternam: plateia/painéis à esquerda, palestrantes à direita.
const foto = (id) => gallery[xGtapFullUrl(id)];
const GRUPOS = [
  ["dia-1-147", "dia-1-357", "dia-2-087", "dia-2-181"].map(foto),
  ["dia-1-351", "dia-2-065", "dia-2-166", "dia-2-207"].map(foto),
];

// Lista de temas no estilo do website-gtap (numeração, filetes e duas fotos
// inclinadas à direita), com fundo branco.
//
// A lista de temas (type 1 em public/api/landing_page.json) está comentada até a divulgação.
// Para voltar: receba { data } e restaure o bloco comentado abaixo no lugar do aviso "Em breve".
export const SectionTemas = () => {
  // const temas = data.filter((tema) => tema.type === 1);

  return (
    <section className="themes" id="temas">
      <div className="themes__block">
        <div className="themes__col">
          <h2 className="themes__title" data-reveal>O que vamos <b>discutir no XI GTAP</b></h2>
          {/*
          <ol className="themes__list" data-reveal-stagger>
            {temas.map((tema) => (
              <li className="theme-row" key={tema.id} data-reveal>
                <span className="theme-row__num" aria-hidden="true">
                  {String(Number(tema.title)).padStart(2, "0")}
                </span>
                <p className="theme-row__text">{tema.description}</p>
              </li>
            ))}
          </ol>
          */}
          <div className="themes__soon" data-reveal>
            <span className="themes__soon-tag">Em breve</span>
            <p className="themes__soon-title">Os temas do XI GTAP serão divulgados em breve.</p>
            <p className="themes__soon-text">Assim que a programação for definida, os assuntos que vamos discutir aparecem aqui.</p>
          </div>
        </div>
        <ThemesPhotos grupos={GRUPOS} />
      </div>
    </section>
  );
};
