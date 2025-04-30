import React from "react";
import "./Navbar.css";

export const Navbar = () => {
  return (
    <header className="navbar">
      <nav className="navbar-container" aria-label="Navegação principal">
        <h1 className="navbar-logo">
          <a href="">
            <img src="/logo.svg" alt="logo do site" />
          </a>
        </h1>
        <ul className="navbar-links">
          <li>
            <a href="/">INÍCIO</a>
          </li>
          <li>
            <a href="/sobre">GALERIA</a>
          </li>
          <li>
            <a href="/contato">CONTATO</a>
          </li>
          <li>
            <a href="/open">A OPEN</a>
          </li>
        </ul>
      </nav>
    </header>
  );
};
