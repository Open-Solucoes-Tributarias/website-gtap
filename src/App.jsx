import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/landingPage/LandingPage";
import { AdminLoginPage } from "./pages/login/AdminLoginPage";
import { OpenPage } from "./pages/open/openPage";
import { GaleriaPage } from "./pages/galeria/GaleriaPage";
import { GaleriaEdition } from "./pages/galeria/galeriaEdition/GaleriaEdition";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <>
          <Route
            path="/"
            element={
              <>
                <LandingPage />
              </>
            }
          />
          <Route path="open-solucoes-tributarias" element={<OpenPage />} />
          <Route path="galeria" element={<GaleriaPage />} />
          {/* Passo no parametro o evento clicado no card */}
          <Route path=":editionText" element={<GaleriaEdition />} />
          <Route path="admin" element={<AdminLoginPage />} />
        </>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
