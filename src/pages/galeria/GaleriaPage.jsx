import "./GaleriaPage.css"
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";

const images = [
    {
        id: 0,
        url: "https://pzbntescgueoxaynlzoa.supabase.co/storage/v1/object/public/medias/midias/cards%20Gtaps/gtap%20i.jpg",
        text: "I GTAP",
    },
    {
        id: 1,
        url: "https://pzbntescgueoxaynlzoa.supabase.co/storage/v1/object/public/medias/midias/cards%20Gtaps/gtap%20ii.jpg",
        text: "II GTAP",
    },
    {
        id: 2,
        url: "https://pzbntescgueoxaynlzoa.supabase.co/storage/v1/object/public/medias/midias/cards%20Gtaps/gtap%20iii.jpg",
        text: "III GTAP",
    },
    {
        id: 3,
        url: "https://pzbntescgueoxaynlzoa.supabase.co/storage/v1/object/public/medias/midias/cards%20Gtaps/gtap%20iv.jpg",
        text: "IV GTAP",
    },
    {
        id: 4,
        url: "https://pzbntescgueoxaynlzoa.supabase.co/storage/v1/object/public/medias/midias/cards%20Gtaps/gtap%20v.jpg",
        text: "V GTAP",
    },
    {
        id: 5,
        url: "https://pzbntescgueoxaynlzoa.supabase.co/storage/v1/object/public/medias/midias/cards%20Gtaps/gtap%20vi.jpg",
        text: "VI GTAP",
    },
    {
        id: 6,
        url: "https://pzbntescgueoxaynlzoa.supabase.co/storage/v1/object/public/medias/midias/cards%20Gtaps/gtap%20vii.jpg",
        text: "VII GTAP",
    },
    {
        id: 7,
        url: "https://pzbntescgueoxaynlzoa.supabase.co/storage/v1/object/public/medias/midias/cards%20Gtaps/gtap%20viii.jpg",
        text: "VIII GTAP",
    }
];


export const GaleriaPage = () => {


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
                        <button>Acesse o álbum completo</button>
                    </div>
                </div>
            </section>
            <section className="container-card-gtaps">
                <h3>Confira as fotos das edições passadas</h3>
                <div className="content-card-gtaps">
                    {images.map((image) => (
                        <div
                            className="card-gtap"
                            key={image.id}
                            style={{backgroundImage: `url(${image.url})`}}
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