// Rola até um elemento de forma suave. Com Lenis ativo (desktop) quem anima é o Lenis
// (smoothScroll.js escuta o evento abaixo); sem ele (toque, movimento reduzido) cai no
// scroll nativo, que respeita o scroll-margin-top do elemento.
export const SCROLL_TO_EVENT = 'gtap:scroll-to';

export function scrollToElement(element) {
  if (!element) return;
  const handled = !window.dispatchEvent(new CustomEvent(SCROLL_TO_EVENT, { cancelable: true, detail: { target: element } }));
  if (handled) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  element.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}
