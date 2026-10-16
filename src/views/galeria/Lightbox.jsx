"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ResponsiveImage from "../../components/ResponsiveImage/ResponsiveImage";
import { Icon } from "../../components/Icon/Icon";
import { lockScroll, unlockScroll } from "../../motion/scrollLock";
import "./Lightbox.css";

const thumbOf = (image) => image?.srcSet?.split(",")[0].trim().split(" ")[0];

// Visualizador em tela cheia (<dialog>) sobre uma lista de fotos: setas, teclado, gestos
// (lado a lado troca; para baixo fecha) e pré-carga das vizinhas. A ordem é a da lista recebida.
// items: [{ url, image, caption?, href? }]; index: posição aberta ou null (fechado).
// onShow(posição): o dono do estado troca o índice. onClose(): chamado depois que o <dialog> fecha.
export const Lightbox = ({ items, index, label, altOf, onShow, onClose }) => {
  const dialogRef = useRef(null);
  const swipeRef = useRef(null);
  const closeRef = useRef(onClose);
  const [direction, setDirection] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const total = items.length;
  const open = index !== null;
  const current = open ? items[index] : null;

  useEffect(() => {
    closeRef.current = onClose;
  });

  const show = useCallback((next, dir = 0) => {
    setDirection(dir);
    setLoaded(false);
    onShow((next + total) % total);
  }, [total, onShow]);

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
    const onDialogClose = () => {
      unlockScroll();
      setLoaded(false);
      setDirection(0);
      closeRef.current?.();
    };
    dialog.addEventListener("close", onDialogClose);
    return () => dialog.removeEventListener("close", onDialogClose);
  }, []);

  // Pré-carrega as vizinhas para a troca ser instantânea.
  useEffect(() => {
    if (!open) return;
    [index + 1, index - 1].forEach((n) => {
      const image = items[(n + total) % total]?.image;
      if (!image) return;
      const img = new Image();
      img.sizes = "100vw";
      img.srcset = image.srcSet;
      img.src = image.src;
    });
  }, [open, index, items, total]);

  const onKeyDown = (event) => {
    if (event.key === "ArrowRight") show(index + 1, 1);
    else if (event.key === "ArrowLeft") show(index - 1, -1);
  };

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

  return (
    <dialog ref={dialogRef} className="lightbox" aria-label={label} onKeyDown={open ? onKeyDown : undefined}>
      {current && (
        <>
          <div className="lightbox-bar">
            <p className="lightbox-counter" aria-live="polite">
              <span className="sr-only">Foto </span>{index + 1}<span aria-hidden="true"> / </span><span className="sr-only"> de </span>{total}
              {current.caption && <span className="lightbox-caption"> · {current.caption}</span>}
            </p>
            {current.href && <a className="lightbox-link" href={current.href}>Ver no álbum</a>}
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
                alt={altOf(current, index)}
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
  );
};
