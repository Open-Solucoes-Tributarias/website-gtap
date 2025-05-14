import "./SectionInvestimento.css";
import { useLoteAtual } from "../../../../Utils/useLoteAtual";

export const SectionInvestimento = () => {
  const { loteAtual, lotes } = useLoteAtual();

  return (
    <section className="investimento-container">
      <div className="investimento-title">
        <h3>
          Valor do <b>investimento</b> por participante
        </h3>
      </div>

      <div className="container-lotes">
        {lotes.map((lote, index) => (
          <div
            key={index}
            className={`card-lote ${lote.status}`}
            style={{
              background:
                lote.status === "presente"
                  ? undefined // aplica o CSS padrão
                  : lote.status === "passado"
                  ? "#010B5B"
                  : "#fff",
            }}
          >
            <p className="name-lote">{lote.nome}</p>
            <div className="container-border">
              <div className="border-recort"></div>
              <div className="border-recort-right"></div>
            </div>
            <hr className="linea" />
            <p className="valor-lote">{lote.preco}</p>
            <p>{lote.periodo}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
