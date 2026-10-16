"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "../../../../components/Icon/Icon";
import ResponsiveImage from "../../../../components/ResponsiveImage/ResponsiveImage";
import "./SectionGaleria.css";

const CELULAS = 4;
const INTERVALO = 6000;

// Galeria compacta: texto à esquerda e 4 fotos em grade 2×2 que trocam uma de
// cada vez (crossfade). Cada célula mantém no DOM só a foto anterior (opaca, por
// baixo), a atual e a próxima; pausa fora da tela, com a aba oculta ou com
// movimento reduzido.
export const SectionGaleria = ({ images }) => {
  const celulas = Array.from({ length: CELULAS }, (_, c) => images.filter((_, i) => i % CELULAS === c));
  const [indices, setIndices] = useState(() => celulas.map(() => 0));
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    let visivel = false;
    let timer = 0;
    let vez = 0;
    // Uma célula troca por vez, em sequência: 0, 3, 1, 2 (diagonais alternadas).
    const ordem = [0, 3, 1, 2];
    const passo = () => {
      const c = ordem[vez % CELULAS];
      vez += 1;
      setIndices((atual) => atual.map((i, k) => (k === c ? (i + 1) % celulas[c].length : i)));
    };
    const sync = () => {
      clearInterval(timer);
      if (visivel && !document.hidden) timer = setInterval(passo, INTERVALO / CELULAS * 2);
    };
    const observer = new IntersectionObserver(([entry]) => { visivel = entry.isIntersecting; sync(); });
    observer.observe(ref.current);
    document.addEventListener("visibilitychange", sync);
    return () => { clearInterval(timer); observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, [celulas.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="section-galeria" id="galeria" ref={ref}>
      <div className="galeria-texto" data-reveal-stagger>
        <h2 className="galeria-titulo" data-reveal><b>Galeria</b></h2>
        <p className="galeria-lead" data-reveal>
          Acompanhe de perto o que o GTAP tem realizado nos últimos anos.
        </p>
        <a href="/galeria/" className="galeria-cta btn btn--gold" data-reveal>
          <Icon name="search" />Acesse a galeria
        </a>
      </div>

      <div className="galeria-grade" aria-hidden="true" data-reveal="scale">
        {celulas.map((fotos, c) => {
          const atual = indices[c];
          const proxima = (atual + 1) % fotos.length;
          const anterior = (atual - 1 + fotos.length) % fotos.length;
          return (
            <div className="galeria-celula" key={c}>
              {fotos.map((foto, i) => (i === atual || i === proxima || i === anterior) && (
                <div
                  key={foto.id}
                  className={`galeria-camada${i === atual ? " is-active" : i === anterior ? " is-prev" : ""}`}
                >
                  <ResponsiveImage image={foto.image} src={foto.imageUrl} alt="" sizes="(max-width: 768px) 45vw, 280px" />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
};
