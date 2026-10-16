"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaceSearch } from "./galeriaEdition/FaceSearch";
import "./GaleriaFaceSearch.css";

const thumbOf = (editionText, id) => `https://gtap.com.br/midias/${encodeURIComponent(editionText)}/thumb/${id}.webp`;

// Busca facial da galeria: procura em todas as edições e mostra as fotos agrupadas por edição.
// albums: [{ key, editionText, href, ids }] (da mais recente para a mais antiga; ids na ordem do álbum).
export const GaleriaFaceSearch = ({ albums }) => {
  const resultsRef = useRef(null);
  const [hits, setHits] = useState(null);
  const [showMaybe, setShowMaybe] = useState(false);
  const keys = useMemo(() => albums.map((album) => album.key), [albums]);

  const strongCount = hits ? hits.filter((hit) => hit.strong).length : 0;
  // Por padrão só alta confiança; os "possíveis" ficam atrás de um botão (a busca geral tem mais ruído).
  const visible = useMemo(() => {
    if (!hits) return [];
    return showMaybe || !strongCount ? hits : hits.filter((hit) => hit.strong);
  }, [hits, showMaybe, strongCount]);

  const groups = useMemo(
    () => albums
      .map((album) => ({
        ...album,
        photos: visible
          .filter((hit) => hit.album === album.key)
          .map((hit) => ({ ...hit, n: album.ids.indexOf(hit.id) }))
          .filter((hit) => hit.n >= 0),
      }))
      .filter((album) => album.photos.length),
    [albums, visible],
  );

  const onResults = (next) => {
    setShowMaybe(false);
    setHits(next);
  };

  useEffect(() => {
    if (hits) resultsRef.current?.scrollIntoView({ block: "start" });
  }, [hits]);

  return (
    <section className="galeria-face" aria-label="Encontre suas fotos">
      <FaceSearch
        albums={keys}
        scope="all"
        matchCount={hits ? visible.length : null}
        onResults={onResults}
        onClear={() => setHits(null)}
      />

      {hits && (
        <div className="face-results" ref={resultsRef} aria-live="polite">
          {!strongCount && (
            <p className="face-results-note">
              Não há correspondências de alta confiança. Estas são as fotos <b>possíveis</b>: confira se é você.
            </p>
          )}
          {groups.map((album) => (
            <section className="face-group" key={album.key}>
              <h3>{album.editionText} <span>{album.photos.length === 1 ? "1 foto" : `${album.photos.length} fotos`}</span></h3>
              <ul className="face-thumbs">
                {album.photos.map((hit) => (
                  <li key={hit.id} className={hit.strong ? undefined : "face-thumb--maybe"}>
                    <a href={`${album.href}#foto-${hit.n + 1}`} aria-label={`Abrir foto ${hit.n + 1} do ${album.editionText}`}>
                      <img src={thumbOf(album.editionText, hit.id)} alt="" width="400" height="267" loading="lazy" decoding="async" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {strongCount > 0 && strongCount < hits.length && (
            <button type="button" className="face-trigger face-trigger--light face-results-more" onClick={() => setShowMaybe((value) => !value)}>
              {showMaybe ? "Mostrar só alta confiança" : `Mostrar também as possíveis (${hits.length - strongCount})`}
            </button>
          )}
        </div>
      )}
    </section>
  );
};
