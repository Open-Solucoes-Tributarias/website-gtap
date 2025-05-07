import { FloatingWhatsApp } from "react-floating-whatsapp";
import { LandingPage } from "./pages/landingPage/LandingPage";

function App() {
  return (
    <>
      <FloatingWhatsApp
        phoneNumber="557193852662"
        accountName="Open Soluções Tribuárias"
        avatar="./icon-gtap.svg"
        statusMessage="online"
        chatMessage="Descreva sua solicitação para os nossos consultores de vendas"
        placeholder="Descrever solicitação"
      />
      <LandingPage />
    </>
  );
}

export default App;
