import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { Grid, MapPin, Menu } from 'lucide-react';
import { determineProfileType } from "@/utils/determineProfileType";
import { ProfileType, FriendResponse } from "@/types/friend";

import ProfileContent from '../../components/profile/ProfileContent';
import PostsTab from '../../components/profile/PostsTab';
import ParticipationTab from '../../components/profile/ParticipationTab';
import StateTab from '../../components/profile/StateTab';
import { UserResponseDTO, UserParticipateLinkerDTO } from '@/types/user';

const ProfilePage: React.FC = () => {
  // 중간 post 페이지/링커 참여 페이지/링커 참여 통계 페이지 선택
  const [activeTab, setActiveTab] = useState<'posts' | 'participation' | 'state'>('posts');
  // 유저 정보 저장
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  // 링커 참여 내역 저장
  const [participations, setParticipations] = useState<UserParticipateLinkerDTO[]>([]);
  // 친구 목록 저장
  const [friendList, setFriendList] = useState<FriendResponse[]>([]);
  //로그인한 유저 아이디
  const loggedInUserId = 1;
  // 현재 보고 있는 프로필 userId
  const { userId: profileUserIdParam } = useParams<{ userId: string }>();
  // URL에 userId가 없으면 본인 프로필로 설정
  const profileUserId = profileUserIdParam
    ? Number(profileUserIdParam)
    : loggedInUserId;
  // 유저 정보, 링커 참여 내역, 친구 목록 불러오기

  const getFriendUserId = (friend: FriendResponse, loggedInUserId: number): number => {
    return friend.userId1 === loggedInUserId ? friend.userId2 : friend.userId1;
  };
  useEffect(() => {
    console.log("현재 프로필:", profileUserId);
    console.log("로그인 유저:", loggedInUserId);


    // userId가 없으면 요청하지 않음
    if (!profileUserId) return;
    // 유저 정보 불러오기
    fetch(`/api/user/${profileUserId}`)
      .then((res) => res.json())
      .then((data: UserResponseDTO) => {
        console.log("user:", data);
        setUser(data);
      })
      .catch((err) => console.error(err));
    // 링커 참여 내역 불러오기
    fetch("/api/user/linker/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: profileUserId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text(); // 또는 res.json()
          console.error("링커 API 오류:", errorText);
          throw new Error("링커 참여 내역 불러오기 실패");
        }
        return res.json();
      })
      .then((data: UserParticipateLinkerDTO[]) => {
        if (!Array.isArray(data)) {
          throw new Error("링커 참여 내역 응답 형식 오류");
        }
        setParticipations(data);
      })
      .catch((err) => {
        console.error("참여 내역 요청 실패:", err);
        setParticipations([]); // 안전하게 빈 배열로 fallback
      });
    // 친구 목록 불러오기
    // 현재 보고 있는 프로필 기준 아이디값
    const targetUserId = profileUserId;
    fetch(`/api/friend/${targetUserId}`)
      .then((res) => res.json())
      .then((data: FriendResponse[]) => {
        console.log("friendList:", data);
        setFriendList(data);
      })
      .catch((err) => console.error(err));
  }, [profileUserId, loggedInUserId]);


  // 탭버튼을 클릭하면서 해당 탭 내용을 출력
  const renderTabContent = () => {
    switch (activeTab) {
      // PostsTab 포스트 목록 전달
      case 'posts':
        return <PostsTab />;
      // 링커 참여 내역 리스트 전달
      case 'participation':
        return <ParticipationTab participations={participations} />;
      // 링커 참여 통계 내역 리스트 전달
      case 'state':
        return <StateTab />;
      // 기본은 post 탭으로 설정
      default:
        return <PostsTab />;
    }
  };
  // 프로필 타입 결정
  const profileType: ProfileType = React.useMemo(
    // determineProfileType은 utils에 정의
    () => determineProfileType(loggedInUserId, profileUserId, friendList),
    [loggedInUserId, profileUserId, friendList]
  );

  return (
    
    <div>
      <div>
        {/* 
        프로필 헤더
        profileType, name, username, description 전달 본인일때 isVerified = true로 설정
        */}
         {user ? (
          <ProfileContent
            userId={profileUserId}
            profileType={profileType}
            name={user.name}
            username={user.username}
            description={user.description}
            createDate={user.createdDate}
            isVerified={user.verified ?? false}
            friendList={friendList.map(f => ({
              id: f.userId1 === loggedInUserId ? f.userId2 : f.userId1,
              name: f.name,
              username: f.nickname,
            }))}
          />
        ) : (
          <p>로딩중...</p>
        )}
      </div>
      {/* 
      탭 버튼
      누를때마다 해당 컴포넌트로 이동을 위한 내용 전달
      */}

      <div className="bg-white border-b">
        <div className="flex">
          <button
            className={`flex-1 py-3 flex items-center justify-center border-b-2 ${
              activeTab === 'posts' ? 'border-blue-500' : 'border-transparent'
            }`}
            onClick={() => setActiveTab('posts')}
          >
            <Grid className={`w-5 h-5 ${activeTab === 'posts' ? 'text-gray-900' : 'text-gray-400'}`} />
          </button>
          <button
            className={`flex-1 py-3 flex items-center justify-center border-b-2 ${
              activeTab === 'participation' ? 'border-blue-500' : 'border-transparent'
            }`}
            onClick={() => setActiveTab('participation')}
          >
            <MapPin className={`w-5 h-5 ${activeTab === 'participation' ? 'text-gray-900' : 'text-gray-400'}`} />
          </button>
          <button
            className={`flex-1 py-3 flex items-center justify-center border-b-2 ${
              activeTab === 'state' ? 'border-blue-500' : 'border-transparent'
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
      <div className="flex-1">{renderTabContent()}</div>
    </div>
  );
};

export default ProfilePage;
