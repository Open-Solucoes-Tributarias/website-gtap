import Script from "next/script";

// Meta Pixel da Open (o mesmo da LP do congresso). Carrega depois do load
// (lazyOnload): não disputa banda nem thread com o primeiro paint.
export const META_PIXEL_ID = "549971842334998";

const SNIPPET = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`;

export const MetaPixel = () => (
  <>
    <Script id="meta-pixel" strategy="lazyOnload">{SNIPPET}</Script>
    <noscript>
      <img height="1" width="1" style={{ display: "none" }} alt="" src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} />
    </noscript>
  </>
);

/** Evento Lead após o envio do formulário (sem efeito se o Pixel foi bloqueado). */
export function trackLead() {
  if (typeof window !== "undefined" && typeof window.fbq === "function") window.fbq("track", "Lead");
}
