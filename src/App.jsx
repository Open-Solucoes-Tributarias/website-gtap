import { BrowserRouter, Routes, Route } from "react-router-dom";
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
