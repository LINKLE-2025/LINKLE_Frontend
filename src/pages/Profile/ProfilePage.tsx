import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { Grid, MapPin, Menu } from 'lucide-react';
import { determineProfileType } from "@/utils/determineProfileType";
import { ProfileType, FriendResponse } from "@/types/friend";

import ProfileContent from '../../components/profile/ProfileContent';
import ProfileBarContent from '../../components/profile/ProfileBarContent';
import PostsTab from '../../components/profile/PostsTab';
import ParticipationTab from '../../components/profile/ParticipationTab';
import StateTab from '../../components/profile/StateTab';
import { useLocation } from "react-router-dom";
import { UserResponseDTO, UserParticipateLinkerDTO, ProfilePostDTO, ProfileLinkerCountDTO } from '@/types/user';
import { useOutletContext } from "react-router-dom";

// API 함수
import { getUserProfile, getUserPosts, getLinkerStats, getLinkerParticipations } from "@/api/profileApi";
import { getFriends } from "@/api/friendApi";

//로그인한 유저 아이디
type OutletContextType = { loggedInUserId: number };

const ProfilePage: React.FC = () => {
  // 중간 post 페이지/링커 참여 페이지/링커 참여 통계 페이지 선택
  const [activeTab, setActiveTab] = useState<'posts' | 'participation' | 'state'>('posts');
  // 유저 정보 저장
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  // 링커 참여 내역 저장
  const [participations, setParticipations] = useState<UserParticipateLinkerDTO[]>([]);
  // 친구 목록 저장
  const [friendList, setFriendList] = useState<FriendResponse[]>([]);

  // 현재 보고 있는 프로필 userId
  const { userId: profileUserIdParam } = useParams<{ userId: string }>();
  // 포스트 목록 저장
  const [posts, setPosts] = useState<ProfilePostDTO[]>([]);
  // 링커 참여 통계 내역 저장
  const [linkerStats, setLinkerStats] = useState<ProfileLinkerCountDTO[]>([]);
  // 현재 URL의 상태를 확인하여 탭을 설정 (기본값은 posts)
  const location = useLocation();
  const { type } = (location.state as { type?: string; friendId?: number }) || {};

  // state에서 userId 받기
  const state = location.state as { userId?: number } | undefined;
  const friendId = location.state as { friendId?: number } | undefined;

  const { loggedInUserId } = useOutletContext<OutletContextType>();

  // URL에 userId가 없으면 본인 프로필로 설정
  const profileUserId = state?.userId ?? loggedInUserId;
  // 유저 정보, 링커 참여 내역, 친구 목록 불러오기

  const getFriendUserId = (friend: FriendResponse, loggedInUserId: number): number => {
    return friend.userId1 === loggedInUserId ? friend.userId2 : friend.userId1;
  };
  useEffect(() => {
    // console.log("현재 프로필:", profileUserId);
    // console.log("로그인 유저:", loggedInUserId);


    // userId가 없으면 요청하지 않음
    if (!profileUserId) return;
    // 유저 정보 불러오기
    (async () => {
      try {
        const data = await getUserProfile(profileUserId);
        console.log("유저 정보:", data);
        setUser(data);
      } catch (err) {
        console.error("유저 정보 불러오기 실패:", err);
      } finally {
      }
    })();

    // 포스트 목록 불러오기
    (async () => {
      try {
        const data = await getUserPosts(profileUserId);
        setPosts(data);
      } catch (err) {
        console.error("포스트 목록 불러오기 실패:", err);
      }
    })();

    // 링커 참여 내역 통계 불러오기
    (async () => {
      try {
        const data = await getLinkerStats(profileUserId);
        setLinkerStats(data);
      } catch (err) {
        console.error("링커 참여 통계 불러오기 실패:", err);
      }
    })();

    // 링커 참여 내역 불러오기
    (async () => {
      const data = await getLinkerParticipations(profileUserId);
      setParticipations(data);
    })();

    // 친구 목록 불러오기
    (async () => {
      try {
        const res = await getFriends(profileUserId);
        setFriendList(res);
      } catch (err) {
        console.error("친구 목록 불러오기 실패:", err);
      }
    })();

  }, [profileUserId, loggedInUserId]);


  // 탭버튼을 클릭하면서 해당 탭 내용을 출력
  const renderTabContent = () => {
    switch (activeTab) {
      // PostsTab 포스트 목록 전달
      case 'posts':
        return <PostsTab posts={posts} />;
      // 링커 참여 내역 리스트 전달
      case 'participation':
        return <ParticipationTab participations={participations} />;
      // 링커 참여 통계 내역 리스트 전달
      case 'state':
        return <StateTab linkerStats={linkerStats} />;
      // 기본은 post 탭으로 설정
      default:
        return <PostsTab posts={posts} />;
    }
  };
  // 프로필 타입 결정
  let profileType: ProfileType = React.useMemo(
    // determineProfileType은 utils에 정의
    () => determineProfileType(loggedInUserId, profileUserId, friendList),
    [loggedInUserId, profileUserId, friendList]
  );
  // 만약 친구 요청 페이지에서 넘어왔다면 type으로 강제 세팅
  if (type === "sent" || type === "received") {
    profileType = "wait";  // 항상 "수락 대기 중"
  }

  const friendListProcessed = friendList.map(f => ({
    id: f.userId1 === loggedInUserId ? f.userId2 : f.userId1,
    name: f.name,
    nickname: f.nickname,
  }));

  const computedVerified = profileType === 'self'
    ? true
    : (user?.verified ?? false);
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
              friendId={friendId?.friendId}
            />

            {/* <ProfileBarContent
              userId={profileUserId}
              profileType={profileType}
              isVerified={computedVerified}
              friendId={friendId?.friendId}
            /> */}
          </>
        ) : (
          <p>로딩중...</p>
        )}
      </div>
      {/* 
      탭 버튼
      누를때마다 해당 컴포넌트로 이동을 위한 내용 전달
      */}

      <div className="bg-white border-b py-1">
        <div className="flex">
          <button
            className={`flex-1 py-3 flex items-center justify-center border-b-2 ${activeTab === 'posts' ? 'border-blue-500' : 'border-transparent'
              }`}
            onClick={() => setActiveTab('posts')}
          >
            <Grid className={`w-5 h-5 ${activeTab === 'posts' ? 'text-gray-900' : 'text-gray-400'}`} />
          </button>
          <button
            className={`flex-1 py-3 flex items-center justify-center border-b-2 ${activeTab === 'participation' ? 'border-blue-500' : 'border-transparent'
              }`}
            onClick={() => setActiveTab('participation')}
          >
            <MapPin className={`w-5 h-5 ${activeTab === 'participation' ? 'text-gray-900' : 'text-gray-400'}`} />
          </button>
          <button
            className={`flex-1 py-3 flex items-center justify-center border-b-2 ${activeTab === 'state' ? 'border-blue-500' : 'border-transparent'
              }`}
            onClick={() => setActiveTab('state')}
          >
            <Menu className={`w-5 h-5 ${activeTab === 'state' ? 'text-gray-900' : 'text-gray-400'}`} />
          </button>
        </div>
      </div>

      {/*
      탭 컨텐츠
      위에서 선택한 내용을 해당 컴포넌트로 이동해 보여줌
      */}
      <div className="flex1">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProfilePage;
