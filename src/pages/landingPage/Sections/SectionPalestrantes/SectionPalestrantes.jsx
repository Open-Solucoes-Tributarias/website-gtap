import "./SectionPalestrantes.css";
import alexandreImg from "../../../../assets/palestrantes/alexandre-marques.jpg";
import gustavoReis from "../../../../assets/palestrantes/gustavo-reis.jpg";

const palestrantes = [
  {
    id: 0,
    name: "Alexandre Marques",
    description: "Consultor da Open Soluções Tributárias",
    imageUrl: alexandreImg,
  },
  {
    id: 1,
    name: "Gustavo Reis",
    description: "Consultor da Open Soluções Tributárias",
    imageUrl: gustavoReis,
  },
];

export const SectionPalestrantes = () => {
  return (
    <section className="section-palestrantes">
      <div>
        <h3>Palestrantes</h3>
      </div>
      <div>
        <h5>
          Grandes nomes do universo tributário reunidos para debater temas
          cruciais junto a participantes de várias partes do Brasil.
        </h5>
      </div>
      <div className="container-palestrantes">
        {palestrantes.map((palestrante) => (
          <div
            className="card-palestrantes"
            style={{ backgroundImage: `url(${palestrante.imageUrl})` }}
            key={palestrante.id}
          >
            <h6>{palestrante.name}</h6>
            <p>{palestrante.description}</p>
          </div>
        ))}
      </div>
      <div>
        <h5>Aguarde a confirmação dos próximos!</h5>
      </div>
    </section>
  );
};
