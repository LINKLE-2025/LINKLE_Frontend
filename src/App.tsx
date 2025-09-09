import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import MapPage from "./pages/MapPage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignupPage";

import PostCreatePage from "./pages/post/PostCreatePage";
import ProfilePage from "@/pages/Profile/ProfilePage";
import ProfileEditPage from "@/pages/Profile/ProfileEditPage";
import FriendListPage from "@/pages/friend/FriendsListPage";
import FriendRequestsPage from "@/pages/friend/FriendRequestsPage";
import FriendSearchPage from "@/pages/friendSearch/FriendSearchPage";
import AuthLayout from "./layouts/AuthLayout";

import ProfileLayout from "./layouts/ProfileLayout";
import FriendListLayout from "./layouts/FriendListLayout";

import ChatRoomPage from "./pages/chat/ChatRoomPage";
import ChatListPage from "./pages/chat/ChatListPage";
import RoomCreatePage from "./pages/chat/RoomCreatePage";

import PointPage from "./pages/pointPage";
import AppLayout from "./layouts/AppLayout";
import PostDetailPage from "./pages/post/PostDetailPage";
import LinkerDetail from "./components/linker/LinkerDetailModal";

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
      <Route element={<AppLayout />}>
        <Route path='/map' element={<MapPage />} />
        <Route path='/post' element={<PostCreatePage />} />
        <Route path='/post/:postId' element={<PostDetailPage />} />
      </Route>
      {/* 프로필 관련 레이아웃 */}
      <Route element={<ProfileLayout />}>
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/profileEdit' element={<ProfileEditPage />} />
        <Route path='/profileEdit/:userId' element={<ProfileEditPage />} />
      </Route>

      {/* 친구 목록 관련 레이아웃 */}
      <Route element={<FriendListLayout />}>
        <Route path='/friend' element={<FriendListPage />} />
        <Route path='/received' element={<FriendRequestsPage />} />
      </Route>

      <Route element={<FriendListLayout />}>
        <Route path='/search' element={<FriendSearchPage />} />
      </Route>

      {/* 채팅 관련 레이아웃 */}
      <Route element={<AppLayout />}>
        <Route path='/chat' element={<ChatListPage />} />
        <Route path='/chat/room/:roomId' element={<ChatRoomPage />} />
        <Route path='/chat/room/create' element={<RoomCreatePage />} />
      </Route>

      <Route path='/point' element={<PointPage />} />
      <Route path='/post/:postId' element={<PostDetailPage />} />
    </Routes>
  );
};

export default App;
