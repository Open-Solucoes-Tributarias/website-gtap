"use client";

import "./CardButton.css";
import { useLoteAtual } from "../../Utils/useLoteAtual";

const DATA_EVENTO = "DATA A CONFIRMAR";

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
        return "LOTE 3 DISPONÍVEL";
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
          {/* Dois grupos iguais para o loop sem emenda; leitores de tela leem a data uma vez. */}
          <div className="button-left-track">
            {[0, 1].map((group) => (
              <div className="button-left-group" key={group} aria-hidden={group === 1 || undefined}>
                <p>{DATA_EVENTO}</p>
                <p aria-hidden="true">{DATA_EVENTO}</p>
                <p aria-hidden="true">{DATA_EVENTO}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card-button-right">
        <div className="card-button-info">
          <p className="money-card-button">{precoAtual}</p>
          <p>{textoBotao}</p>
        </div>
        <div className="button-right-submit">
          <a
            className="btn btn--gold card-button-cta"
            href="https://api.whatsapp.com/send/?phone=5571992084907&text=Quero%20informa%C3%A7%C3%A3o%20sobre%20o%20GTAP&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
          >
            Garanta a sua vaga
          </a>
        </div>
      </div>
    </div>
  );
};
