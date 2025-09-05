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
import AuthLayout from "./layouts/AuthLayout";

import ProfileLayout from "./layouts/ProfileLayout";
import FriendListLayout from "./layouts/FriendListLayout";

import ChatLayout from "./layouts/ChatLayout";
import ChatRoom from "./pages/chat/ChatRoom";
//import ChatPage from "./pages/chat/ChatPage";

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

      {/* 프로필 관련 레이아웃 */}
      <Route element={<ProfileLayout />}>
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/profileEdit' element={<ProfileEditPage />} />
        <Route path='/profile/:userId' element={<ProfilePage />} />
      </Route>

      {/* 친구 목록 관련 레이아웃 */}
      <Route element={<FriendListLayout />}>
        <Route path='/friend' element={<FriendListPage />} />
        <Route path='/received' element={<FriendRequestsPage />} />
      </Route>

      {/* 채팅 관련 레이아웃 */}
      <Route element={<ChatLayout />}>
        {/* <Route path='/chat' element={<ChatPage />} /> */}
        <Route path='/chat/room/:roomId' element={<ChatRoom />} />
      </Route>

      <Route path='/point' element={<PointPage />} />
    </Routes>
  );
};

export default App;
