import "./SectionAbout.css";

export const SectionAbout = () => {
    return (
        <section className="about-section-open">
            <h4>Quem Somos</h4>
            <div className="container-sections-open">
                <div className="content-about-open"><p>A Open Soluções Tributárias é uma iniciativa empresarial
                    cujo objetivo é oferecer uma <b>variedade de produtos</b> que atendem de forma <b>ampla e definitiva</b> os seus clientes.<br /><br />A atuação da Open Soluções
                    Tributárias vai desde <b>consultoria personalizada</b> até <b>treinamentos </b>(presencial e online), <b>edição de livros</b> (acesse nossa livraria virtual) e <b>desenvolvimento do Sistema Web Gestão Tributária</b>, a ferramenta mais completa do mercado para gerir as obrigações relacionadas às principais retenções tributárias na fonte (INSS, IRRF, CSLL, PIS/Pasep, Cofins e ISS).</p></div>
                <div className="content-logo-about"><img src="./Logo-open.svg" /></div>
            </div>
            <div className="video-about-container">
                <h5>Para um <b>mar de inseguranças</b>, temos uma <b>solução firme</b>.</h5>
                <video width="100%" controls >
                    <source
                        src="https://olive-hare-560073.hostingersite.com/midias/apresentacao.mp4"
                        type="video/mp4"
                    />.
                </video>
            </div>
            <div className="text-about-solutions">
                <p>Não é por outra razão que a Open possui mais de <b>1.000 clientes</b> de todos os Estados brasileiros, dentre os quais há <b>grandes empresas privadas e estatais</b>, além de <b>órgãos públicos de todos os níveis de governo e de todos os Poderes</b> (Executivo, Legislativo e Judiciário) que referendam os serviços desenvolvidos nas diversas vertentes apresentadas. </p>
                <br />
                <p>Prazer, somos <b>a Open</b>. 💙 </p>
            </div>
        </section>
    )
}