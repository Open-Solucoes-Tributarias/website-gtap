import { useEffect, useState } from "react";
import "./SectionOpen.css"
import globoOPen from "@/assets/globo-open.svg";

//imagens da seção
import image1 from "@/assets/open/image-escritorio.jpg"
import image2 from "@/assets/open/image-alexandre.png"
import image3 from "@/assets/open/image-equipe.jpg"
import image4 from "@/assets/open/image-apresentacao.jpg"
import image5 from "@/assets/open/image-debate.jpg"
import image6 from "@/assets/open/image-livro.png"

const textsTitles = [
    { id: 0, value: "Segurança Financeira" },
    { id: 1, value: "Solidez Fiscal" },
    { id: 1, value: "Estratégia Fiscal" },
    { id: 1, value: "Conformidade" },
    { id: 1, value: "Resultados" },
    { id: 1, value: "Economia inteligente" },
];

export const SectionOpen = () => {


    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayText, setDisplayText] = useState("&nbsp;");
    const texts = textsTitles.map((t) => t.value);

 useEffect(() => {
    let charIndex = -1;
    const fullText = texts[currentIndex];
    setDisplayText("");

    const typingInterval = setInterval(() => {
        charIndex++;
        if (charIndex < fullText.length) {
            setDisplayText((prev) => prev + fullText[charIndex]);
        } else {
            clearInterval(typingInterval);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % texts.length);
            }, 1500);
        }
    }, 100);

    return () => clearInterval(typingInterval);
}, [currentIndex]);




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
                        tributário é <br /><b className="typing-js">{displayText}</b></h2>
                </div>
                <div>
                    <button><img src={globoOPen} alt="globo open" />Saiba mais!</button>
                </div>
                <div className="stars-content-open">
                    <i className="fa-solid fa-star" style={{ color: "#dda92e" }}></i>
                    <i className="fa-solid fa-star" style={{ color: "#dda92e" }}></i>
                    <i className="fa-solid fa-star" style={{ color: "#dda92e" }}></i>
                    <i className="fa-solid fa-star" style={{ color: "#dda92e" }}></i>
                    <i className="fa-solid fa-star" style={{ color: "#dda92e" }}></i>
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