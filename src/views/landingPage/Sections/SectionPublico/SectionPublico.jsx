import "./SectionPublico.css";

// Entidades participantes em duas faixas de logos rolando em loop contínuo
// (sentidos opostos), só CSS: cada faixa tem duas cópias e anda metade da
// própria largura. Pausa no hover; com movimento reduzido vira rolagem manual.
export const SectionPublico = ({ data = [] }) => {
  const clientes = data.filter((cliente) => cliente.type === 2);
  const metade = Math.ceil(clientes.length / 2);
  const faixas = [clientes.slice(0, metade), clientes.slice(metade)];

  return (
    <section className="section-publico">
      <h3 className="publico-titulo" data-reveal>
        <b>Grandes entidades públicas</b> marcaram presença
      </h3>

      <div className="publico-faixas" data-reveal="fade">
        {faixas.map((faixa, f) => (
          <div className={`publico-faixa${f === 1 ? " publico-faixa--reversa" : ""}`} key={f}>
            <ul className="publico-trilha">
              {[0, 1].flatMap((copia) => faixa.map((cliente) => (
                <li className="card-publico" key={`${copia}-${cliente.id}`} aria-hidden={copia === 1 || undefined}>
                  {/* Logos recortados (public/assets/entidades): sem o card branco
                      com sombra que vinha embutido nas imagens originais. */}
                  <img
                    src={`/assets/entidades/${cliente.id}.webp`}
                    alt={copia === 1 ? "" : (cliente.title ?? "Entidade participante")}
                    loading="lazy"
                    decoding="async"
                  />
                </li>
              )))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};
