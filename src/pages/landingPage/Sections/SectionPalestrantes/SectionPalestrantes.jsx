import "./SectionPalestrantes.css";

export const SectionPalestrantes = ({ data }) => {
  const palestrantes = data.filter((item) => item.type === 0);

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
            style={{ backgroundImage: `url(${palestrante.mediaUrl})` }}
            key={palestrante.id}
          >
            <h6>{palestrante.title}</h6>
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
