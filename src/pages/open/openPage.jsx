import { useState, useEffect } from "react";
import "./OpenPage.css"
import { Navbar } from "../../components/Navbar/Navbar";
import { SectionOpen } from "./sections/SectionOpen/SectionOpen";
import { SectionAbout } from "./sections/SectionAbout/SectionAbout";
import { Footer } from "../../components/Footer/Footer";
import { CarouselEmpresas } from "./sections/Carousel/CarouselEmpresas";

export const OpenPage = () => {

    const [clientes, setClientes] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/landing_page.json`)
      .then((res) => res.json())
      .then(setClientes)
      .catch((err) => console.error("Erro ao carregar dados LP", err));
  }, []);

  const clientesEmpresas = clientes.filter((cliente) => cliente.type === 2);

    return (
        <>
            <Navbar lightTemplate />
            <SectionOpen />
            <CarouselEmpresas clientes={clientesEmpresas} />
            <SectionAbout />
            <Footer />
        </>
    )
}