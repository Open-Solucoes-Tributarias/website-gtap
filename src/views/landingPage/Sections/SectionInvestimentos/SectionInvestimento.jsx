"use client";

import "./SectionInvestimento.css";
import { useLoteAtual } from "../../../../Utils/useLoteAtual";

const WHATSAPP_URL = "https://api.whatsapp.com/send/?phone=5571992084907&text=Quero%20informa%C3%A7%C3%A3o%20sobre%20o%20GTAP&type=phone_number&app_absent=0";

// Ingressos no estilo do website-gtap, adaptado ao fundo azul da seção.
export const SectionInvestimento = () => {
  const { lotes, loteAtual } = useLoteAtual();

  return (
    <section className="tickets" id="preços" aria-labelledby="tickets-title">
      <h2 id="tickets-title" className="tickets__title" data-reveal>Garanta sua <b>participação</b></h2>

      <div className="tickets__grid" data-reveal-stagger>
        {lotes.map((lote, index) => {
          const current = lote.status === "presente";
          const expired = lote.status === "passado";
          return (
            <article
              key={lote.nome}
              className={`ticket ${current ? "ticket--current" : "ticket--inactive"}`}
              aria-labelledby={`ticket-lot-${index}`}
              data-reveal="scale"
            >
              <div className="ticket__top">
                <span className="ticket__status">{current ? "Disponível" : expired ? "Encerrado" : "Em breve"}</span>
                <h3 id={`ticket-lot-${index}`} className="ticket__name">{lote.nome}</h3>
              </div>
              <div className="ticket__tear" aria-hidden="true" />
              <div className="ticket__pricing">
                <p className={`ticket__price${expired ? " ticket__price--closed" : ""}`} aria-label={expired ? "Valor do lote encerrado" : undefined}>
                  {expired ? <span aria-hidden="true">{lote.preco}</span> : lote.preco}
                </p>
                <p className="ticket__unit">por participante</p>
                {current && <p className="ticket__window">{lote.label}</p>}
              </div>
              {current ? (
                <a className="ticket__btn btn btn--navy" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  Garantir minha vaga
                </a>
              ) : (
                <p className="ticket__closed">{expired ? "Inscrições encerradas" : "Aguarde a abertura"}</p>
              )}
            </article>
          );
        })}
      </div>

      {!loteAtual && <p className="tickets__notice">Consulte as condições vigentes com a nossa equipe.</p>}
      <a className="ticket-group btn btn--ghost" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" data-reveal>
        Condições especiais para equipes e órgãos <span aria-hidden="true">↗</span>
      </a>
    </section>
  );
};
