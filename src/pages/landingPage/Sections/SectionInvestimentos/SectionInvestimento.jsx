import "./SectionInvestimento.css";

export const SectionInvestimento = () => {
  return (
    <section className="investimento-container">
      <div className="investimento-title">
        <h3>
          Valor do <b>investimento</b> por participante
        </h3>
      </div>
      <div className="container-lotes">
        <div className="card-lote">
          <p className="name-lote">Primeiro Lote</p>
          <div className="container-border">
            <div className="border-recort"></div>
            <div className="border-recort-right"></div>
          </div>
          <hr className="linea" />
          <p className="valor-lote">R$ 3.190,00</p>
          <p>JANEIRO A MAIO</p>
        </div>
        <div className="card-lote-white">
          <p className="name-lote">Segundo Lote</p>
          <div className="container-border">
            <div className="border-recort"></div>
            <div className="border-recort-right"></div>
          </div>
          <hr className="linea" />
          <p className="valor-lote">R$ 3.490,00</p>
          <p>JUNHO A AGOSTO</p>
        </div>
        <div className="card-effect-blur">
          <p className="name-lote">Terceiro Lote</p>
          <div className="container-border">
            <div className="border-recort"></div>
            <div className="border-recort-right"></div>
          </div>
          <hr className="linea" />
          <p className="valor-lote">R$ 3.690,00</p>
          <p>SETEMBRO A OUTUBRO</p>
        </div>
      </div>
    </section>
  );
};
