import "./SectionGaleria.css";
import alexandreImg from "../../../../assets/palestrantes/alexandre-marques.jpg";
import gustavoReis from "../../../../assets/palestrantes/gustavo-reis.jpg";

const images = [
  {
    id: 0,
    imageUrl:
      "https://opensolucoestributarias.sharepoint.com/sites/MateriaisDigitais/Documentos%20Partilhados/GTAP/Midias%20Website%20GTAP/Galeria%20GTAP/imagegaleria1.jpg",
  },
  {
    id: 1,
    imageUrl:
      "https://opensolucoestributarias.sharepoint.com/sites/MateriaisDigitais/Documentos%20Partilhados/GTAP/Midias%20Website%20GTAP/Galeria%20GTAP/imagegaleria2.jpg",
  },
  {
    id: 2,
    imageUrl:
      "https://opensolucoestributarias.sharepoint.com/sites/MateriaisDigitais/Documentos%20Partilhados/GTAP/Midias%20Website%20GTAP/Galeria%20GTAP/imagegaleria3.jpg",
  },
  {
    id: 3,
    imageUrl:
      "https://opensolucoestributarias.sharepoint.com/sites/MateriaisDigitais/Documentos%20Partilhados/GTAP/Midias%20Website%20GTAP/Galeria%20GTAP/imagegaleria4.jpg",
  },
  {
    id: 4,
    imageUrl:
      "https://opensolucoestributarias.sharepoint.com/sites/MateriaisDigitais/Documentos%20Partilhados/GTAP/Midias%20Website%20GTAP/Galeria%20GTAP/imagegaleria5.jpg",
  },
  {
    id: 5,
    imageUrl:
      "https://opensolucoestributarias.sharepoint.com/sites/MateriaisDigitais/Documentos%20Partilhados/GTAP/Midias%20Website%20GTAP/Galeria%20GTAP/imagegaleria6.jpg",
  },
];

export const SectionGaleria = () => {
  return (
    <section className="section-galeria">
      <div className="section-galeria-left">
        {images.map((images) => (
          <div className="card-imagens" key={images.id}>
            <img src={images.imageUrl} />
          </div>
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
