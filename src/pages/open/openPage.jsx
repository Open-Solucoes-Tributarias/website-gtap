import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import "./OpenPage.css"
import { Navbar } from "../../components/Navbar/Navbar";
import { SectionOpen } from "./sections/SectionOpen/SectionOpen";
import { SectionAbout } from "./sections/SectionAbout/SectionAbout";
import { Footer } from "../../components/Footer/Footer";
import { CarouselEmpresas } from "./sections/Carousel/CarouselEmpresas";

export const OpenPage = () => {

    const [clientes, setClientes] = useState([]);

    const fetchData = async () => {
        const { data, error } = await supabase.from("landing_page").select("*").eq("type", 2);
        // Filtra no bando as linhas de tipo 2
        if (error) {
            console.error("erro ao buscar dados", error);
            return;
        }
        setClientes(data);
    };

    useEffect(() => {
        fetchData();
    }, []);


    return (
        <>
            <Navbar lightTemplate />
            <SectionOpen />
            <CarouselEmpresas clientes={clientes} />
            <SectionAbout />
            <Footer />
        </>
    )
}