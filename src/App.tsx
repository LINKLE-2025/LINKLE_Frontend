// src/App.tsx
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import MapPage from "./pages/MapPage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignupPage";
import PostCreatePage from "./pages/PostCreatePage";
// import LoginPage from "./pages/auth/LoginPage";
// import SignupPage from "./pages/auth/SignupPage";

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/signup' element={<SignUpPage />} />
      <Route path='/map' element={<MapPage />} />
      <Route path='/post' element={<PostCreatePage />} />
    </Routes>
  );
};

export default App;
