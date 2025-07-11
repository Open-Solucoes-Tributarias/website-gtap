import "./GaleriaPage.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { useNavigate } from "react-router-dom";

const images = [
    {
        id: 0,
        url: "https://gtap.com.br/midias/cards/gtap%20i.webp",
        text: "I GTAP",
    },
    {
        id: 1,
        url: "https://gtap.com.br/midias/cards/gtap%20ii.webp",
        text: "II GTAP",
    },
    {
        id: 2,
        url: "https://gtap.com.br/midias/cards/gtap%20iii.webp",
        text: "III GTAP",
    },
    {
        id: 3,
        url: "https://gtap.com.br/midias/cards/gtap%20iv.webp",
        text: "IV GTAP",
    },
    {
        id: 4,
        url: "https://gtap.com.br/midias/cards/gtap%20v.webp",
        text: "V GTAP",
    },
    {
        id: 5,
        url: "https://gtap.com.br/midias/cards/gtap%20vi.webp",
        text: "VI GTAP",
    },
    {
        id: 6,
        url: "https://gtap.com.br/midias/cards/gtap%20vii.webp",
        text: "VII GTAP",
    },
    {
        id: 7,
        url: "https://gtap.com.br/midias/cards/gtap%20viii.webp",
        text: "VIII GTAP",
    }
];


export const GaleriaPage = () => {

    const navigate = useNavigate();

    const handleSelected = (card) => { //capturo as informações da edição selecionada e coloco na URL
        navigate(`/${encodeURIComponent(card?.text)}`);
    };

    return (
        <>
            <Navbar />
            <section className="container-banner-galeria">
                <div className="content-text-galeria-banner">
                    <div className="div-text-galeria">
                        <h5>VIII GTAP</h5>
                        <p>A melhor edição de todos os tempos</p>
                    </div>
                    <div className="div-button-galeria-banner">
                        <button onClick={() => {
                            window.location.href = "/VIII%20GTAP";
                        }}>Acessar álbum completo</button>
                    </div>
                </div>
            </section>
            <section className="container-card-gtaps">
                <h3>Confira as fotos das edições passadas</h3>
                <div className="content-card-gtaps">
                    {images.slice().reverse().map((image) => (
                        <div
                            className="card-gtap"
                            key={image.id}
                            style={{backgroundImage: `url(${image.url})`}}
                            onClick={() => handleSelected(image)}
                        >
                            <p>{image.text}</p>
                        </div>
                    ))}
                </div>
            </section>
            <Footer />
        </>
    )
}