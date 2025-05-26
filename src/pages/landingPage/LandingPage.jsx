import { useState, useEffect } from "react";
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
// import { supabase } from "../../supabaseClient";
import { CardButton } from "../../components/CardButton/CardButton";
import { SectionIdealizador } from "./Sections/SectionIdealizador/SectionIdealizador";
import { Footer } from "../../components/Footer/Footer";
import { SectionInvestimento } from "./Sections/SectionInvestimentos/SectionInvestimento";

export const LandingPage = () => {
  const [data, setData] = useState([]);

  // const fetchData = async () => {
  //   const { data, error } = await supabase.from("landing_page").select("*");
  //   if (error) {
  //     console.error("erro ao buscar dados", error);
  //     return;
  //   }
  //   setData(data);
  // };

  // useEffect(() => {
  //   fetchData();
  // }, []);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/landing_page.json`)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("Erro ao carregar dados LP", err));
  }, []);

  return (
    <>
      <Navbar />
      <CardButton />
      <BannerSection data={data} />
      <SectionAtuacao />
      <SectionTemas data={data} />
      <SectionIdealizador />
      <SectionPalestrantes data={data} />
      <SectionGaleria />
      <SectionPublico data={data} />
      <SectionDepoimentos data={data} />
      <SectionInvestimento />
      <SectionLocal data={data} />
      <SectionForms />
      <Footer />
    </>
  );
};
