"use client";

import { useEffect, useRef, useState } from "react";
import { buildRdBody, captureTracking, formatPhone, isValidEmail, isValidPhone, sendConversion } from "../../Utils/leadForm";
import { trackLead } from "../MetaPixel/MetaPixel";
import "./Forms.css";

// Retorno do envio, mostrado abaixo do botão (região aria-live, no lugar do alert()).
const FEEDBACK = {
  success: "Recebemos seus dados! Em breve entraremos em contato.",
  error: "Não foi possível enviar agora. Tente novamente em instantes.",
  invalid: "Confira o e-mail e o WhatsApp com DDD.",
};

const sessionStore = () => {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

// Os dados vão direto para o RD Station (identificador site-gtap-xi); o envio
// bem-sucedido também registra o evento Lead no Meta Pixel.
export const Forms = () => {

const [isSend, isSetSend] = useState(false);
const [feedback, setFeedback] = useState(null); // null | "success" | "error" | "invalid"
const trackingRef = useRef({});

// UTMs da visita (guardadas na sessão para quem navega antes de enviar).
useEffect(() => {
  trackingRef.current = captureTracking(window.location.search, sessionStore());
}, []);

const handleSubmit = async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const lead = {
    name: form.elements.name.value,
    email: form.elements.email.value,
    phone: form.elements.tel.value,
  };
  setFeedback(null); //limpa a mensagem anterior para a nova ser anunciada e animada

  if (!isValidEmail(lead.email) || !isValidPhone(lead.phone)) {
    setFeedback("invalid");
    (isValidEmail(lead.email) ? form.elements.tel : form.elements.email).focus();
    return;
  }

  isSetSend(true); //desativa botao
  try {
    await sendConversion(buildRdBody(lead, trackingRef.current));
    trackLead();
    setFeedback("success");
    form.reset(); //limpando dados após envio
  } catch {
    setFeedback("error"); //falha de rede ou resposta de erro do RD
  } finally {
    isSetSend(false);
  }
};

  return (
    <div className="container-forms" data-reveal="scale">
      <div className="container-forms-left">
        <p className="forms-title" data-reveal>
          Preencha o formulário abaixo e <b>fale com nossa equipe</b> para saber mais sobre o evento.
        </p>
        <form
          onSubmit={handleSubmit}
          id="contactForm"
          data-reveal-stagger
        >
          <div className="form-input form-input--full" data-reveal>
            <label htmlFor="name">Nome *</label>
            <input
              id="name"
              autoComplete="name"
              name="name"
              type="text"
              placeholder="Seu nome"
              required
            />
          </div>
          <div className="form-input" data-reveal>
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              autoComplete="email"
              name="email"
              type="email"
              placeholder="Seu e-mail"
              required
            />
          </div>
          <div className="form-input" data-reveal>
            <label htmlFor="tel">WhatsApp *</label>
            <input
              id="tel"
              autoComplete="tel"
              name="tel"
              type="tel"
              inputMode="numeric"
              placeholder="(00) 00000-0000"
              onInput={(event) => { event.currentTarget.value = formatPhone(event.currentTarget.value); }}
              required
            />
          </div>
          <div className="form-input form-input--full" data-reveal>
            <button type="submit" className="btn btn--navy form-submit" disabled={isSend}>
              {isSend && <span className="form-spinner" aria-hidden="true" />}
              {isSend ? "Enviando..." : "Quero informações"}
            </button>
          </div>
          {/* Região sempre montada: o leitor de tela anuncia quando o texto muda. */}
          <p className="form-status" role="status" aria-live="polite">
            {feedback && (
              <span className={`form-status-message form-status-${feedback}`}>
                {FEEDBACK[feedback]}
              </span>
            )}
          </p>
        </form>
      </div>

      <div className="container-forms-right" data-reveal="right"></div>
    </div>
  );
};
