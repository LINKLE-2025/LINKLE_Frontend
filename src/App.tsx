import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
// import LoginPage from "./pages/auth/LoginPage";
// import SignupPage from "./pages/auth/SignupPage";

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
      {/* <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} /> */}
    </Routes>
  );
};

export default App;
