import localFont from 'next/font/local';
import { MetaPixel } from '../src/components/MetaPixel/MetaPixel';
import '../src/styles/reset.css';
import '../src/styles/generated-media.css';
import '../src/styles/global.css';

const title = 'GTAP - Congresso Brasileiro de Gestão Tributária na adm. Pública';
const description = 'Único congresso do país sobre Gestão Tributária voltado exclusivamente para a Administração Pública e Sistema S.';
const roboto = localFont({
  src: '../node_modules/@fontsource-variable/roboto-condensed/files/roboto-condensed-latin-wght-normal.woff2',
  weight: '100 900',
  display: 'swap',
  variable: '--font-roboto-condensed',
});

export const metadata = {
  metadataBase: new URL('https://gtap.com.br'),
  title,
  description,
  authors: [{ name: 'Open Soluções Tributárias' }],
  robots: { index: true, follow: true },
  openGraph: { title, description, type: 'website', siteName: title, images: [{ url: '/og-gtap.png', width: 1200, height: 630, alt: 'XI GTAP' }] },
};

export default function RootLayout({ children }) {
  return <html lang="pt-BR" className={roboto.variable}><body>{children}<MetaPixel /></body></html>;
}
