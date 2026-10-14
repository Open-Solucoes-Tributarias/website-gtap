"use client";

import dynamic from 'next/dynamic';
import ResponsiveImage from '../../../../components/ResponsiveImage/ResponsiveImage';
import "./SectionPalestrantes.css";
import { useState } from "react";
const ModalPalestrantes = dynamic(() => import('../../../../components/ModalPalestrante/ModalPalestrante').then((module) => module.ModalPalestrantes), { ssr: false });

export const SectionPalestrantes = ({ data }) => {
  const palestrantes = data.filter((item) => item.type === 0);
    const [palestranteSelecionado, setPalestranteSelecionado] = useState(null);

  const abrirModal = (palestrante) => setPalestranteSelecionado(palestrante);
  const fecharModal = () => setPalestranteSelecionado(null);

  return (
    <section className="section-palestrantes" id="palestrantes">
      <div className="section-palestrantes-header">
        <h3 data-reveal>Quem vai <b>conduzir as discussões</b></h3>
      </div>
      <div className="container-palestrantes">
        {palestrantes.map((palestrante) => (
          <button type="button"
            className="card-palestrantes"
            key={palestrante.id}
            data-reveal="scale"
            onClick={() => abrirModal(palestrante)}
          >
            {/* Máscara da foto: o zoom fica recortado aqui e o brilho do card pode sair da borda */}
            <span className="card-palestrantes-foto">
              <ResponsiveImage image={palestrante.image} src={palestrante.mediaUrl} alt="" sizes="(max-width: 768px) 45vw, 230px" loading="lazy" className="speaker-photo" />
            </span>
            <h6>{palestrante.title}</h6>
            <p>{palestrante.description}</p>
          </button>
        ))}
      </div>
      <p className="section-palestrantes-aviso" data-reveal>
        Aguarde a confirmação dos próximos palestrantes.
      </p>
       {palestranteSelecionado && (
          <ModalPalestrantes
          palestrantes={palestrantes}
          selecionado={palestranteSelecionado}
          onClose={fecharModal}
        />
      )}
    </section>
  );
};
