import "./CarouselEmpresas.css"
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// confiuração da lib de slide carossel
const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 8,
    slidesToScroll: 2,
    autoplay: true,
    autoplaySpeed: 2000,
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 4,
            }
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 3,
            }
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 2,
            }
        }
    ]
};


export const CarouselEmpresas = ({clientes}) => {
    return (
        <section className="container-empresas-open-slide">
            <div className="section-empresas-open">
                <Slider {...sliderSettings}>
                    {clientes.map((cliente) => (
                        <div key={cliente.id} className="logo-slide">
                            <img src={cliente.mediaUrl} alt={`Cliente ${cliente?.title}`} />
                        </div>
                    ))}
                </Slider>
            </div>
        </section>
    )
}