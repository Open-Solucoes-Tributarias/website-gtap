"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaceSearch } from "./galeriaEdition/FaceSearch";
import { Lightbox } from "./Lightbox";
import { scrollToElement } from "../../motion/scrollTo";
import "./GaleriaFaceSearch.css";

const midiasOf = (editionText) => `https://gtap.com.br/midias/${encodeURIComponent(editionText)}`;

// Busca facial da galeria: procura em todas as edições e mostra as fotos encontradas na ordem
// de semelhança (a mesma ordem do visualizador).
// albums: [{ key, editionText, href, photos: [[id, largura, altura]] }] (da edição mais recente
// para a mais antiga; photos na ordem do álbum, para montar o link #foto-N).
export const GaleriaFaceSearch = ({ albums }) => {
  const resultsRef = useRef(null);
  const triggerRef = useRef(null);
  const [hits, setHits] = useState(null);
  const [showMaybe, setShowMaybe] = useState(false);
  const [index, setIndex] = useState(null);
  const keys = useMemo(() => albums.map((album) => album.key), [albums]);
  const lookup = useMemo(() => new Map(albums.map((album) => [
    album.key,
    { album, photos: new Map(album.photos.map(([id, width, height], n) => [id, { n, width, height }])) },
  ])), [albums]);

  const strongCount = hits ? hits.filter((hit) => hit.strong).length : 0;
  // Por padrão só alta confiança; os "possíveis" ficam atrás de um botão (a busca geral tem mais ruído).
  const shown = useMemo(() => {
    if (!hits) return [];
    return showMaybe || !strongCount ? hits : hits.filter((hit) => hit.strong);
  }, [hits, showMaybe, strongCount]);

  // Uma lista só, na ordem encontrada: a grade e o visualizador andam juntos.
  const items = useMemo(() => shown.flatMap((hit) => {
    const entry = lookup.get(hit.album);
    const meta = entry?.photos.get(hit.id);
    if (!meta) return [];
    const { editionText, href } = entry.album;
    const base = midiasOf(editionText);
    const full = `${base}/full/${hit.id}.webp`;
    return [{
      id: `${hit.album}/${hit.id}`,
      url: full,
      thumb: `${base}/thumb/${hit.id}.webp`,
      image: {
        src: full,
        srcSet: `${base}/thumb/${hit.id}.webp 360w, ${base}/mid/${hit.id}.webp 800w, ${full} ${meta.width}w`,
        width: meta.width,
        height: meta.height,
      },
      caption: editionText,
      href: `${href}#foto-${meta.n + 1}`,
      strong: hit.strong,
    }];
  }), [shown, lookup]);

  const onResults = (next) => {
    setShowMaybe(false);
    setHits(next);
  };

  useEffect(() => {
    if (hits) scrollToElement(resultsRef.current);
  }, [hits]);

  const onLightboxClose = useCallback(() => {
    setIndex(null);
    triggerRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section className="galeria-face" aria-label="Encontre suas fotos">
      <FaceSearch
        albums={keys}
        scope="all"
        matchCount={hits ? items.length : null}
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
          <ul className="face-thumbs">
            {items.map((item, i) => (
              <li key={item.id} className={item.strong ? undefined : "face-thumb--maybe"}>
                <a
                  href={item.href}
                  aria-label={`Abrir foto ${i + 1} de ${items.length} (${item.caption})`}
                  onClick={(event) => {
                    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
                    event.preventDefault();
                    triggerRef.current = event.currentTarget;
                    setIndex(i);
                  }}
                >
                  <img src={item.thumb} alt="" width="360" height="240" loading="lazy" decoding="async" />
                  <span className="face-thumb-edition">{item.caption}</span>
                </a>
              </li>
            ))}
          </ul>
          {strongCount > 0 && strongCount < hits.length && (
            <button type="button" className="face-trigger face-trigger--light face-results-more" onClick={() => setShowMaybe((value) => !value)}>
              {showMaybe ? "Mostrar só alta confiança" : `Mostrar também as possíveis (${hits.length - strongCount})`}
            </button>
          )}
        </div>
      )}

      <Lightbox
        items={items}
        index={index}
        label="Fotos encontradas"
        altOf={(item, position) => `Foto ${position + 1} de ${items.length} (${item.caption})`}
        onShow={setIndex}
        onClose={onLightboxClose}
      />
    </section>
  );
};
