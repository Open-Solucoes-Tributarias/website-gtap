import { LandingPage } from '../src/views/landingPage/LandingPage';
import data from '../public/api/landing_page.json';
import { sharedOpenGraph } from '../src/data/metadata';
import { withMedia, getMedia } from '../src/data/media';

export const metadata = { alternates: { canonical: '/' }, openGraph: { ...sharedOpenGraph, url: '/' } };
export default function Home() {
  const prepared = withMedia(data);
  return <LandingPage data={prepared} poster={getMedia('/preloadBanner.webp')} />;
}
