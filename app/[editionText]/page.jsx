import { notFound } from 'next/navigation';
import { editions } from '../../src/data/editions';
import { GaleriaEdition } from '../../src/views/galeria/galeriaEdition/GaleriaEdition';
import { sharedOpenGraph } from '../../src/data/metadata';
import { loadAlbum, editionSummaries, coverOf } from '../../src/data/albums';

export const dynamicParams = false;
export function generateStaticParams() {
  // No dev o parâmetro chega codificado ("IX%20GTAP"); no export, com espaço.
  return editions.flatMap(({ editionText }) => process.env.NODE_ENV === 'development'
    ? [{ editionText }, { editionText: encodeURIComponent(editionText) }]
    : [{ editionText }]);
}
export async function generateMetadata({ params }) {
  const { editionText: encodedEdition } = await params;
  const editionText = decodeURIComponent(encodedEdition);
  const path = `/${encodeURIComponent(editionText)}/`;
  return { title: `${editionText} — Galeria | GTAP`, alternates: { canonical: path }, openGraph: { ...sharedOpenGraph, url: path } };
}
export default async function Edition({ params }) {
  const { editionText: encodedEdition } = await params;
  const editionText = decodeURIComponent(encodedEdition);
  const edition = editions.find((item) => item.editionText === editionText);
  if (!edition) notFound();
  const images = loadAlbum(edition);
  // Edições vizinhas (a lista vem da mais recente para a mais antiga).
  const summaries = editionSummaries();
  const position = summaries.findIndex((item) => item.editionText === editionText);
  return (
    <GaleriaEdition
      editionText={editionText}
      logo={edition.logo}
      logoWidth={edition.logoWidth}
      logoHeight={edition.logoHeight}
      images={images}
      cover={coverOf(edition)}
      photographer={edition.photographer}
      newer={summaries[position - 1]}
      older={summaries[position + 1]}
    />
  );
}
