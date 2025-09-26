import { Routes, Route } from "react-router-dom";

import MapPage from "./pages/MapPage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignupPage";

import PostCreatePage from "./pages/post/PostCreatePage";
import ProfilePage from "@/pages/Profile/ProfilePage";
import ProfileEditPage from "@/pages/Profile/ProfileEditPage";
import FriendListPage from "@/pages/friend/FriendsListPage";
import FriendRequestsPage from "@/pages/friend/FriendRequestsPage";
import FriendSearchPage from "@/pages/friendSearch/TotalSearchPage";
import AuthLayout from "./layouts/AuthLayout";

import ProfileLayout from "./layouts/ProfileLayout";

import ChatRoomPage from "./pages/chat/ChatRoomPage";
import ChatListPage from "./pages/chat/ChatListPage";
import RoomCreatePage from "./pages/chat/RoomCreatePage";
import RequireRoomAccess from "@/routes/RequireRoomAccess";
import RoomPreviewGate from "@/routes/RoomPreviewGate";

import AppLayout from "./layouts/AppLayout";
import PostDetailPage from "./pages/post/PostDetailPage";
import useFocusRefresh from "./hooks/useFocusRefresh";
import LandingRedirect from "./pages/LandingRedirect";
import ErrorPage from "./pages/ErrorPage";
import PasswordResetPage from "./pages/auth/PasswordResetPage";

import TestAPI from "./components/recommend/recommend";
import FriendListLayout from "./layouts/FriendListLayout";
import AccountPage from "./pages/account/AccountPage";
import AccountEditPage from "./pages/account/AccountEditPage";
import AccountLayout from "./layouts/AccountLayout";

import ChatLayout from "./layouts/ChatLayout";
import useStomp from "./hooks/useStomp";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import ProtectedLayout from "./layouts/ProtectedLayout";
import BalancePage from "./pages/pay/BalancePage";
import PayRedirectPage from "./pages/pay/PayRedirectPage";
import useRoomUpdates from "./hooks/useRoomUpdates";

export default function App() {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useFocusRefresh();  // 포커스 복귀 시 토큰 갱신
  useStomp();         // STOMP 연결 초기화
  useRoomUpdates();   // 전역 room-updates 구독

  // 전역 사용자 상태 설정 : 앱 로드 시 한 번만 /auth/me 호출 
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <Routes>
      {/* 로그인 및 회원가입 레이아웃 */}
      <Route element={<AuthLayout />}>
        <Route path='/' element={<LandingRedirect />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignUpPage />} />
        <Route path='/password/reset' element={<PasswordResetPage />} />
        {/* <Route path='/test' element={<TestPage />} /> */}
      </Route>

      {/* 보호된 라우트: 로그인 필요 */}
      <Route element={<ProtectedLayout />}>
        {/* 메인 앱 레이아웃 */}
        <Route element={<AppLayout />}>
          <Route path='/map' element={<MapPage />} />

          <Route path='/post' element={<PostCreatePage />} />
          <Route path='/post/:postId' element={<PostDetailPage />} />

          {/* <Route path='/balance' element={<BalancePage />} /> */}
          {/* <Route path="/pay" element={<PayRedirectPage />} /> */}
        </Route>

        {/* 채팅 관련 레이아웃 */}
        <Route element={<ChatLayout />}>
          <Route path='/chat' element={<ChatListPage />} />
          <Route path='/chat/preview/:roomId' element={<RoomPreviewGate />} />
          <Route
            path='/chat/room/:roomId'
            element={
              <RequireRoomAccess>
                <ChatRoomPage />
              </RequireRoomAccess>
            }
          />
          <Route path='/chat/room/create' element={<RoomCreatePage />} />
        </Route>

        {/* 프로필 관련 레이아웃 */}
        <Route element={<ProfileLayout />}>
          <Route path='/profile' element={<ProfilePage />} />
        </Route>

        <Route element={<FriendListLayout />}>
          <Route path='/profile/edit' element={<ProfileEditPage />} />
          <Route path='/profile/friend' element={<FriendListPage />} />
          <Route path='/profile/friend/received' element={<FriendRequestsPage />} />

          <Route path='/search' element={<FriendSearchPage />} />
        </Route>

        {/* 계좌 관련 레이아웃 */}
        <Route element={<AccountLayout />}>
          <Route path='/profile/account' element={<AccountPage />} />
          <Route path='/profile/account/edit' element={<AccountEditPage />} />
          <Route path='/balance' element={<BalancePage />} />
          <Route path="/pay" element={<PayRedirectPage />} />
        </Route>
      </Route>

      {/* 기타 */}
      <Route path='/test-api' element={<TestAPI />} />

      {/* 동적 에러 페이지 */}
      <Route path='/error/:type' element={<ErrorPage />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes >
  );
}
