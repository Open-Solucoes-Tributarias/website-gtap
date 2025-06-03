import "./SectionDepoimentos.css";

export const SectionDepoimentos = ({ data }) => {
  const depoimentos = data.filter((depoimento) => depoimento.type === 3);

  return (
    <section className="section-depoimentos">
      <div className="text-container-depoimento">
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
                    src={`${depoimento.mediaUrl}?autoplay=0&muted=1`}
                    title="vimeo"
                    frameBorder="0"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
                <div className="content-video-depoimentos-second">
                  <iframe
                    src={`${depoimento.mediaUrl}?autoplay=0&muted=1`}
                    title="vimeo"
                    frameBorder="0"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
