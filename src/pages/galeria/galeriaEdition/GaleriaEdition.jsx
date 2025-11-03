import { useParams } from "react-router-dom";
import "./GaleriaEdition.css";
import { Navbar } from "../../../components/Navbar/Navbar";
import { Footer } from "../../../components/Footer/Footer";
import AsNavFor from "../../../components/Slider/Slider";
import { useEffect, useState } from "react";

export const GaleriaEdition = () => {
    // captura na url a edição clicada no compoente pai
    const { editionText } = useParams();
    //decodificar url para evitar espaços em branco como code
    const decodedText = decodeURIComponent(editionText);
    //estado que gurda a logo correspodentes ao GTAP selecionado
    const [logo, setLogo] = useState("");
    const [folder, setFolder] = useState("");
    const [images, setImages] = useState([]);

useEffect(() => {
  switch (decodedText) {
    case "I GTAP":
      setLogo("/assets/logos/gtapi.svg");
      setFolder("i-gtap");
      break;
    case "II GTAP":
      setLogo("/assets/logos/iigtap.svg");
      setFolder("ii-gtap");
      break;
    case "III GTAP":
      setLogo("/assets/logos/iiigtap.svg");
      setFolder("iii-gtap");
      break;
    case "IV GTAP":
      setLogo("/assets/logos/ivgtap.svg");
      setFolder("iv-gtap");
      break;
    case "V GTAP":
      setLogo("/assets/logos/vgtap.svg");
      setFolder("v-gtap");
      break;
    case "VI GTAP":
      setLogo("/assets/logos/vigtap.svg");
      setFolder("vi-gtap");
      break;
    case "VII GTAP":
      setLogo("/assets/logos/viigtap.svg");
      setFolder("vii-gtap");
      break;
    case "VIII GTAP":
      setLogo("/assets/logos/viiigtap.svg");
      setFolder("viii-gtap");
      break;
    case "IX GTAP":
      setLogo("/assets/logos/ixgtap.svg");
      setFolder("ix-gtap");
      break;
    default:
      setLogo("/assets/logos/gtapi.svg");
      setFolder(null);
  }
}, [decodedText]);

useEffect(() => {
  if (!folder) return;

  fetch(`${import.meta.env.BASE_URL}api/galerias/${folder}.json`)
    .then((res) => {
      if (!res.ok) throw new Error(`Erro ao buscar o JSON: ${res.status}`);
      return res.json();
    })
    .then((data) => setImages(data))
    .catch((err) => {
      console.error("Erro ao carregar galeria", err);
      setImages([]);
    });
}, [folder]);

    return (
        <>
            <Navbar />
            <section className="container-edition-galeria">
                <div className="edition-galeria-left">
                    <img src={logo} alt="img-gtap"/>
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