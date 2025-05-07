import { useState, useEffect, useRef } from "react";
import "./SectionPublico.css";

export const SectionPublico = () => {
  const [clientes, setClientes] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/clientes.json`)
      .then((res) => res.json())
      .then(setClientes)
      .catch((err) => console.error("Erro ao carregar clientes", err));
  }, []);

  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollAmount = 0;
    const step = 200; // px por vez
    const interval = 3000; //(3 segundos)

    const scroll = () => {
      if (
        container.scrollLeft + container.clientWidth >=
        container.scrollWidth
      ) {
        container.scrollTo({ left: 0, behavior: "smooth" }); // volta pro começo
        scrollAmount = 0;
      } else {
        scrollAmount += step;
        container.scrollTo({ left: scrollAmount, behavior: "smooth" });
      }
    };

    const autoScroll = setInterval(scroll, interval);

    return () => clearInterval(autoScroll);
  }, []);

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
      <div ref={containerRef} className="container-publico">
        {clientes.map((cliente) => (
          <div key={cliente.id} className="card-publico">
            <img src={cliente.imageUrl} alt={`Cliente ${cliente.id}`} />
          </div>
        ))}
      </div>
    </section>
  );
};
