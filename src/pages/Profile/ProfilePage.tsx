import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useOutletContext } from "react-router-dom";
import { Grid, MapPin, Menu } from 'lucide-react';
import { determineProfileType } from "@/utils/determineProfileType";
import { ProfileType, FriendResponse } from "@/types/friend";

import ProfileContent from '../../components/profile/ProfileContent';
import PostsTab from '../../components/profile/PostsTab';
import ParticipationTab from '../../components/profile/ParticipationTab';
import StateTab from '../../components/profile/StateTab';

import { UserResponseDTO, UserParticipateLinkerDTO, ProfilePostDTO, ProfileLinkerCountDTO } from '@/types/user';

// API 함수
import { getUserProfile, getUserPosts, getLinkerStats, getLinkerParticipations } from "@/api/profileApi";
import { getFriends } from "@/api/friendApi";

type OutletContextType = { loggedInUserId: number };

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'participation' | 'state'>('posts');
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [participations, setParticipations] = useState<UserParticipateLinkerDTO[]>([]);
  const [friendList, setFriendList] = useState<FriendResponse[]>([]);
  const [posts, setPosts] = useState<ProfilePostDTO[]>([]);
  const [linkerStats, setLinkerStats] = useState<ProfileLinkerCountDTO[]>([]);

  const { userId: profileUserIdParam } = useParams<{ userId: string }>();
  const location = useLocation();
  // const { type } = (location.state as { type?: string; friendId?: number }) || {};
  const state = location.state as { userId?: number } | undefined;
  // const friendId = location.state as { friendId?: number } | undefined;
  // const { gender } = (location.state as { gender?: string }) || {};

  const { type, friendId, gender } = (location.state as {
    type?: string;
    friendId?: number;
    gender?: string;
  }) || {};

  const { loggedInUserId } = useOutletContext<OutletContextType>();
  const profileUserId = state?.userId ?? loggedInUserId;

  const getFriendUserId = (friend: FriendResponse, loggedInUserId: number): number => {
    return friend.userId1 === loggedInUserId ? friend.userId2 : friend.userId1;
  };

  useEffect(() => {
    if (!profileUserId) return;

    (async () => {
      try {
        const data = await getUserProfile(profileUserId);
        setUser(data);
      } catch (err) {
        console.error("유저 정보 불러오기 실패:", err);
      }
    })();

    (async () => {
      try {
        const data = await getUserPosts(profileUserId);
        setPosts(data);
      } catch (err) {
        console.error("포스트 목록 불러오기 실패:", err);
      }
    })();

    (async () => {
      try {
        const data = await getLinkerStats(profileUserId);
        setLinkerStats(data);
      } catch (err) {
        console.error("링커 참여 통계 불러오기 실패:", err);
      }
    })();

    (async () => {
      const data = await getLinkerParticipations(profileUserId);
      setParticipations(data);
    })();

    (async () => {
      try {
        const res = await getFriends(profileUserId);
        setFriendList(res);
      } catch (err) {
        console.error("친구 목록 불러오기 실패:", err);
      }
    })();

  }, [profileUserId, loggedInUserId]);

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

  const computedVerified = profileType === 'self'
    ? true
    : (user?.verified ?? false);

  return (
    <div>
      <div>
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
              friendId={friendId}
              gender={user.gender ?? gender}
              image={user.image}
              background={user.background}
            />
          </>
        ) : (
          <p>로딩중...</p>
        )}
      </div>

      <div className="bg-white border-b py-1 sticky top-0 z-10">
        <div className="flex">
          <button
            className={`flex-1 py-3 flex items-center justify-center border-b-2 ${activeTab === 'posts' ? 'border-blue-500' : 'border-transparent'
              }`}
            onClick={() => setActiveTab('posts')}
          >
            <Grid
              className={`w-5 h-5 ${activeTab === 'posts' ? 'text-gray-900' : 'text-gray-400'
                }`}
            />
          </button>
          <button
            className={`flex-1 py-3 flex items-center justify-center border-b-2 ${activeTab === 'participation' ? 'border-blue-500' : 'border-transparent'
              }`}
            onClick={() => setActiveTab('participation')}
          >
            <MapPin
              className={`w-5 h-5 ${activeTab === 'participation' ? 'text-gray-900' : 'text-gray-400'
                }`}
            />
          </button>
          <button
            className={`flex-1 py-3 flex items-center justify-center border-b-2 ${activeTab === 'state' ? 'border-blue-500' : 'border-transparent'
              }`}
            onClick={() => setActiveTab('state')}
          >
            <Menu
              className={`w-5 h-5 ${activeTab === 'state' ? 'text-gray-900' : 'text-gray-400'
                }`}
            />
          </button>
        </div>
      </div>


      <div className="flex1 mb-24">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProfilePage;
