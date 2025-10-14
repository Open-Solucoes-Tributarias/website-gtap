import "./CardButton.css";
import { useLoteAtual } from "../../Utils/useLoteAtual";

export const CardButton = () => {
  const { precoAtual, nomeLoteAtual } = useLoteAtual();

  //Recebe o nome do lote atual e converte para o texto que o botão pede de acorod ao design

  const textoBotao = (() => {
    switch (nomeLoteAtual) {
      case "Primeiro Lote":
        return "LOTE 1 DISPONÍVEL";
      case "Segundo Lote":
        return "LOTE 2 DISPONÍVEL";
      case "Terceiro Lote":
        return "DISPONÍVEL EM BREVE";
      default:
        return "CONSULTAR LOTES";
    }
  })();

  return (
    <div className="card-buttons-container">
      <div className="card-button-left">
        <div className="button-left-condition">
          <p>Condições especiais para grupo</p>
        </div>
        <hr />
        <div className="button-left-data">
          <p>16 E 17 DE OUTUBRO DE 2025</p>
          <p>16 E 17 DE OUTUBRO DE 2025</p>
          <p>16 E 17 DE OUTUBRO DE 2025</p>
          <p>16 E 17 DE OUTUBRO DE 2025</p>
          <p>16 E 17 DE OUTUBRO DE 2025</p>
          <p>16 E 17 DE OUTUBRO DE 2025</p>
        </div>
      </div>
      <div className="card-button-right">
        <div>
          <p className="money-card-button">{precoAtual}</p>
          <p>{textoBotao}</p>
        </div>
        <div className="button-right-submit">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSeDUzRWaUN4nBptFGYWQcwAz8r76OUSLiJ1CUi5w1jQefYurQ/viewform?usp=header"
            target="blank"
          >
            <button>Sugerir Tema</button>
          </a>
        </div>
      </div>
    </div>
  );
};
