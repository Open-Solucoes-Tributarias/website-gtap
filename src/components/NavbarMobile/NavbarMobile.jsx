import { useState } from "react";
import "./NavbarMobile.css";

export const NavbarMobile = ({ lightTemplate }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    const hrefRedirect = (id) => {
        setMenuOpen(false);
        window.location.href = `/#${id}`;
    };

    return (
        <header className={lightTemplate ? "navbar-light" : "navbar"}>
            <nav className="navbar-container" aria-label="Navegação principal">
                <div className="navbar-header">
                    <h1 className="navbar-logo">
                        <a href="/">
                            {lightTemplate ? (
                                <img src="./logo.svg" alt="logo gtap" loading='' />
                            ) : (
                                <img src="./logo-gtap.svg" alt="logo do site" />
                            )}
                        </a>
                    </h1>
                    <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                        <i className="fa-solid fa-bars"></i>
                    </div>
                </div>
            </nav>

            {menuOpen && (
                <div className="navbar-dialog" onClick={() => setMenuOpen(false)}>
                    <ul className="navbar-dialog-content" onClick={(e) => e.stopPropagation()}>
                        <li onClick={() => hrefRedirect("temas")}><img alt="icon" src="/assets/icons/bookicon.svg"/><a onClick={() => hrefRedirect("temas")}>Temas</a></li>
                        <li><img alt="icon" src="/assets/icons/peopleicon.svg"/><a onClick={() => hrefRedirect("palestrantes")}>Palestrantes</a></li>
                        <li><img alt="icon" src="/assets/icons/photoicon.svg"/><a href="galeria">Galeria</a></li>
                        <li><img alt="icon" src="/assets/icons/contacticon.svg"/><a onClick={() => hrefRedirect("contato")}>Localização</a></li>
                        {/* <li><img alt="icon" src="/assets/icons/caricon.svg"/><a onClick={() => hrefRedirect("preços")}>Preços</a></li> */}
                        <li><img alt="icon" src="/assets/icons/openmini.svg"/><a href="open-solucoes-tributarias">A Open</a></li>
                        {/* <li><img alt="icon" src="/assets/icons/contacticon.svg"/><a onClick={() => hrefRedirect("contato")}>Contato</a></li> */}
                    </ul>
                </div>
            )}
        </header>

    );
};
