import { PrivacidadePage } from '../../src/views/privacidade/PrivacidadePage';
import { sharedOpenGraph } from '../../src/data/metadata';

export const metadata = {
  title: 'Política de Privacidade e Cookies | GTAP',
  description: 'Como o GTAP trata dados pessoais no site: formulário de contato, cookies, fotos dos eventos e busca facial nos álbuns.',
  alternates: { canonical: '/privacidade/' },
  openGraph: { ...sharedOpenGraph, url: '/privacidade/' },
};
export default function Privacidade() {
  return <PrivacidadePage />;
}
