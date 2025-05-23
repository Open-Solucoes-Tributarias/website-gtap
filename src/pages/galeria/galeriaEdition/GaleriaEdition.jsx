import { useParams } from "react-router-dom";
import "./GaleriaEdition.css";
import { supabase } from "../../../supabaseClient";
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
      setFolder("midias/galerias/i-gtap");
      break;
    case "II GTAP":
      setLogo("/assets/logos/iigtap.svg");
      setFolder("midias/galerias/ii-gtap");
      break;
    case "III GTAP":
      setLogo("/assets/logos/iiigtap.svg");
      setFolder("midias/galerias/iii-gtap");
      break;
    case "IV GTAP":
      setLogo("/assets/logos/ivgtap.svg");
      setFolder("midias/galerias/iv-gtap");
      break;
    case "V GTAP":
      setLogo("/assets/logos/vgtap.svg");
      setFolder("midias/galerias/v-gtap");
      break;
    case "VI GTAP":
      setLogo("/assets/logos/vigtap.svg");
      setFolder("midias/galerias/vi-gtap");
      break;
    case "VII GTAP":
      setLogo("/assets/logos/viigtap.svg");
      setFolder("midias/galerias/vii-gtap");
      break;
    case "VIII GTAP":
      setLogo("/assets/logos/viiigtap.svg");
      setFolder("midias/galerias/viii-gtap");
      break;
    default:
      setLogo("/assets/logos/gtapi.svg");
      setFolder(null);
  }
}, [decodedText]);


const fetchImages = async () => {
  if (!folder) return;

  const { data, error } = await supabase.storage
    .from("medias")
    .list(folder);

  if (error) {
    console.error("Erro ao listar arquivos:", error);
    setImages([]);
  } else {
    const loadedImages = data
      .filter(file => file.name.match(/\.(jpg|jpeg|png|webp)$/i))
      .map((file, index) => ({
        id: index,
        url: `https://pzbntescgueoxaynlzoa.supabase.co/storage/v1/object/public/medias/${folder}/${file.name}`,
      }));
    setImages(loadedImages);
  }
};

useEffect(() => {
  if (folder) {
    fetchImages();
  }
}, [folder]);


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