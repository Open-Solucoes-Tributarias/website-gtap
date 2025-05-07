import { BannerSection } from "../../components/Banner/Banner";
import { Forms } from "../../components/Forms/Forms";
import { Navbar } from "../../components/Navbar/Navbar";
// import "./LandingPage.css";
import { SectionAtuacao } from "./Sections/SectionAtuacao/SectionAtuacao";
import { SectionDepoimentos } from "./Sections/SectionDepoimentos/SectionDepoimentos";
import { SectionForms } from "./Sections/SectionForms/SectionForms";
import { SectionGaleria } from "./Sections/SectionGaleria/SectionGaleria";
import { SectionLocal } from "./Sections/SectionLocal/SectionLocal";
import { SectionPalestrantes } from "./Sections/SectionPalestrantes/SectionPalestrantes";
import { SectionPublico } from "./Sections/SectionPublico/SectionPublico";
import { SectionTemas } from "./Sections/SectionTemas/SectionTemas";

export const LandingPage = () => {
  return (
    <>
      <Navbar />
      <BannerSection />
      <SectionAtuacao />
      <SectionTemas />
      <SectionPalestrantes />
      <SectionGaleria />
      <SectionPublico />
      <SectionDepoimentos />
      <SectionLocal />
      <SectionForms />
    </>
  );
};
