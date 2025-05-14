import "./Forms.css";
import { supabase } from "../../supabaseClient";

export const Forms = () => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = e.target.nome.value;
    const email = e.target.email.value;
    const whatsapp = e.target.tel.value;

    const data = { name, email, whatsapp };

    const { error } = await supabase.from("forms").insert(data);
    if (error) {
      console.error("erro ao enviar fomrulário", error);
      return;
    } else {
      alert("Seus dados foram recebidos com sucesso!");
    }
  };

  return (
    <div className="container-forms">
      <div className="container-forms-left">
        <p>
          Preencha o formulário abaixo e fale com nossa equipe para saber mais
          sobre o evento.
        </p>
        <form
          onSubmit={(e) => {
            handleSubmit(e);
          }}
        >
          <div className="form-input">
            <label htmlFor="nome">Nome *</label>
            <input
              name="nome"
              type="text"
              placeholder="Seu nome"
              aria-label="nome"
              required
            />
          </div>
          <div className="form-input">
            <label htmlFor="email">Email *</label>
            <input
              name="email"
              type="email"
              placeholder="Seu e-mail"
              required
            />
          </div>
          <div className="form-input">
            <label htmlFor="tel">WhatsApp *</label>
            <input
              name="tel"
              type="tel"
              placeholder="(00) 00000-0000"
              required
            />
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
