// src/pages/ProfilePage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useOutletContext, useNavigate } from "react-router-dom";
import { Grid, MapPin, Menu, Wallet } from "lucide-react";
import ProfileContent from "@/components/profile/ProfileContent";
import PostsTab from "@/components/profile/PostsTab";
import ParticipationTab from "@/components/profile/ParticipationTab";
import StateTab from "@/components/profile/StateTab";

import { determineProfileType } from "@/utils/determineProfileType";
import type { ProfileType, FriendResponse } from "@/types/friend";
import { useFriendSearch } from "@/hooks/useFriendSearch";
import type {
  UserResponseDTO,
  UserParticipateLinkerDTO,
  ProfilePostDTO,
  ProfileLinkerCountDTO,
} from "@/types/user";

import {
  getUserProfile,
  getUserPosts,
  getLinkerStats,
  getLinkerParticipations,
} from "@/api/profileApi";
import { getFriends } from "@/api/friendApi";
import { getCurrentUserId } from "@/api/authApi";


// 카테고리 이름 + 아이콘 매핑
const ACTIVITIES = [
  "식사", "카페", "음악", "영화", "독서", "운동",
  "음주", "학습", "쇼핑", "병원", "게임", "여행",
];

const CATEGORY_ICONS = [
  "/icons/profile/meal.png",       // 1
  "/icons/profile/cafe.png",       // 2
  "/icons/profile/music.png",      // 3
  "/icons/profile/movie.png",      // 4
  "/icons/profile/reading.png",    // 5
  "/icons/profile/exercise.png",   // 6
  "/icons/profile/drinking.png",   // 7
  "/icons/profile/learning.png",   // 8
  "/icons/profile/shopping.png",   // 9
  "/icons/profile/hospital.png",   // 10
  "/icons/profile/game.png",       // 11
  "/icons/profile/travel.png",     // 12
];

