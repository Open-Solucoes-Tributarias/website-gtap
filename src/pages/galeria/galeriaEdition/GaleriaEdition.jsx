import { useParams } from "react-router-dom";
import ScrollToTop from "../../../Utils/ScrollToTop";
import "./GaleriaEdition.css";
import { Navbar } from "../../../components/Navbar/Navbar";
import { Footer } from "../../../components/Footer/Footer";
import AsNavFor from "../../../components/Slider/Slider";
import { useEffect, useState } from "react";

const images = [
    {
        id: 0,
        url: "https://pzbntescgueoxaynlzoa.supabase.co/storage/v1/object/public/medias/midias/GTAP%20Galerias/1b1ecf_030606216269495e98e134d78d0b01a2.webp"
    },
    {
        id: 1,
        url: "https://pzbntescgueoxaynlzoa.supabase.co/storage/v1/object/public/medias/midias/GTAP%20Galerias/1b1ecf_0615fef6880e4bf3af44797de32b8d9f.webp"
    },
    {
        id: 2,
        url: "https://pzbntescgueoxaynlzoa.supabase.co/storage/v1/object/public/medias/midias/GTAP%20Galerias/1b1ecf_19b44faa97bb4738850bbe556d54a824.webp"
    }
]

export const GaleriaEdition = () => {
    // captura na url a edição clicada no compoente pai
    const { editionText } = useParams();
    //decodificar url para evitar espaços em branco como code
    const decodedText = decodeURIComponent(editionText);
    //estado que gurda a logo correspodentes ao GTAP selecionado
    const [logo, setLogo] = useState("");

    useEffect(() => {
        switch (decodedText) { // valor da label da edição selecionada
            case "I GTAP":
                setLogo("/assets/logos/gtapi.svg");
                break;
            case "II GTAP":
                setLogo("/assets/logos/iigtap.svg");
                break;
            case "III GTAP":
                setLogo("/assets/logos/iiigtap.svg");
                break;
            case "IV GTAP":
                setLogo("/assets/logos/ivgtap.svg");
                break;
            case "V GTAP":
                setLogo("/assets/logos/vgtap.svg");
                break;
            case "VI GTAP":
                setLogo("/assets/logos/vigtap.svg");
                break;
            case "VII GTAP":
                setLogo("/assets/logos/viigtap.svg");
                break;
            case "VIII GTAP":
                setLogo("/assets/logos/viiigtap.svg");
                break;
            default:
                setLogo("/assets/logos/gtapi.svg");
        }
    }, [decodedText]);
    return (
        <>
            <Navbar />
            <section className="container-edition-galeria">
                <div className="edition-galeria-left">
                    <img src={logo} />
                    <hr />
                    <p>Reviva os <b>melhores momentos</b> do maior congresso de Gestão Tributária na Administração Pública.</p>
                </div>

                <div className="edition-galeria-right">
                    <AsNavFor images={images} />
                </div>

            </section>
            <Footer />
        </>

    )
}