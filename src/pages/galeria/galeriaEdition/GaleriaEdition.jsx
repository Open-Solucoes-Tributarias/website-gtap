import { useParams } from "react-router-dom";
import "./GaleriaEdition.css";


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
        default:
            console.log("nenhuma das opções");
    }

    return (
        <>
            <section>
                <p>Edição GTAP</p>
            </section>
        </>
    )
}