const COLORS = [
  "#F9877A",
  "#F9D77A",
  "#E47AF9",
  "#7A8BF9",
  "#7AB1F9",
  "#C8F97A",
  "#F9F97A",
  "#F9AB7A",
  "#7AF97A",
  "#7AECF9",
  "#A07AF9",
  "#F97AAD",
];

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<"posts" | "participation" | "state">("posts");

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);


  useEffect(() => {
    (async () => {
      try {
        const userId = await getCurrentUserId();
        setLoggedInUserId(userId);
      } catch (err) {
        console.error("현재 유저 ID 불러오기 실패:", err);
      } finally {
        setIsAuthLoading(false);
      }
    })();
  }, []);


  // ✅ navigate 선언
  const navigate = useNavigate();


  // 상태 관리
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [posts, setPosts] = useState<ProfilePostDTO[]>([]);
  const [participations, setParticipations] = useState<UserParticipateLinkerDTO[]>([]);
  const [friendList, setFriendList] = useState<FriendResponse[]>([]);
  const [linkerStats, setLinkerStats] = useState<ProfileLinkerCountDTO[]>([]);

  // 파라미터 & 라우팅 상태
  const { userId: profileUserIdParam } = useParams<{ userId: string }>();
  const location = useLocation();

  const { results, setResults } = useFriendSearch(loggedInUserId ?? 0);


  const state = location.state as {
    type?: string;
    friendId?: number;
    gender?: string;
    userId?: number;
    profileType?: ProfileType;
    pathname?: string;
  } | undefined;


  const { type, friendId, gender } = state || {};
  const pathname = state?.pathname ?? location.pathname;

  // 프로필 주인 ID
  const profileUserId = profileUserIdParam
    ? Number(profileUserIdParam)
    : state?.userId ?? loggedInUserId;

  // 데이터 패칭
  useEffect(() => {
    if (!profileUserId || loggedInUserId === null) return;

    (async () => {
      try {
        const [userData, postData, statsData, participationData, friendsData] =
          await Promise.all([
            getUserProfile(profileUserId),
            getUserPosts(profileUserId),
            getLinkerStats(profileUserId),
            getLinkerParticipations(profileUserId),
            getFriends(profileUserId),
          ]);

        setUser(userData);
        setPosts(postData);
        setLinkerStats(statsData);
        setParticipations(participationData);
        setFriendList(friendsData);
      } catch (err) {
        console.error("프로필 데이터 불러오기 실패:", err);
      }
    })();
  }, [profileUserId, loggedInUserId]);

  // 프로필 타입 결정
  const profileType: ProfileType = useMemo(() => {
    if (!loggedInUserId || !profileUserId) return "stranger"; // fallback

    if (state?.profileType) return state.profileType;
    if (type === "sent" || type === "received") return "wait";

    return determineProfileType(loggedInUserId, profileUserId, friendList);
  }, [loggedInUserId, profileUserId, friendList, type, state?.profileType]);


  const friendListProcessed = useMemo(
    () =>
      friendList.map((f) => ({
        friendUserId: f.userId1 === loggedInUserId ? f.userId2 : f.userId1,
        name: f.name,
        nickname: f.nickname,
      })),
    [friendList, loggedInUserId]
  );

  const computedVerified = profileType === "self" ? true : user?.verified ?? false;

  // 탭 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
        return <PostsTab posts={posts} />;
      case "participation":
        return (
          <ParticipationTab
            participations={participations}
            activities={ACTIVITIES}
            icons={CATEGORY_ICONS}
            colors={COLORS}
          />
        );
      case "state":
        return (
          <StateTab
            linkerStats={linkerStats}
            activities={ACTIVITIES}
            icons={CATEGORY_ICONS}
            colors={COLORS}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div key={profileUserIdParam} className="flex flex-col bg-white">
      {/* 프로필 상단 */}
      {user && profileUserId !== null && loggedInUserId !== null ? (
        <ProfileContent
          userId={profileUserId}
          profileType={profileType}
          name={user.name}
          nickname={user.nickname}
          memo={user.memo}
          createDate={user.createdDate}
          isVerified={computedVerified}
          friendList={friendListProcessed}
          friendId={friendId}
          gender={user.gender ?? gender}
          image={user.image}
          background={user.background}
          searchResults={results}
          loggedInUserId={loggedInUserId}
          setSearchResults={setResults}
          pathname={pathname}
        />
      ) : (
        <>
          {/* 배경 placeholder */}
          <div className="h-60 bg-gray-100 animate-pulse" />

          {/* 프로필 정보 placeholder */}
          <div className="bg-white px-4 mt-3 rounded-t-3xl min-h-[120px] animate-pulse" />
        </>
      )}

      {/* 탭 선택 */}
      <div className="bg-white border sticky top-0 z-10">
        <div className="flex">
          <button
            className={`flex-1 py-3 mx-3 flex items-center justify-center border-b-2 ${activeTab === "posts" ? "border-gray-200" : "border-transparent"
              }`}
            onClick={() => setActiveTab("posts")}
          >
            <Grid
              className={`w-5 h-5 ${activeTab === "posts" ? "text-gray-900" : "text-gray-400"
                }`}
            />
          </button>
          <button
            className={`flex-1 py-3 mx-3 flex items-center justify-center border-b-2 ${activeTab === "participation" ? "border-gray-200" : "border-transparent"
              }`}
            onClick={() => setActiveTab("participation")}
          >
            <MapPin
              className={`w-5 h-5 ${activeTab === "participation" ? "text-gray-900" : "text-gray-400"
                }`}
            />
          </button>
          <button
            className={`flex-1 py-3 mx-3 flex items-center justify-center border-b-2 ${activeTab === "state" ? "border-gray-200" : "border-transparent"
              }`}
            onClick={() => setActiveTab("state")}
          >
            <Menu
              className={`w-5 h-5 ${activeTab === "state" ? "text-gray-900" : "text-gray-400"
                }`}
            />
          </button>

          {/* BalanceControl 페이지로 이동 */}
          <button
            className="flex-1 py-3 flex items-center justify-center border-b-2 border-transparent"
            onClick={() => navigate("/balance")}
          >
            <Wallet className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="flex-1 z-10 bg-white">{renderTabContent()}</div>
    </div>
  );
};

export default ProfilePage;
