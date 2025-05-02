import "./SectionGaleria.css";
import alexandreImg from "../../../../assets/palestrantes/alexandre-marques.jpg";
import gustavoReis from "../../../../assets/palestrantes/gustavo-reis.jpg";

const images = [
  {
    id: 0,
    imageUrl: alexandreImg,
  },
  {
    id: 1,
    imageUrl: gustavoReis,
  },
];

export const SectionGaleria = () => {
  return (
    <section className="section-galeria">
      <div>
        {images.map((images) => (
          <div
            style={{ backgroundImage: `url(${images.imageUrl})` }}
            key={images.id}
          ></div>
        ))}
      </div>
      <div className="section-galeria-right">
        <h3>Galeria</h3>
        <h5>Acompanhe de perto o que o GTAP tem realizado nos últimos anos.</h5>
        <button>
          <i class="fa-solid fa-camera"></i>ACESSE A GALERIA
        </button>
      </div>
    </section>
  );
};
