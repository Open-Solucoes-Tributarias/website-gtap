"use client";

import { useEffect, useRef, useState } from "react";
import ResponsiveImage from "../../../../components/ResponsiveImage/ResponsiveImage";

const INTERVALO = 5000;

// Duas fotos que se alternam (crossfade). No DOM ficam só a anterior (opaca,
// por baixo), a atual (entra por cima) e a próxima (já carregada, invisível):
// a troca nunca deixa o card vazio e as demais fotos não são baixadas antes da hora. Parado fora da tela,
// com a aba oculta ou com movimento reduzido.
export function ThemesPhotos({ grupos }) {
  const [indices, setIndices] = useState(() => grupos.map(() => 0));
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    let visivel = false;
    let timers = [];
    const parar = () => { timers.forEach(clearInterval); timers.forEach(clearTimeout); timers = []; };
    const iniciar = () => {
      parar();
      grupos.forEach((grupo, g) => {
        // A segunda foto troca meio ciclo depois da primeira.
        const atraso = setTimeout(() => {
          timers.push(setInterval(() => {
            setIndices((atual) => atual.map((i, k) => (k === g ? (i + 1) % grupo.length : i)));
          }, INTERVALO));
        }, g * (INTERVALO / 2));
        timers.push(atraso);
      });
    };
    const sync = () => (visivel && !document.hidden ? iniciar() : parar());
    const observer = new IntersectionObserver(([entry]) => { visivel = entry.isIntersecting; sync(); });
    observer.observe(ref.current);
    document.addEventListener("visibilitychange", sync);
    return () => { parar(); observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, [grupos]);

  return (
    <div className="themes__photos" ref={ref} aria-hidden="true">
      {grupos.map((grupo, g) => {
        const atual = indices[g];
        const proxima = (atual + 1) % grupo.length;
        const anterior = (atual - 1 + grupo.length) % grupo.length;
        return (
          <figure key={g} className={`themes__photo themes__photo--${g === 0 ? "a" : "b"}`} data-reveal="scale">
            {grupo.map((image, i) => (i === atual || i === proxima || i === anterior) && (
              <div
                key={i}
                className={`themes__photo-layer${i === atual ? " is-active" : i === anterior ? " is-prev" : ""}`}
              >
                <ResponsiveImage image={image} alt="" sizes="(max-width: 860px) 45vw, 224px" />
              </div>
            ))}
          </figure>
        );
      })}
    </div>
  );
}
