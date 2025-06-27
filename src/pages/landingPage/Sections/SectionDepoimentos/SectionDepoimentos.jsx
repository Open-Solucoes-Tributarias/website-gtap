import { useRef } from "react";
import "./SectionDepoimentos.css";

export const SectionDepoimentos = ({ data }) => {
  const depoimentos = data.filter((d) => d.type === 3);
  const sliderRef = useRef(null);

const cardWidth = 330; // 300px width + 30px margin
const cardsPerSlide = 1;
const slideSize = cardWidth * cardsPerSlide;

const scrollLeft = () => {
  sliderRef.current.scrollBy({ left: -slideSize, behavior: "smooth" });
};

const scrollRight = () => {
  sliderRef.current.scrollBy({ left: slideSize, behavior: "smooth" });
};

  return (
    <section className="section-depoimentos">
       <div>
        <h3>Depoimentos</h3>
        <h4>
          Veja o que <b>nosso público</b> fala sobre o GTAP
        </h4>
      </div> 

      <div className="slider-wrapper">
        <i
          className="fa-solid fa-chevron-left"
          style={{ color: "#dda92e", fontSize: "30px", cursor: 'pointer' }}
          onClick={scrollLeft}
        />

        <div className="slider" ref={sliderRef}>
          {depoimentos.map((depoimento, index) => (
            <div className="depoimento-card" key={depoimento.id}  style={index % 2 !== 0 ? { marginTop: "30px" } : {}}>
              <div className="video-container">
                <iframe
                  src={`${depoimento.mediaUrl}?autoplay=0`}
                  title={depoimento.title}
                  frameBorder="0"
                  allow="encrypted-media; picture-in-picture"
                  allowFullScreen
                  width='300px'
                  height='auto'
                  style={{ borderRadius: '10px' }}
                />
              </div>
              <h6>{depoimento.title}</h6>
              <p>{depoimento.description}</p>
              <p>{depoimento.annotation}</p>
            </div>
          ))}
        </div>
        <i class="fa-solid fa-chevron-right" style={{ color: "#dda92e", cursor: 'pointer', fontSize: "30px" }} onClick={scrollRight}></i>
      </div>
    </section>
  );
};
