import gallery from "../../../../data/gallery-media.json";
import { ThemesPhotos } from "./ThemesPhotos";
import "./SectionTemas.css";

// Fotos do X GTAP (2026) que se alternam: plateia/painéis à esquerda, palestrantes à direita.
const foto = (id) => gallery[`/galerias/x-gtap/full/${id}.webp`];
const GRUPOS = [
  ["dia-1-147", "dia-1-357", "dia-2-087", "dia-2-181"].map(foto),
  ["dia-1-351", "dia-2-065", "dia-2-166", "dia-2-207"].map(foto),
];

// Lista de temas no estilo do website-gtap (numeração, filetes e duas fotos
// inclinadas à direita), com fundo branco.
export const SectionTemas = ({ data }) => {
  const temas = data.filter((tema) => tema.type === 1);

  return (
    <section className="themes" id="temas">
      <div className="themes__block">
        <div className="themes__col">
          <h2 className="themes__title" data-reveal>O que vamos <b>discutir no XI GTAP</b></h2>
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
        </div>
        <ThemesPhotos grupos={GRUPOS} />
      </div>
    </section>
  );
};
