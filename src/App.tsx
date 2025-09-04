import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import MapPage from "./pages/MapPage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignupPage";

import ProfilePage from "@/pages/Profile/ProfilePage";
import ProfileEditPage from "@/pages/Profile/ProfileEditPage";
import FriendListPage from "@/pages/friend/FriendsListPage";
import FriendRequestsPage from "@/pages/friend/FriendRequestsPage";

import PostCreatePage from "./pages/PostCreatePage";
// import LoginPage from "./pages/auth/LoginPage";
// import SignupPage from "./pages/auth/SignupPage";
import AuthLayout from "./layouts/AuthLayout";
import SignupLayout from "./layouts/SignupLayout";
import ProfileLayout from "./layouts/ProfileLayout";
import FriendListLayout from "./layouts/FriendListLayout";



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

      {/* 프로필 관련 레이아웃 */}
      <Route element={<ProfileLayout />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profileEdit" element={<ProfileEditPage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
      </Route>

      {/* 친구 목록 관련 레이아웃 */}
      <Route element={<FriendListLayout />}>
        <Route path="/friend" element={<FriendListPage />} />
        <Route path="/received" element={<FriendRequestsPage />} />
      </Route>

    </Routes>
  );
};

export default App;
