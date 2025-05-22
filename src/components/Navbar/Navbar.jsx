import { useEffect, useState, useRef } from "react";
import "./Navbar.css";

export const Navbar = ({ lightTemplate }) => {

  const [renderNav, setRenderNav] = useState(true);
  const lastDirection = useRef(null); // 'up' ou 'down' add para cehcar e não dar loop de event listener 

  useEffect(() => {
    const handleScroll = (event) => {
      const delta = event.deltaY;
      const direction = delta > 0 ? "down" : "up";

      if (direction !== lastDirection.current) {
        lastDirection.current = direction;

        if (direction === "down") {
          setRenderNav(false);
        } else {
          setRenderNav(true);
        }
      }
    };

    window.addEventListener("wheel", handleScroll);
    return () => window.removeEventListener("wheel", handleScroll);
  }, []);

  return (
    <>
      {renderNav && (
        <header className={lightTemplate ? "navbar-light" : "navbar"}>
          <nav className="navbar-container" aria-label="Navegação principal">
            <h1 className="navbar-logo">
              <a href="/">
                {lightTemplate ? <img src="./logo.svg" alt="logo gtap"/> : <img src="./logo-gtap.svg" alt="logo do site" />}
              </a>
            </h1>
            <ul className="navbar-links">
              <li>
                <a href="#temas">TEMAS</a>
              </li>
              <li>
                <a href="#palestrantes">PALESTRANTES</a>
              </li>
              <li>
                <a href="#galeria">GALERIA</a>
              </li>
              <li>
                <a href="#preços">PREÇOS</a>
              </li>
              <li>
                <a
                  href="open-solucoes-tributarias"
                  // target="_blank"
                  // rel="noopener noreferrer"
                >
                  A OPEN
                </a>
              </li>
              <li>
                <a href="#contato">CONTATO</a>
              </li>
            </ul>
          </nav>
        </header>
      )
      }
    </>
  );
};
