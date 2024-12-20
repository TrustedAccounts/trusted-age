import React from "react";
import "./App.scss";
import { Header } from "./components/shared/Header/Header";
import { Footer } from "./components/shared/Footer/Footer";
import { VerificationSteps } from "./pages/VerificationSteps/VerificationSteps";
import { Route, Routes } from "react-router-dom";
import { AdminRoutes } from "./models/user.model";
import { Admin } from "./pages/Admin/Admin";

function App() {
  return (
    <div className="App">
      <Header />

      <Routes>
        <Route path={AdminRoutes.ADMIN} element={<Admin />} />
        <Route path="*" element={<VerificationSteps />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
