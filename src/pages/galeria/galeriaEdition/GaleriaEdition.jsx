import { useParams } from "react-router-dom";
import "./GaleriaEdition.css";
import { Navbar } from "../../../components/Navbar/Navbar";


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
                    <img src="https://pzbntescgueoxaynlzoa.supabase.co/storage/v1/object/public/medias/midias/cards%20Gtaps/gtap%20v.jpg" />
                </div>
            </section>
        </>
    )
}