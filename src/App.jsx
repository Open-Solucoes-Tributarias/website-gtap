import { FloatingWhatsApp } from "react-floating-whatsapp";
import { LandingPage } from "./pages/landingPage/LandingPage";

function App() {
  return (
    <>
      <FloatingWhatsApp phoneNumber="557193852662" accountName="Open Soluções Tribuárias" />
      <LandingPage />
    </>
  );
}

export default App;
