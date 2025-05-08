import { useEffect, useState } from "react";
import "./AdminLoginPage.css";
import { supabase } from "../../supabaseClient";
import { AdminDash } from "../admin/AdminDash";

export const AdminLoginPage = () => {
  const [userAuth, setUserAuth] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    console.log("enviado", email, password);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Erro ao fazer login, verifique se login e senha estão corretos");
      return;
    }
    localStorage.setItem("user", JSON.stringify(data.user));
    setUserAuth(true);
  };

  useEffect(() => {
    const userString = localStorage.getItem("user");
    try {
      const user = JSON.parse(userString);
      if (user?.role === "authenticated") {
        setUserAuth(true);
      }
    } catch (error) {
      alert("Efetue login com usuário autorizado");
    }
  }, []);

  return (
    <>
      {!userAuth ? (
        <section className="login-page-section">
          <div className="login-page-left-container">
            <img src="./icon-gtap.svg" />
            <p>Login de acesso Administrador</p>
            <form onSubmit={handleLogin}>
              <div className="form-input-admin">
                <label htmlFor="email">Email *</label>
                <input
                  name="email"
                  type="email"
                  placeholder="Seu e-mail"
                  required
                />
              </div>
              <div className="form-input-admin">
                <label htmlFor="password">senha *</label>
                <input
                  name="password"
                  type="password"
                  placeholder="senha"
                  required
                />
              </div>
              <div className="form-input-admin">
                <button type="submit">ENTRAR</button>
              </div>
            </form>
          </div>
          <div className="login-page-right-container"></div>
        </section>
      ) : (
        <AdminDash />
      )}
    </>
  );
};
