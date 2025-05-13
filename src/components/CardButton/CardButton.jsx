import "./CardButton.css";

export const CardButton = () => {
  return (
    <div className="card-buttons-container">
      <div className="card-button-left">
        <div className="button-left-condition">
          <p>Condições especiais para grupo</p>
        </div>
        <hr />
        <div className="button-left-data">
          <p>16 E 17 DE OUTUBRO DE 2025</p>
        </div>
      </div>
      <div className="card-button-right">
        <div>
          <p className="money-card-button">R$ 3.190,00</p>
          <p>LOTE 1 DISPONÍVEL</p>
        </div>
        <div className="button-right-submit">
          <a
            href="https://api.whatsapp.com/send/?phone=557193852662&text=Quero%20informa%C3%A7%C3%A3o%20sobre%20o%20GTAP&type=phone_number&app_absent=0
"
            target="blank"
          >
            <button>Garantir Vaga</button>
          </a>
        </div>
      </div>
    </div>
  );
};
