"use client";

import { Icon } from "../../../../components/Icon/Icon";
import { useEffect, useRef } from "react";
import "./SectionDepoimentos.css";

export const SectionDepoimentos = ({ data }) => {
  const depoimentos = data.filter((d) => d.type === 3);
  const sliderRef = useRef(null);
  // Carrossel infinito: três cópias da lista; o visitante fica sempre na do meio.
  // Ao parar de rolar dentro de uma cópia lateral, salta (sem animação) a largura
  // de uma cópia — o conteúdo é idêntico, então o salto é invisível.
  const copias = depoimentos.length > 1 ? [0, 1, 2] : [1];

  const larguraCopia = () => {
    const slider = sliderRef.current;
    const cards = slider?.children;
    if (!slider || !cards || cards.length < depoimentos.length * 2) return 0;
    return cards[depoimentos.length].offsetLeft - cards[0].offsetLeft;
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider || copias.length === 1) return undefined;
    // Saltos sempre instantâneos: o slider tem scroll-behavior: smooth, e uma
    // rolagem animada no carregamento faz o Chrome parar de medir o LCP.
    const saltar = (left) => slider.scrollTo({ left, behavior: "instant" });
    saltar(larguraCopia()); // começa na cópia do meio

    let timer = 0;
    const recentrar = () => {
      const copia = larguraCopia();
      if (!copia) return;
      if (slider.scrollLeft < copia * 0.5) saltar(slider.scrollLeft + copia);
      else if (slider.scrollLeft > copia * 1.5) saltar(slider.scrollLeft - copia);
    };
    // Sem scrollend (o Lenis o engole): espera a rolagem ficar parada 150 ms.
    const aoRolar = () => {
      clearTimeout(timer);
      timer = setTimeout(recentrar, 150);
    };
    slider.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", recentrar);
    return () => {
      clearTimeout(timer);
      slider.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", recentrar);
    };
  }, [depoimentos.length, copias.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const passo = () => {
    const card = sliderRef.current?.firstElementChild;
    if (!card) return 0;
    const estilo = getComputedStyle(card);
    return card.offsetWidth + parseFloat(estilo.marginRight || 0);
  };

  // Ao iniciar um vídeo, pausa os outros (como no site anterior).
  const aoIniciar = (evento) => {
    sliderRef.current?.querySelectorAll("video").forEach((v) => {
      if (v !== evento.currentTarget) v.pause();
    });
  };

  const pauseAllVideos = () => {
    sliderRef.current?.querySelectorAll("video").forEach((v) => {
      try { v.pause(); } catch { /* Video may already be stopped. */ }
    });
  };

  const scrollBehavior = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

  const scrollLeft = () => {
    pauseAllVideos();
    sliderRef.current?.scrollBy({ left: -passo(), behavior: scrollBehavior() });
  };

  const scrollRight = () => {
    pauseAllVideos();
    sliderRef.current?.scrollBy({ left: passo(), behavior: scrollBehavior() });
  };

  return (
    <section className="section-depoimentos">
      <div className="section-depoimentos-head">
        <h3 data-reveal>Veja o que <b>nosso público</b> fala sobre o GTAP</h3>
      </div>

      <div className="slider-wrapper" data-reveal>
        <button type="button" className="testimonial-arrow testimonial-arrow-prev" onClick={scrollLeft} aria-label="Anterior"><Icon name="chevron-left" /></button>

        <div className="slider" ref={sliderRef} data-lenis-prevent-horizontal>
          {copias.flatMap((copia) => depoimentos.map((depoimento) => {
            const chave = `${copia}-${depoimento.id}`;
            const clone = copia !== 1;
            return (
              <div className="depoimento-card" key={chave} aria-hidden={clone || undefined}>
                {/* Player nativo, como no site anterior: o visitante aperta o play do próprio
                    navegador (sem autoplay, que os navegadores bloqueiam). O pôster vem de
                    public/posters/depoimentos e preload="none" evita baixar vídeos de até
                    130 MB antes do clique. */}
                <div className="video-container">
                  <video
                    className="depoimento-video"
                    controls
                    playsInline
                    preload="none"
                    poster={`/posters/depoimentos/${depoimento.id}.webp`}
                    tabIndex={clone ? -1 : undefined}
                    onPlay={aoIniciar}
                  >
                    <source src={depoimento.mediaUrl} type="video/mp4" />
                    Seu navegador não suporta vídeo HTML5.
                  </video>
                </div>

                <h6>{depoimento.title}</h6>
                <p className="depoimento-inst">{depoimento.description}</p>
                <blockquote className="depoimento-quote">{depoimento.annotation}</blockquote>
              </div>
            );
          }))}
        </div>

        <button type="button" className="testimonial-arrow testimonial-arrow-next" onClick={scrollRight} aria-label="Próximo"><Icon name="chevron-right" /></button>
      </div>
    </section>
  );
};
