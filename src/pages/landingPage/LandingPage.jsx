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
import { supabase } from "../../supabaseClient";

export const LandingPage = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const { data, error } = await supabase.from("landing_page").select("*");
    if (error) {
      console.error("erro ao buscar dados", error);
      return;
    }
    setData(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Navbar />
      <BannerSection data={data} />
      <SectionAtuacao />
      <SectionTemas data={data} />
      <SectionPalestrantes data={data} />
      <SectionGaleria />
      <SectionPublico data={data} />
      <SectionDepoimentos data={data} />
      <SectionLocal />
      <SectionForms />
    </>
  );
};
