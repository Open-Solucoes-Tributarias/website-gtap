import "./AdminPage.css";

export const AdminPage = () => {
  return (
    <section className="login-page-section">
      <div className="login-page-left-container">
        <img src="./icon-gtap.svg" />
        <p>Login de acesso Administrador</p>
        <div className="form-input-admin">
          <label htmlFor="email">Email *</label>
          <input name="email" type="email" placeholder="Seu e-mail" required />
        </div>
        <div className="form-input-admin">
          <label htmlFor="password">senha *</label>
          <input name="password" type="password" placeholder="senha" required />
        </div>
        <div className="form-input-admin">
          <button type="submit">ENTRAR</button>
        </div>
      </div>
      <div className="login-page-right-container"></div>
    </section>
  );
};
