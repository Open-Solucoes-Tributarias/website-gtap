import React from "react";
import "./Navbar.css";

export const Navbar = () => {
  return (
    <header className="navbar">
      <nav className="navbar-container" aria-label="Navegação principal">
        <h1 className="navbar-logo">
          <a href="">
            <img src="./logo.svg" alt="logo do site" />
          </a>
        </h1>
        <ul className="navbar-links">
          <li>
            <a href="#temas">TEMAS</a>
          </li>
          <li>
            <a href="#galeria">GALERIA</a>
          </li>
          <li>
            <a href="#contato">CONTATO</a>
          </li>
          <li>
            <a href="https://opentreinamentos.com.br">A OPEN</a>
          </li>
        </ul>
        <button className="button">
          <i
            className="fa-regular fa-file-lines"
            style={{ color: "#ffffff" }}
          ></i>
          Inscrição
        </button>
      </nav>
    </header>
  );
};
