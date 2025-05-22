import "./GaleriaPage.css"
import { Navbar } from "../../components/Navbar/Navbar";

const images = [{
    id: 0,
    url: "https://static.wixstatic.com/media/1b1ecf_534c5b7ae1834b0e88eb408345c521c2.jpg/v1/fill/w_260,h_146,fp_0.50_0.50,q_90,enc_auto/1b1ecf_534c5b7ae1834b0e88eb408345c521c2.webp",
    text: "I GTAP",
}, {
    id: 1,
    url: "https://static.wixstatic.com/media/1b1ecf_534c5b7ae1834b0e88eb408345c521c2.jpg/v1/fill/w_260,h_146,fp_0.50_0.50,q_90,enc_auto/1b1ecf_534c5b7ae1834b0e88eb408345c521c2.webp",
    text: "II GTAP",
}]

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
                            style={{
                                backgroundImage: `url(${image.url})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                width: '260px',
                                height: '146px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'center',
                                color: '#fff',
                                padding: '10px',
                            }}
                        >
                            <p>{image.text}</p>
                        </div>
                    ))}
                </div>
            </section>

        </>
    )
}