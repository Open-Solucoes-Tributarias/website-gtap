import "./SectionPublico.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const sliderSettings = {
  dots: false,
  infinite: true,
  speed: 5000,
  slidesToShow: 7,
  slidesToScroll: 7,
  rows: 2,
  autoplay: true,
  autoplaySpeed: 0,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 5,
        rows: 2
      }
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 4,
        rows: 2
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 3,
        rows: 2
      }
    }
  ]
};


export const SectionPublico = ({ data }) => {
  const clientes = data.filter((cliente) => cliente.type === 2);


  return (
    <section className="section-publico">
      <div>
        <h3>Grandes entidades públicas marcaram presença.</h3>
      </div>
      <div>
        <h5>
          Evento reuniu representantes de destaque para discutir soluções
          inovadoras e fortalecer parcerias institucionais.
        </h5>
      </div>

      {/* Carrossel com duas linhas */}
      <div className="container-publico">
        <Slider {...sliderSettings}>
          {clientes.map((cliente) => (
            <div key={cliente.id} className="card-publico">
              <img src={cliente.mediaUrl} alt={`Cliente ${cliente?.title}`} />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};
