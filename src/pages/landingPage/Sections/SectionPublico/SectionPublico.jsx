import "./SectionPublico.css";

export const SectionPublico = ({ data }) => {
  const clientes = data.filter((cliente) => cliente.type === 2);


  return (
    <section className="section-publico">
      <div>
        <h3>Grandes entidades públicas marcaram presença.</h3>
      </div>
      <div>
        <h5>
          Evento reuniu representantes de destaque para discutir soluções
          inovadoras e fortalecer parcerias institucionais.
        </h5>
      </div>

      {/* Carrossel com duas linhas */}
      <div className="container-publico">
        {clientes.map((cliente) => (
          <div key={cliente.id} className="card-publico">
            <img src={cliente.mediaUrl} alt={`Cliente ${cliente?.title}`} />
          </div>
        ))}
      </div>
    </section>
  );
};
