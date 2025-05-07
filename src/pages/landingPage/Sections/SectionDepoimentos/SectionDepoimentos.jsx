import { useState, useEffect } from "react";
import "./SectionDepoimentos.css";

export const SectionDepoimentos = () => {
  const [depoimentos, setDepoimentos] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/depoimentos.json`)
      .then((res) => res.json())
      .then(setDepoimentos)
      .catch((err) => console.error("Erro ao carregar depoimentos", err));
  }, []);

  return (
    <section className="section-depoimentos">
      <div>
        <h3>
          Veja o que <b>nosso público</b> fala sobre o GTAP
        </h3>
      </div>
      <div>
        {depoimentos.map((depoimento, index) => (
          <div key={depoimento.id}>
            {index % 2 === 0 ? (
              <div className="container-depoimentos">
                <div className="content-video-depoimentos">
                  <iframe
                    src={depoimento.videoUrl}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <div className="content-depoimento-descricao">
                  <h6>{depoimento.title}</h6>
                  <p>{depoimento.description}</p>
                </div>
              </div>
            ) : (
              <div className="container-depoimentos-second">
                <div
                  className="content-depoimento-descricao"
                  style={{ textAlign: "right" }}
                >
                  <h6>{depoimento.title}</h6>
                  <p>{depoimento.description}</p>
                </div>
                <div className="content-video-depoimentos">
                  <iframe
                    src={depoimento.videoUrl}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="content-mais-depoimentos">
        <a>
          <p>Veja todos os nossos depoimentos</p>
        </a>
        <i className="fa-solid fa-arrow-right"></i>
      </div>
    </section>
  );
};
