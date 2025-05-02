import { BannerSection } from "../../components/Banner/Banner";
import { Navbar } from "../../components/Navbar/Navbar";
import "./LandingPage.css";
import { SectionAtuacao } from "./Sections/SectionAtuacao/SectionAtuacao";
import { SectionTemas } from "./Sections/SectionTemas/SectionTemas";

export const LandingPage = () => {
  return (
    <div>
      <Navbar />
      <BannerSection />
      <SectionAtuacao />
      <SectionTemas />
    </div>
  );
};
