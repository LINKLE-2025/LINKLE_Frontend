import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProfileBarContent from '../../components/profile/ProfileBarContent';
import { FriendSummaryWithProfileType, ProfileType } from "@/types/friend";
import { getProfileImageSrc } from '@/utils/profileUtils';
import { sendFriendRequest } from '@/api/friendApi';

interface FriendSummary {
  friendUserId: number;
  name: string;
  nickname: string;
}

interface ProfileContentProps {
  userId: number;
  profileType: ProfileType;
  name: string;
  nickname: string;
  memo: string;
  createDate: string;
  state?: string;
  isVerified?: boolean;
  friendList: FriendSummary[];
  friendId?: number;
  gender?: string;
  image?: string | null;
  background?: string | null;
  searchResults: FriendSummaryWithProfileType[];
  loggedInUserId: number;
  setSearchResults: React.Dispatch<React.SetStateAction<FriendSummaryWithProfileType[]>>;
  pathname: string;
}

function ProfileContent({
  userId,
  profileType,
  name,
  nickname,
  memo,
  createDate,
  isVerified = false,
  friendList,
  friendId,
  gender,
  image,
  background,
  loggedInUserId,
  setSearchResults,
  pathname,
}: ProfileContentProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // profileType을 로컬 상태로 관리
  const [currentType, setCurrentType] = useState<ProfileType>(profileType);



  // 부모에서 내려오는 profileType이 바뀌면 동기화
  useEffect(() => {
    setCurrentType(profileType);
  }, [profileType]);

  const isDefaultBackground = background === 'public.png' || !background;
  const { src: profileImageSrc, isDefault } = getProfileImageSrc(userId, image, gender, true);
  const placeholderBg = "/icons/profile/Background.png";
  const [bgSrc, setBgSrc] = useState<string>(placeholderBg);

  useEffect(() => {
    // background(키)가 있으면 실제 이미지 미리 로드해서 성공하면 교체
    const tryUrl = `/api/user/view/background/${userId}?v=${Date.now()}`;
    if (!background) {
      setBgSrc(placeholderBg);
      return;
    }
    const img = new Image();
    img.src = tryUrl;
    img.onload = () => setBgSrc(tryUrl);
    img.onerror = () => setBgSrc(placeholderBg);
  }, [userId, background]);

  const handleAddFriend = async (targetUserId: number) => {
    try {
      const data = await sendFriendRequest(loggedInUserId, targetUserId);

      // 현재 프로필의 상태도 업데이트
      setCurrentType(data.state === "ACCEPTED" ? "friend" : "wait");

      // 검색 결과 리스트도 업데이트
      setSearchResults(prev =>
        prev.map(user =>
          user.friendUserid === targetUserId
            ? { ...user, profileType: data.state === "ACCEPTED" ? "friend" : "wait" }
            : user
        )
      );
    } catch (err) {
      console.error("친구 요청 중 오류:", err);
      alert("친구 요청 실패");
    }
  };

  const profileBackgroundSrc = isDefaultBackground
    ? '/icons/profile/Background.png'
    : `/api/user/view/background/${userId}?v=${Date.now()}`;

  const renderButton = () => {
    switch (currentType) {
      case 'self':
        return (
          <Link
            to="/friend"
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg border flex items-center"
            state={{ friendList }}
          >
            <Users className="w-4 h-4 mr-1" />
            친구 목록
          </Link>
        );
      case 'stranger':
        return (
          <button
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg"
            onClick={() => handleAddFriend(userId)}
          >
            친구 추가
          </button>
        );
      case 'friend':
        return (
          <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg">
            메시지
          </button>
        );
      case 'wait':
        return (
          <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg">
            수락 대기 중
          </button>
        );
      default:
        return null;
    }
  };

  const today = new Date();
  const daysSinceJoin = Math.floor(
    (today.getTime() - new Date(createDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="relative">
      {/* 배경 이미지 */}
      <div className="relative w-full h-60 overflow-hidden bg-gray-200">
        <div className="relative w-full h-60 overflow-hidden bg-gray-100">
          <img
            src={profileBackgroundSrc}
            alt="background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        {/* 상단바는 그대로 */}
        <div className="absolute top-0 left-0 w-full z-30">
          <ProfileBarContent
            userId={userId}
            profileType={currentType}
            isVerified={isVerified}
            friendId={friendId}
            gender={gender}
            image={image}
            background={background}
            pathname={pathname}
          />
        </div>
      </div>

      {/* 프로필 정보 */}
      <div
        className="bg-white px-4 mt-3 rounded-t-3xl relative z-10 min-h-[120px]"
      >
        <div className="flex items-center space-x-3 mb-4">
          <img
            src={profileImageSrc}
            alt={`${name} 프로필`}
            className={`w-12 h-12 object-cover rounded-full cursor-pointer ${isDefault ? 'opacity-65 bg-blue-100' : ''}`}
            onClick={() => setPreviewImage(profileImageSrc)}
          />
          <div className="flex-1">
            <div className="flex items-start space-x-2">
              <div className="flex flex-col">
                <h1 className="font-semibold text-gray-900 text-sm leading-tight">{name}</h1>
                <p className="text-xs text-gray-500 leading-tight">@{nickname}</p>
              </div>
            </div>
          </div>
          {renderButton()}
        </div>

        <div className="text-left text-gray-900 text-base mb-2 whitespace-pre-line">
          {memo}
        </div>

        <div className="space-y-1 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span>📍</span>
            <span>{friendList.length}명의 친구</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🏢</span>
            <span>{daysSinceJoin}일째 활동 중</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📅</span>
            <span>{createDate}</span>
          </div>
        </div>
      </div>


      {/* 이미지 프리뷰 모달 */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 transition-opacity duration-150 opacity-100"
          onClick={() => setPreviewImage(null)}
        >
          <img src={previewImage} className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg" />
        </div>
      )}
    </div>
  );
}

export default ProfileContent;
