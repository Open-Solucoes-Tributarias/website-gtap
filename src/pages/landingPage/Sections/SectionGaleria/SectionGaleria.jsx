import { useEffect, useState } from "react";
import "animate.css";
import "./SectionGaleria.css";

const IMAGES_VISIBLE = 6;
const INTERVAL_MS = 5000;

export const SectionGaleria = () => {
  const [images, setImages] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/galeria.json`)
      .then((res) => res.json())
      .then(setImages)
      .catch((err) => console.error("Erro ao carregar galeria", err));
  }, []);

  useEffect(() => {
    if (images.length <= IMAGES_VISIBLE) return;

    const interval = setInterval(() => {
      setVisible(false); // inicia fade-out

      setTimeout(() => {
        setStartIndex((prev) => (prev + 6) % images.length); // avança 1 posição
        setVisible(true); // aplica fade-in
      }, 800);
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, [images]);

  const getVisibleImages = () => {
    const visibleImages = [];
    for (let i = 0; i < Math.min(IMAGES_VISIBLE, images.length); i++) {
      const index = (startIndex + i) % images.length;
      if (images[index]) visibleImages.push(images[index]);
    }
    return visibleImages;
  };

  const currentGroup = getVisibleImages();

  return (
    <section className="section-galeria" id="galeria">
       <h3 className="title-galeria-mobile">Galeria</h3>
      <div className="section-galeria-left">
        {currentGroup.map((img, index) => (
          <div
            className={`card-imagens ${visible ? "animate__animated animate__fadeIn" : ""
              }`}
            key={img.id}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <img src={img.imageUrl} alt="image-url" loading="lazy" />
          </div>
        ))}
      </div>
      <div className="section-galeria-right">
        <h3>Galeria</h3>
        <h5>Acompanhe de perto o que o GTAP tem realizado nos últimos anos.</h5>
        <a href="galeria">
          <button>
            <i className="fa-solid fa-camera"></i>ACESSE A GALERIA
          </button>
        </a>
      </div>
    </section>
  );
};
