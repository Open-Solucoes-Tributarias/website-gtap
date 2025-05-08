import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FloatingWhatsApp } from "react-floating-whatsapp";
import { LandingPage } from "./pages/landingPage/LandingPage";
import { AdminLoginPage } from "./pages/login/AdminLoginPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <>
          <Route
            path="/website-gtap"
            element={
              <>
                <LandingPage />
                <FloatingWhatsApp
                  phoneNumber="557193852662"
                  accountName="Open Soluções Tribuárias"
                  avatar="./icon-gtap.svg"
                  statusMessage="online"
                  chatMessage="Descreva sua solicitação para os nossos consultores de vendas"
                  placeholder="Descrever solicitação"
                />
              </>
            }
          />
          <Route path="/website-gtap/admin" element={<AdminLoginPage />} />
        </>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
