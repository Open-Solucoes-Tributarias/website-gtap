import { useState, useEffect } from "react";
import "./SectionPalestrantes.css";

export const SectionPalestrantes = () => {
  const [palestrantes, setPalestrantes] = useState([]);

  useEffect(() => {
    fetch("./api/palestrantes.json")
      .then((res) => res.json())
      .then(setPalestrantes)
      .catch((err) => console.error("Erro ao carregar palestrantes", err));
  }, []);

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
