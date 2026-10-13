import { GaleriaPage } from '../../src/views/galeria/GaleriaPage';
import { sharedOpenGraph } from '../../src/data/metadata';
import { editionSummaries } from '../../src/data/albums';

export const metadata = { title: 'Galeria de edições | GTAP', alternates: { canonical: '/galeria/' }, openGraph: { ...sharedOpenGraph, url: '/galeria/' } };
export default function Gallery() {
  return <GaleriaPage editions={editionSummaries()} />;
}
