import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation } from "react-router-dom";
import { Grid, MapPin, Menu } from 'lucide-react';

import { determineProfileType } from "@/utils/determineProfileType";
import { ProfileType, FriendResponse } from "@/types/friend";
import { UserResponseDTO, UserParticipateLinkerDTO, ProfilePostDTO, ProfileLinkerCountDTO } from '@/types/user';

import ProfileContent from '../../components/profile/ProfileContent';
import ProfileBarContent from '../../components/profile/ProfileBarContent';
import PostsTab from '../../components/profile/PostsTab';
import ParticipationTab from '../../components/profile/ParticipationTab';
import StateTab from '../../components/profile/StateTab';

function ProfilePage() {
  // 중간 post 페이지/링커 참여 페이지/링커 참여 통계 페이지 선택
  const [activeTab, setActiveTab] = useState<'posts' | 'participation' | 'state'>('posts');
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [participations, setParticipations] = useState<UserParticipateLinkerDTO[]>([]);
  const [friendList, setFriendList] = useState<FriendResponse[]>([]);
  const [posts, setPosts] = useState<ProfilePostDTO[]>([]);
  const [linkerStats, setLinkerStats] = useState<ProfileLinkerCountDTO[]>([]);

  // 로그인한 유저 ID
  const loggedInUserId = 1;

  // 현재 URL의 userId 파라미터
  const { userId: profileUserIdParam } = useParams<{ userId: string }>();

  // location state에서 type과 friendId 받아옴
  const location = useLocation();
  const { type, friendId } = (location.state as { type?: string; friendId?: number }) || {};
  const state = location.state as { userId?: number } | undefined;

  // URL 파라미터 또는 state에서 userId를 가져와 현재 보고 있는 유저로 설정
  const profileUserId = state?.userId ?? loggedInUserId;

  useEffect(() => {
    if (!profileUserId) return;

    // 유저 정보
    fetch(`/api/user/${profileUserId}`)
      .then((res) => res.json())
      .then((data: UserResponseDTO) => setUser(data))
      .catch((err) => console.error(err));

    // 포스트 목록
    fetch(`/api/post/user/${profileUserId}`)
      .then((res) => res.json())
      .then((data: ProfilePostDTO[]) => setPosts(data))
      .catch((err) => console.error(err));

    // 링커 참여 통계
    fetch("/api/user/linker/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: profileUserId }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data: ProfileLinkerCountDTO[]) => {
        if (!Array.isArray(data)) throw new Error("응답 형식 오류");
        setLinkerStats(data);
      })
      .catch((err) => {
        console.error(err);
        setLinkerStats([]);
      });

    // 링커 참여 내역
    fetch("/api/user/linker/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: profileUserId }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data: UserParticipateLinkerDTO[]) => {
        if (!Array.isArray(data)) throw new Error("응답 형식 오류");
        setParticipations(data);
      })
      .catch((err) => {
        console.error(err);
        setParticipations([]);
      });

    // 친구 목록
    fetch(`/api/friend/${profileUserId}`)
      .then((res) => res.json())
      .then((data: FriendResponse[]) => setFriendList(data))
      .catch((err) => console.error(err));
  }, [profileUserId, loggedInUserId]);

  // 탭에 따라 컴포넌트 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return <PostsTab posts={posts} />;
      case 'participation':
        return <ParticipationTab participations={participations} />;
      case 'state':
        return <StateTab linkerStats={linkerStats} />;
      default:
        return <PostsTab posts={posts} />;
    }
  };

  // 프로필 타입 결정
  let profileType: ProfileType = useMemo(
    () => determineProfileType(loggedInUserId, profileUserId, friendList),
    [loggedInUserId, profileUserId, friendList]
  );

  if (type === "sent" || type === "received") {
    profileType = "wait";
  }

  const friendListProcessed = friendList.map(f => ({
    id: f.userId1 === loggedInUserId ? f.userId2 : f.userId1,
    name: f.name,
    nickname: f.nickname,
  }));

  const computedVerified = profileType === 'self' ? true : (user?.verified ?? false);

  return (
    <div>
      <div>
        {/* 프로필 헤더 / 바 */}
        {user ? (
          <>
            <ProfileContent
              userId={profileUserId}
              profileType={profileType}
              name={user.name}
              nickname={user.nickname}
              description={user.description}
              createDate={user.createdDate}
              isVerified={computedVerified}
              friendList={friendListProcessed}
            />

            <ProfileBarContent
              userId={profileUserId}
              profileType={profileType}
              isVerified={computedVerified}
            />
          </>
        ) : (
          <p>로딩중...</p>
        )}
      </div>

      {/* 탭 버튼 */}
      <div className="bg-white border-b py-1">
        <div className="flex">
          <button
            className={`flex-1 py-3 flex items-center justify-center border-b-2 ${activeTab === 'posts' ? 'border-blue-500' : 'border-transparent'}`}
            onClick={() => setActiveTab('posts')}
          >
            <Grid className={`w-5 h-5 ${activeTab === 'posts' ? 'text-gray-900' : 'text-gray-400'}`} />
          </button>
          <button
            className={`flex-1 py-3 flex items-center justify-center border-b-2 ${activeTab === 'participation' ? 'border-blue-500' : 'border-transparent'}`}
            onClick={() => setActiveTab('participation')}
          >
            <MapPin className={`w-5 h-5 ${activeTab === 'participation' ? 'text-gray-900' : 'text-gray-400'}`} />
          </button>
          <button
            className={`flex-1 py-3 flex items-center justify-center border-b-2 ${activeTab === 'state' ? 'border-blue-500' : 'border-transparent'}`}
            onClick={() => setActiveTab('state')}
          >
            <Menu className={`w-5 h-5 ${activeTab === 'state' ? 'text-gray-900' : 'text-gray-400'}`} />
          </button>
        </div>
      </div>

      {/* 탭 내용 */}
      <div className="flex1">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default ProfilePage;
