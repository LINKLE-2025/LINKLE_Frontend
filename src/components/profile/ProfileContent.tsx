import React from 'react';
import { User, Users, MessageSquare, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FriendSummary {
  id: number;
  name: string;
  username: string;
}

// profile 메인 영역을 보여줌
// 본인, 친구, 친구가 아닌 사람 각각 보여주는 영역이 달라짐
interface ProfileContentProps {
  userId: number; 
  profileType: 'self' | 'friend' | 'stranger' | 'wait';
  name: string;
  username: string;
  description: string;
  createDate: string;
  isVerified?: boolean;
  friendList: FriendSummary[];
}

const ProfileContent: React.FC<ProfileContentProps> = ({
  userId,
  profileType,
  name,
  username,
  description,
  createDate,
  isVerified = false,
  friendList,
}) => {
  const renderButton = () => {
    switch (profileType) {
      // 본인일 경우 친구 목록 버튼 활성화
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
      // 친구가 아닐 경우 친구 추가 버튼 활성화
      case 'stranger':
        return (
          <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg">
            친구 추가
          </button>
        );
      // 친구일 경우 메시지 버튼 활성화
      case 'friend':
        return (
          <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg">
            메시지
          </button>
        );
      // 친구 신쳥을 보내고 답을 못받았을 경우 수락 대기중 버튼 변경 클릭 금지
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
  // 오늘 날짜
const today = new Date();
const dateString = today.toLocaleDateString();
const daysSinceJoin = Math.floor(
  (today.getTime() - new Date(createDate).getTime()) / (1000 * 60 * 60 * 24)
);
  return (
    <div className="relative">
      {/* 배경 이미지 */}
      <div className="h-32 bg-gradient-to-r from-blue-300 to-green-300 relative overflow-hidden">
        {/* 해당 경로를 minio 경로로 수정 예정 */}
        <img
          src={`/api/user/view/background/${userId}`}
          alt="background"
          className="w-full h-32 object-cover"
        />
      </div>

      {/* 프로필 정보 */}
      <div className="bg-white px-4 py-6 -mt-4 rounded-t-3xl relative z-10">
        <div className="flex items-center space-x-3 mb-4">
        <img
          src={`/api/user/view/profile/${userId}`}
          alt={`${name} 프로필`}
          className="w-12 h-12 object-cover rounded-full"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.insertAdjacentHTML(
              "afterend",
              '<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A9.953 9.953 0 0112 15c2.485 0 4.735.896 6.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>'
            );
          }}
        />
          {/* <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-7 h-7 text-white" />
          </div> */}
          <div className="flex-1">
            <div className="flex items-center space-x-1 mb-1">
              {/* 프로필 상단 이름을 보여줌 */}
              <h1 className="font-semibold text-gray-900 text-lg">{name}</h1>
              {/* 본인일 경우 isVerified 활성화 */}
              {isVerified && (
                <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            {/* 유저 이름 보여줌 */}
            <p className="text-sm text-gray-500">@{username}</p>
          </div>
          {/* 누구인지에 따라 해당 버튼 활성화 */}
          {renderButton()}
        </div>

        <div className="text-gray-900 text-base mb-4 whitespace-pre-line">
          {/* 요약 정보 표시 */}
          {description}
        </div>

        <div className="space-y-1 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <span>📍</span>
            {/* 현재 친구 수 전달 */}
            <span>{friendList.length}명의 친구</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🏢</span>
            {/* 가입이 기준 며칠동안 유지됬는지 확인 */}
            <span>{daysSinceJoin}일째 활동 중</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📅</span>
            {/* 가입날짜 */}
            <span>{createDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;