import { BannerSection } from "../../components/Banner/Banner";
import { Navbar } from "../../components/Navbar/Navbar";
import "./LandingPage.css";
import { SectionAtuacao } from "./Sections/SectionAtuacao/SectionAtuacao";

export const LandingPage = () => {
  return (
    <div>
      <Navbar />
      <BannerSection />
      <SectionAtuacao />
    </div>
  );
};
