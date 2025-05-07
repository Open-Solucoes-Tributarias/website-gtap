import "./Forms.css";

export const Forms = () => {
  return (
    <div className="container-forms">
      <div className="container-forms-left">
        <p>
          Preencha o formulário abaixo e fale com nossa equipe para saber mais
          sobre o evento.
        </p>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-input">
            <label htmlFor="nome">Nome *</label>
            <input
              id="nome"
              type="text"
              placeholder="Seu nome"
              aria-label="nome"
              required
            />
          </div>
          <div className="form-input">
            <label htmlFor="email">Email *</label>
            <input type="email" placeholder="Seu e-mail" required />
          </div>
          <div className="form-input">
            <label htmlFor="tel">WhatsApp *</label>
            <input type="tel" placeholder="(00) 00000-0000" required />
          </div>
          <div className="form-input">
            <button type="submit">SOLICITAR INFORMAÇÕES</button>
          </div>
        </form>
      </div>

      <div className="container-forms-right"></div>
    </div>
  );
};
