import "./Footer.css";

export const Footer = () => {
  return (
    <footer className="container-footer">
      <div className="content-logo">
        <p>Realização</p>
        <img src="./logoopen.svg" />
        <p className="adress-open">R. Frederico Simões, 125 - SL 401<br/>
Edf. Liz Empresarial  - Caminho das Árvores<br/>
Salvador/ BA <br/>CEP 41820-774</p>
      </div>
      <div className="content-text-footer">
        <p>
          Único congresso brasileiro focado na gestão tributária da
          Administração Pública e do Sistema S, o GTAP reúne especialistas de
          todo o país para discutir desafios atuais e apresentar soluções
          inovadoras. <br />
          <br />
          Em um ambiente inspirador, o evento impulsiona o intercâmbio de
          conhecimento e a busca contínua pela excelência na gestão tributária
          pública. <br />
          <br />
          Consolidado como referência nacional, o GTAP reforça a importância da
          atualização constante diante das rápidas transformações do setor.
        </p>
      </div>
      <div className="content-menu-footer">
        <ul>
          <a href="#inicio">
            <p>GTAP IX</p>
          </a>
          <a href="#temas">
            <li>Temas</li>
          </a>
          <a href="#palestrantes">
            <li>Palestrantes</li>
          </a>
           <a href="galeria">
            <li>Galeria</li>
          </a>
          <a href="#preços">
            <li>Preços</li>
          </a>
         <a href="open-solucoes-tributarias" target="_blank" rel="noopener noreferrer">
            <li>A Open</li>
          </a>
          <a href="#contato">
            <li>Contato</li>
          </a>
        </ul>
      </div>
    </footer>
  );
};
