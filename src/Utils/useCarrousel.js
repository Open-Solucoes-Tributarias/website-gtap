import { useEffect, useRef } from "react";

/**
 * Hook para aplicar auto-scroll horizontal suave a um container com overflow-x.
 *
 * @param {number} step - Quantidade de scroll (px) por iteração.
 * @param {number} interval - Intervalo entre scrolls (ms).
 * @returns {React.RefObject} - Ref que deve ser atribuído ao container.
 */
export function useCarrousel(step = 200, interval = 3000) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollAmount = 0;

    const scroll = () => {
      if (
        container.scrollLeft + container.clientWidth >=
        container.scrollWidth
      ) {
        container.scrollTo({ left: 0, behavior: "smooth" });
        scrollAmount = 0;
      } else {
        scrollAmount += step;
        container.scrollTo({ left: scrollAmount, behavior: "smooth" });
      }
    };

    const autoScroll = setInterval(scroll, interval);
    return () => clearInterval(autoScroll);
  }, [step, interval]);

  return containerRef;
}
