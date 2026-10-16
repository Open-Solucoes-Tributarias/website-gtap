import { PrivacidadePage } from '../../src/views/privacidade/PrivacidadePage';
import { sharedOpenGraph } from '../../src/data/metadata';

export const metadata = {
  title: 'Política de Privacidade | GTAP',
  description: 'Como o GTAP trata dados pessoais no site, incluindo o formulário de contato e a busca facial nos álbuns.',
  alternates: { canonical: '/privacidade/' },
  openGraph: { ...sharedOpenGraph, url: '/privacidade/' },
};
export default function Privacidade() {
  return <PrivacidadePage />;
}
