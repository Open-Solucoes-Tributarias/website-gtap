import { useParams } from "react-router-dom";
import "./GaleriaEdition.css";
import { Navbar } from "../../../components/Navbar/Navbar";
import { Footer } from "../../../components/Footer/Footer";
import AsNavFor from "../../../components/Slider/Slider";

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

    console.log("valor recebido na editio galeria", decodedText);


    switch (editionText) { //Edition trás o valor da label da edição selecionada
        case "I GTAP":
            //EXECUTAR SE FOR O CASO 1
            break;
        case "II GTAP":
            break;
        case "III GTAP":
            break;
        case "IV GTAP":
            break;
        case "V GTAP":
            break;
        case "VI GTAP":
            break;
        case "VII GTAP":
            break;
        case "VIII GTAP":
            break;
        default:
            console.log("nenhuma das opções");
    }

    return (
        <>
            <Navbar />
            <section className="container-edition-galeria">
                <div className="edition-galeria-left">
                    <img src="./logo.svg" />
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