import { getMedia } from "../../data/media";
import galleryMedia from "../../data/gallery-media.json";
import { BannerSection } from "../../components/Banner/Banner";
import { Navbar } from "../../components/Navbar/Navbar";
import { SectionAtuacao } from "./Sections/SectionAtuacao/SectionAtuacao";
import { SectionDepoimentos } from "./Sections/SectionDepoimentos/SectionDepoimentos";
import { SectionForms } from "./Sections/SectionForms/SectionForms";
import { SectionGaleria } from "./Sections/SectionGaleria/SectionGaleria";
import { SectionLocal } from "./Sections/SectionLocal/SectionLocal";
import { SectionPalestrantes } from "./Sections/SectionPalestrantes/SectionPalestrantes";
import { SectionPublico } from "./Sections/SectionPublico/SectionPublico";
import { SectionTemas } from "./Sections/SectionTemas/SectionTemas";
import { CardButton } from "../../components/CardButton/CardButton";
import { SectionIdealizador } from "./Sections/SectionIdealizador/SectionIdealizador";
import { Footer } from "../../components/Footer/Footer";
import { SectionInvestimento } from "./Sections/SectionInvestimentos/SectionInvestimento";

// Fotos da galeria da home: X GTAP (2026), em paisagem, dos dois dias.
// Não repete as usadas na seção de Temas nem nas composições de src/assets.
const GALERIA_FOTOS = [
  "dia-1-088", "dia-2-018", "dia-1-122", "dia-2-106", "dia-1-186", "dia-2-128", "dia-1-192", "dia-2-201",
  "dia-1-236", "dia-2-260", "dia-1-252", "dia-1-278", "dia-1-286", "dia-1-346", "dia-1-423", "dia-1-440",
].map((id) => {
  const url = `/galerias/x-gtap/full/${id}.webp`;
  return { id: url, image: galleryMedia[url] };
});

export const LandingPage = ({ data, poster }) => {
  return (
    <>
      <Navbar />
      <CardButton />
      <BannerSection data={data.filter((item) => item.type === 6)} poster={poster} />
      <SectionAtuacao localImages={{ image2: getMedia("src/assets/image-mobile.webp") }} />
      <SectionTemas data={data.filter((item) => item.type === 1)} />
      <SectionIdealizador localImages={{ ImageAlexandre: getMedia("src/assets/alexandre.webp") }} />
      <SectionPalestrantes data={data.filter((item) => item.type === 0)} />
      <SectionGaleria images={GALERIA_FOTOS} />
      <SectionPublico data={data.filter((item) => item.type === 2)} />
      <SectionInvestimento />
      <SectionDepoimentos data={data.filter((item) => item.type === 3)} />
      <SectionLocal data={data.filter((item) => item.type === 7)} />
      <SectionForms />
      <Footer />
    </>
  );
};
