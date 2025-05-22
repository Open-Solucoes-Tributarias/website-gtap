import { useEffect, useRef } from "react";

export function useCarousel(step = 200, interval = 3000) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollAmount = 0;

    const scroll = () => {
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
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

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -step, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: step, behavior: "smooth" });
    }
  };

  return { containerRef, scrollLeft, scrollRight };
}
