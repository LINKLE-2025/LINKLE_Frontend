import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import MapPage from "./pages/MapPage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignupPage";

import PostCreatePage from "./pages/PostCreatePage";
// import LoginPage from "./pages/auth/LoginPage";
// import SignupPage from "./pages/auth/SignupPage";
import AuthLayout from "./layouts/AuthLayout";
import SignupLayout from "./layouts/SignupLayout";
import PointPage from "./pages/pointPage";

const App = () => {
  return (
    <Routes>
      {/* 로그인 및 기본화면 레이아웃 */}
      <Route element={<AuthLayout />}>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={<LoginPage />} />
      </Route>

      {/* 회원가입 레이아웃 */}
      <Route element={<SignupLayout />}>
        <Route path='/signup' element={<SignUpPage />} />
      </Route>

      {/* 로그인 후 레이아웃 */}
      <Route path='/map' element={<MapPage />} />
      <Route path='/post' element={<PostCreatePage />} />
      <Route path='/point' element={<PointPage />} />
    </Routes>
  );
};

export default App;
