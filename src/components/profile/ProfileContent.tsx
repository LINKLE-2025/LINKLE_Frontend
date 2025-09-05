import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProfileBarContent from '../../components/profile/ProfileBarContent';

// 프로필 페이지의 주요 정보를 표시하는 컴포넌트
interface FriendSummary {
  id: number;
  name: string;
  nickname: string;
}

// ProfileContent 컴포넌트의 props 타입 정의
interface ProfileContentProps {
  userId: number;
  profileType: 'self' | 'friend' | 'stranger' | 'wait';
  name: string;
  nickname: string;
  description: string;
  createDate: string;
  isVerified?: boolean;
  friendList: FriendSummary[];
}

// ProfileContent 컴포넌트
const ProfileContent: React.FC<ProfileContentProps> = ({
  userId,
  profileType,
  name,
  nickname,
  description,
  createDate,
  isVerified = false,
  friendList,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  // 프로필 타입을 받아와 버튼을 각각 다르게 렌더링해줌
  const renderButton = () => {
    switch (profileType) {
      // 본인일때 친구 목록 버튼
      case 'self':
        return (
          <Link
            to="/friend"
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg border flex items-center"
          >
            <Users className="w-4 h-4 mr-1" />
            친구 목록
          </Link>
        );
      // 아무 관계가 아닐때 친구 추가 버튼
      case 'stranger':
        return (
          <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg">
            친구 추가
          </button>
        );
      // 친구일때 메시지 버튼
      case 'friend':
        return (
          <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg">
            메시지
          </button>
        );
      // 친구 요청을 기다리는 중일때 수락 대기 중 버튼
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

  // 프로필 기본 구성 정보
  // 활동 날짜와 오늘의 날짜를 계산하기 위한 로직
  const today = new Date();
  const daysSinceJoin = Math.floor(
    (today.getTime() - new Date(createDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="relative">
      {/* 배경 이미지 */}
      <div className="h-60 bg-gradient-to-r from-blue-300 to-green-300 relative overflow-hidden">
        <img
          src={`/api/user/view/background/${userId}`}
          alt="background"
          className="w-full h-60 object-cover cursor-pointer"
          onClick={() => setPreviewImage(`/api/user/view/background/${userId}`)}
        />

        {/* 버튼 (배경 위로 올리기) */}
        <div className="absolute top-0 right-2 z-20">
          <ProfileBarContent
            userId={userId}
            profileType={profileType}
            isVerified={isVerified}
          />
        </div>
      </div>

      {/* 프로필 정보 */}
      <div className="bg-white px-4 mt-3 rounded-t-3xl relative z-10">
        <div className="flex items-center space-x-3 mb-4">
          <img
            src={`/api/user/view/profile/${userId}`}
            alt={`${name} 프로필`}
            className="w-12 h-12 object-cover rounded-full cursor-pointer"
            onClick={() => setPreviewImage(`/api/user/view/profile/${userId}`)}
          />
          <div className="flex-1">
            <div className="flex items-start space-x-2">
              <div className="flex flex-col">
                <h1 className="font-semibold text-gray-900 text-sm leading-tight">{name}</h1>
                <p className="text-xs text-gray-500 leading-tight">@{nickname}</p>
              </div>
              {isVerified && (
                <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
          </div>
          {renderButton()}
        </div>

        <div className="text-gray-900 text-base mb-2 whitespace-pre-line">
          {description}
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
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="preview"
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default ProfileContent;
