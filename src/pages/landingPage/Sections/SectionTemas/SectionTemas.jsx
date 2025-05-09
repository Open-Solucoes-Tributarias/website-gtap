import { useEffect, useState } from "react";
import "./SectionTemas.css";

export const SectionTemas = ({ data }) => {
  const temas = data.filter((tema) => tema.type === 1);

  return (
    <section className="section-temas" id="temas">
      <div className="section-temas-left">
        <h3>Temas confirmados</h3>
        <h5>
          Prepare-se para entender os impactos da Reforma Tributária sobre a
          Administração Pública (enquanto sujeito ativo e passivo de obrigações)
        </h5>
        {temas.map((tema) => (
          <div className="card-tema" key={tema.id}>
            <span>{Number(tema.title)}</span>
            <p>{tema.description}</p>
          </div>
        ))}
      </div>
      <div className="section-temas-right"></div>
    </section>
  );
};
