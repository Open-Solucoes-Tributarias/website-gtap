import "./SectionIdealizador.css";
import ImageAlexandre from "../../../../assets/alexandremarques.png";

export const SectionIdealizador = () => {
  return (
    <section className="section-idealizador">
      <div className="content-idealizador">
        <div>
          <h3>Idealizador</h3>
        </div>
        <div>
          <p>
            <b>Alexandre Marques Andrade Lemos</b> é um dos maiores
            especialistas em tributação do Brasil, com anos de experiência
            atuando como Tax Solution Provider (TSP). É CEO da Open Soluções
            Tributárias e autor dos livros Gestão Tributária de Contratos e
            Convênios e Tributação da Atividade de Saúde. Ele já ajudou centenas
            de profissionais a transformarem suas carreiras e negócios.
            <br /> <br />
            <b>Advogado tributarista e contabilista desde 1995</b>, com atuação
            em assessoria jurídica e consultoria para empresas e entidades
            públicas desde 2002. Pós-graduado em Advocacia Tributária e Direito
            Processual Civil.
            <br /> <br />
            Mais de <b>32 mil inscritos</b> no seu canal do YouTube e
            <b> 11 mil seguidores no Instagram</b>.
            <br /> <br />
            Criador da mentoria <b>Tributarista 7D</b>, onde compartilha seu
            conhecimento e metodologia comprovada para ajudar outros
            profissionais a alcançarem resultados extraordinários.
          </p>
        </div>
      </div>
      <div className="content-image-idealizador">
        <img src={ImageAlexandre} />
      </div>
    </section>
  );
};
