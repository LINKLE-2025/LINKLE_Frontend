import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import MapPage from "./pages/MapPage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignupPage";
import PostCreatePage from "./pages/PostCreatePage";
import AuthLayout from "./layouts/AuthLayout";
import SignupLayout from "./layouts/SignupLayout";
import PointPage from "./pages/pointPage";

const App = () => {
  return (
    <Routes>
      {/* 로그인 및 회원가입 레이아웃 */}
      <Route element={<AuthLayout />}>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignUpPage />} />
      </Route>

      {/* 어플리케이션 레이아웃 */}
      <Route path='/map' element={<MapPage />} />
      <Route path='/post' element={<PostCreatePage />} />
      <Route path='/point' element={<PointPage />} />
    </Routes>
  );
};

export default App;
