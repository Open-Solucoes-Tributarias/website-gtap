import { useEffect, useState, useRef } from "react";
import { NavbarMobile } from "../NavbarMobile/NavbarMobile";
import "./Navbar.css";

export const Navbar = ({ lightTemplate }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [renderNav, setRenderNav] = useState(true);
  const lastDirection = useRef(null);

  // Detecta se a tela é mobile
  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // Scroll para esconder/exibir navbar (somente desktop)
  useEffect(() => {
    if (!isMobile) {
      const handleScroll = (event) => {
        const delta = event.deltaY;
        const direction = delta > 0 ? "down" : "up";

        if (direction !== lastDirection.current) {
          lastDirection.current = direction;
          setRenderNav(direction !== "down");
        }
      };

      window.addEventListener("wheel", handleScroll);
      return () => window.removeEventListener("wheel", handleScroll);
    }
  }, [isMobile]);

  // Redirecionamento com hash
  const hrefRedirect = (id) => {
    window.location.href = `/#${id}`;
  };

  // Se for mobile, renderiza o componente separado
  if (isMobile) {
    return <NavbarMobile lightTemplate={lightTemplate} />;
  }

  // Versão desktop com renderNav
  return (
    <>
      {renderNav && (
        <header className={lightTemplate ? "navbar-light" : "navbar"}>
          <nav className="navbar-container" aria-label="Navegação principal">
            <h1 className="navbar-logo">
              <a href="/">
                {lightTemplate ? (
                  <img src="./logo.svg" alt="logo gtap" />
                ) : (
                  <img src="./logo-gtap.svg" alt="logo do site" />
                )}
              </a>
            </h1>
            <ul className="navbar-links">
              <li><a onClick={() => hrefRedirect("temas")}>TEMAS</a></li>
              <li><a onClick={() => hrefRedirect("palestrantes")}>PALESTRANTES</a></li>
              <li><a href="galeria">GALERIA</a></li>
              <li><a onClick={() => hrefRedirect("localizacao")}>LOCAL</a></li>
              {/* <li><a onClick={() => hrefRedirect("preços")}>PREÇOS</a></li> */}
              <li><a href="open-solucoes-tributarias">A OPEN</a></li>
              {/* <li><a onClick={() => hrefRedirect("contato")}>CONTATO</a></li> */}
            </ul>
          </nav>
        </header>
      )}
    </>
  );
};
