"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ResponsiveImage from "../../../components/ResponsiveImage/ResponsiveImage";
import { Icon } from "../../../components/Icon/Icon";
import { lockScroll, unlockScroll } from "../../../motion/scrollLock";
import { FaceSearch } from "./FaceSearch";
import "./AlbumGrid.css";

// Uma foto em destaque (2x2) a cada 9: quebra a monotonia da grade.
const isFeatured = (index) => index % 9 === 0;
const thumbOf = (image) => image?.srcSet?.split(",")[0].trim().split(" ")[0];
const hashOf = (index) => `#foto-${index + 1}`;
// Id da foto no índice facial: nome do arquivo sem extensão (…/full/dia-1-050.webp).
const idOf = (item) => item.url.split("/").pop().replace(/\.\w+$/, "");
// Álbuns grandes (X GTAP: ~230 fotos) entram aos poucos; os antigos (até 151) inteiros.
const PROGRESSIVE_FROM = 200;
const PAGE = 60;

// Grade do álbum + visualizador em tela cheia (<dialog>). Sem JS, cada foto é um
// link para a imagem em alta; com JS, o clique abre o visualizador.
export const AlbumGrid = ({ images = [], editionText, faceAlbum }) => {
  const dialogRef = useRef(null);
  const swipeRef = useRef(null);
  const triggerRef = useRef(null);
  const [index, setIndex] = useState(null);
  const [direction, setDirection] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [scene, setScene] = useState(null); // null = todos os dias
  const [hits, setHits] = useState(null); // busca facial: [{ id, distance, strong }] ou null
  const faceAlbums = useMemo(() => [faceAlbum], [faceAlbum]);
  const progressive = images.length > PROGRESSIVE_FROM;
  const [shown, setShown] = useState(progressive ? PAGE : images.length);

  // Fotos do álbum (ou só as da busca facial, da mais parecida para a menos), com o
  // índice de cada uma no álbum inteiro (#foto-N).
  const base = useMemo(() => {
    const all = images.map((item, n) => ({ ...item, n }));
    if (!hits) return all;
    const byId = new Map(hits.map((hit) => [hit.id, hit]));
    return all
      .filter((item) => byId.has(idOf(item)))
      .map((item) => ({ ...item, hit: byId.get(idOf(item)) }))
      .sort((a, b) => a.hit.distance - b.hit.distance);
  }, [images, hits]);
  // Dias do álbum (campo scene), na ordem em que aparecem, com a contagem de fotos.
  const scenes = useMemo(() => {
    const counts = new Map();
    base.forEach((item) => item.scene && counts.set(item.scene, (counts.get(item.scene) ?? 0) + 1));
    return [...counts];
  }, [base]);
  // Lista atual (filtrada por dia).
  const list = useMemo(() => base.filter((item) => !scene || item.scene === scene), [base, scene]);
  const total = list.length;
  const open = index !== null;

  const chooseScene = (next) => {
    if (next === scene) return; // chip já ativo: mantém a lista como está
    setScene(next);
    setShown(progressive ? PAGE : images.length);
  };

  const chooseHits = (next) => {
    setHits(next);
    setScene(null);
    setShown(progressive ? PAGE : images.length);
  };

  const show = useCallback((next, dir = 0) => {
    setDirection(dir);
    setLoaded(false);
    setIndex((next + total) % total);
  }, [total]);

  const close = useCallback(() => dialogRef.current?.close(), []);

  // Abre o <dialog> e trava a rolagem da página enquanto estiver aberto.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open || dialog.open) return;
    dialog.showModal();
    lockScroll();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    const onClose = () => {
      unlockScroll();
      setIndex(null);
      // Volta o foco para a foto que abriu o visualizador.
      triggerRef.current?.focus({ preventScroll: true });
      if (window.location.hash.startsWith("#foto-")) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  // Link direto para uma foto (#foto-12) e endereço atualizado ao navegar.
  useEffect(() => {
    const match = /^#foto-(\d+)$/.exec(window.location.hash);
    const n = match ? Number(match[1]) - 1 : -1;
    // Sem filtro ativo no carregamento: o índice da lista é o do álbum.
    if (n >= 0 && n < images.length) show(n);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open && list[index]) history.replaceState(null, "", hashOf(list[index].n));
  }, [open, index, list]);

  // Pré-carrega as vizinhas para a troca ser instantânea.
  useEffect(() => {
    if (!open) return;
    [index + 1, index - 1].forEach((n) => {
      const image = list[(n + total) % total]?.image;
      if (!image) return;
      const img = new Image();
      img.sizes = "100vw";
      img.srcset = image.srcSet;
      img.src = image.src;
    });
  }, [open, index, list, total]);

  const onKeyDown = (event) => {
    if (event.key === "ArrowRight") show(index + 1, 1);
    else if (event.key === "ArrowLeft") show(index - 1, -1);
  };

  // Gesto: deslizar para os lados troca a foto; para baixo fecha.
  const onPointerDown = (event) => {
    if (event.pointerType === "mouse") return;
    swipeRef.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    else if (dy > 90) close();
  };

  // Clique no fundo (fora da foto e dos controles) fecha.
  const onStageClick = (event) => {
    if (event.target === event.currentTarget) close();
  };

  const current = open ? list[index] : null;
  const visible = list.slice(0, shown);

  return (
    <>
      {faceAlbum && (
        <FaceSearch
          albums={faceAlbums}
          matchCount={hits ? hits.length : null}
          onResults={chooseHits}
          onClear={() => chooseHits(null)}
        />
      )}

      {scenes.length > 1 && (
        <div className="album-filters" role="group" aria-label="Filtrar fotos por dia">
          {[[null, base.length], ...scenes].map(([name, count]) => (
            <button
              type="button"
              className="album-chip"
              aria-pressed={scene === name}
              onClick={() => chooseScene(name)}
              key={name ?? "todos"}
            >
              {name ?? "Todos"} <span className="album-chip-count">{count}</span>
            </button>
          ))}
        </div>
      )}

      <ul className="album-grid">
        {visible.map((item, i) => (
          <li
            className={`album-item${isFeatured(i) ? " album-item--featured" : ""}${item.hit && !item.hit.strong ? " album-item--maybe" : ""}`}
            key={item.url}
            data-reveal="fade"
          >
            <a
              href={item.image?.src ?? item.url}
              aria-label={`Abrir foto ${i + 1} de ${total}`}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey) return;
                event.preventDefault();
                triggerRef.current = event.currentTarget;
                show(i);
              }}
            >
              <ResponsiveImage
                image={item.image}
                src={item.url}
                alt=""
                sizes={isFeatured(i) ? "(max-width: 768px) 100vw, 600px" : "(max-width: 768px) 50vw, 300px"}
              />
              <span className="album-item-zoom" aria-hidden="true"><Icon name="expand" /></span>
            </a>
          </li>
        ))}
      </ul>

      {shown < total && (
        <div className="album-more">
          <button type="button" className="btn btn--navy" onClick={() => setShown((value) => value + PAGE)}>
            Carregar mais fotos
          </button>
          <p className="album-more-count" aria-live="polite">{shown} de {total} fotos</p>
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="lightbox"
        aria-label={`Fotos do ${editionText}`}
        onKeyDown={open ? onKeyDown : undefined}
      >
        {current && (
          <>
            <div className="lightbox-bar">
              <p className="lightbox-counter" aria-live="polite">
                <span className="sr-only">Foto </span>{index + 1}<span aria-hidden="true"> / </span><span className="sr-only"> de </span>{total}
              </p>
              <button type="button" className="lightbox-btn lightbox-close" onClick={close} aria-label="Fechar">
                <Icon name="close" />
              </button>
            </div>

            <div
              className="lightbox-stage"
              onClick={onStageClick}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerCancel={() => { swipeRef.current = null; }}
            >
              <figure className="lightbox-figure" key={index} data-dir={direction} data-loaded={loaded || undefined}>
                {/* Miniatura (já em cache da grade) enquanto a foto grande carrega. */}
                <img className="lightbox-placeholder" src={thumbOf(current.image)} alt="" aria-hidden="true" width={current.image?.width} height={current.image?.height} />
                <ResponsiveImage
                  image={current.image}
                  src={current.url}
                  alt={`Foto ${index + 1} do ${editionText}`}
                  sizes="100vw"
                  loading="eager"
                  className="lightbox-img"
                  onLoad={() => setLoaded(true)}
                />
              </figure>
            </div>

            {total > 1 && (
              <>
                <button type="button" className="lightbox-btn lightbox-arrow lightbox-prev" onClick={() => show(index - 1, -1)} aria-label="Foto anterior">
                  <Icon name="chevron-left" />
                </button>
                <button type="button" className="lightbox-btn lightbox-arrow lightbox-next" onClick={() => show(index + 1, 1)} aria-label="Próxima foto">
                  <Icon name="chevron-right" />
                </button>
              </>
            )}
          </>
        )}
      </dialog>
    </>
  );
};
