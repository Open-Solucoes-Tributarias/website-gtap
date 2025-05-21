import "./SectionOpen.css"
import globoOPen from "@/assets/globo-open.svg";

//imagens da seção
import image1 from "@/assets/open/image-escritorio.jpg"
import image2 from "@/assets/open/image-alexandre.png"
import image3 from "@/assets/open/image-equipe.jpg"
import image4 from "@/assets/open/image-apresentacao.jpg"
import image5 from "@/assets/open/image-debate.jpg"
import image6 from "@/assets/open/image-livro.png"


export const SectionOpen = () => {
    return (
        <section className="section-sobre-open">
            <div className="section-left-open">
                <div className="tag-open-page">
                    <p>A mais de <b>17 anos</b> fazendo a <b>diferença</b> no setor tributário!</p>
                </div>
                <div className="src-page-open">
                    <p>
                            Home&nbsp;&gt;&gt;&nbsp;<b>A Open</b>
                    </p>
                </div>
                <div className="title-open-section">
                    <h2>Conhecimento
                        tributário é <b>Segurança Financeira</b></h2>
                </div>
                <div>
                    <button><img src={globoOPen} alt="globo open" />Saiba mais!</button>
                </div>
                <div className="stars-content-open">
                    <i class="fa-solid fa-star" style={{ color: "#dda92e" }}></i>
                    <i class="fa-solid fa-star" style={{ color: "#dda92e" }}></i>
                    <i class="fa-solid fa-star" style={{ color: "#dda92e" }}></i>
                    <i class="fa-solid fa-star" style={{ color: "#dda92e" }}></i>
                    <i class="fa-solid fa-star" style={{ color: "#dda92e" }}></i>
                </div>
                <div className="content-data-open">
                    <h3><b>+20 mil</b> alunos treinados!</h3>
                    <h3><b>+1000</b> empresas e entidades públicas atendidas!</h3>
                </div>
            </div>
            <div className="section-right-open">
                <img src={image1} alt="Imagem 1" className="img-open-gallery img1" />
                <img src={image2} alt="Imagem 2" className="img-open-gallery img2" />
                <img src={image3} alt="Imagem 3" className="img-open-gallery img3" />
                <img src={image4} alt="Imagem 4" className="img-open-gallery img4" />
                <img src={image5} alt="Imagem 5" className="img-open-gallery img5" />
                <img src={image6} alt="Imagem 6" className="img-open-gallery img6" />
            </div>
            <div className="section-empresas-open">
                <p>teste</p>
            </div>
        </section>
    )
}