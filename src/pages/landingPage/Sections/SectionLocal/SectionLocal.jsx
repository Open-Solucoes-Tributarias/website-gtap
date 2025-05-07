import "./SectionLocal.css";

export const SectionLocal = () => {
  return (
    <section className="section-localizacao">
      <div className="section-localizacao-left">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d87966.15711226991!2d-38.45577891634429!3d-12.99795045296838!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7161786a7ffff8b%3A0x2fcfe4b59d0dace1!2sHotel%20Deville%20Prime%20Salvador!5e0!3m2!1spt-BR!2sbr!4v1746561724708!5m2!1spt-BR!2sbr"
          
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
      <div className="section-localizacao-right">
        <div className="box-text-local">
          <h5>
            Mais uma vez em <br /> <b>Salvador/BA</b>
          </h5>
          <p>
            A cidade que sedia o GTAP já está com local definido para receber
            servidores de todo o Brasil: Centro de Convenções Deville Prime.
          </p>
        </div>
      </div>
    </section>
  );
};
