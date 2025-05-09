import "./Navbar.css";

export const Navbar = () => {
  return (
    <header className="navbar">
      <nav className="navbar-container" aria-label="Navegação principal">
        <h1 className="navbar-logo">
          <a href="">
            <img src="./logo-gtap.svg" alt="logo do site" />
          </a>
        </h1>
        <ul className="navbar-links">
          <li>
            <a href="#temas">TEMAS</a>
          </li>
          <li>
            <a href="#temas">PALESTRANTES</a>
          </li>

          <li>
            <a href="#galeria">GALERIA</a>
          </li>
          <li>
            <a href="#temas">PREÇOS</a>
          </li>
          <li>
            <a href="#temas">A OPEN</a>
          </li>
          <li>
            <a href="#contato">CONTATO</a>
          </li>
        </ul>
      </nav>
    </header>
  );
};
