import React, { useState, useEffect } from 'react';
import { CalendarDays, MapPinCheck, MapPinned, UserRoundPlus, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ProfileBarContent from '../../components/profile/ProfileBarContent';
import { FriendSummaryWithProfileType, ProfileType } from "@/types/friend";
import { getProfileImageSrc } from '@/utils/profileUtils';
import { sendFriendRequest } from '@/api/friendApi';
import { getCurrentUserId } from '@/api/authApi';
import { openDm } from "@/services/chat";

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
  page?: number;
  totalPages?: number;
  handleSearch?: (query: string, pageNum?: number) => void;
  onFriendRequestSuccess?: () => void;
}

const DEV_UID = await getCurrentUserId().catch(() => { });

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
  onFriendRequestSuccess,
}: ProfileContentProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // profileType을 로컬 상태로 관리
  const [currentType, setCurrentType] = useState<ProfileType>(profileType);

  useEffect(() => {
    setCurrentType(profileType);
  }, [profileType]);

  // 채팅 연결 구현
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const handleMessage = async () => {
    if (loading) return;
    if (userId === DEV_UID) {
      alert("자기 자신에게는 DM을 보낼 수 없습니다.");
      return;
    }
    setLoading(true);
    try {
      const room = await openDm(userId);
      navigate(`/chat/room/${room.roomId}`);
    } catch (e) {
      console.error(e);
      alert("DM을 여는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };



  // 부모에서 내려오는 profileType이 바뀌면 동기화
  useEffect(() => {
    if (profileType !== currentType) {
      setCurrentType(profileType);
    }
  }, [profileType]);
  const [friendCount, setFriendCount] = useState(friendList.length);

  useEffect(() => {
    setFriendCount(friendList.length);
  }, [friendList]);


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

      if (onFriendRequestSuccess) {
        onFriendRequestSuccess();
      }
    } catch (err) {
      console.error("친구 요청 중 오류:", err);
      alert("친구 요청 실패");
    }
  };

  const profileBackgroundSrc = isDefaultBackground
    ? "/icons/profile/Background.png"
    : `/api/user/view/background/${userId}?v=${Date.now()}`;

  const renderButton = () => {
    switch (currentType) {
      case 'self':
        return (
          <Link
            to="/profile/friend"
            className="px-3.5 py-1.5 bg-gray-100/30 hover:bg-gray-100/80 transition-colors text-gray-700 text-xs xxs:text-sm font-bold rounded-lg border flex items-center"
            state={{ friendList }}
          >
            <Users className="w-4 h-4 mr-2.5" strokeWidth={2.2} />
            친구 목록
          </Link>
        );
      case 'stranger':
        return (
          <button
            className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-xs xxs:text-sm rounded-lg flex items-center"
            onClick={() => handleAddFriend(userId)}
          >
            <UserRoundPlus className="w-4 h-4 mr-2.5" strokeWidth={2.2} />
            친구 요청
          </button>
        );
      case 'friend':
        return (
          <button
            onClick={handleMessage}
            disabled={loading}
            className='px-4 py-2 text-sm rounded-lg bg-blue-500 text-white disabled:opacity-60'
          >
            {loading ? "여는 중…" : "메시지"}
          </button>
        );
      case 'wait':
        return (
          <button className="px-3.5 py-1.5 bg-gray-50 text-gray-700 text-xs xxs:text-sm font-bold rounded-lg border flex items-center hover:bg-gray-100 transition-colors">
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
      <div className="relative w-full h-52 overflow-hidden bg-white-200">
        <div className="relative w-full h-60 overflow-hidden bg-gray-500/30">
          <img
            src={profileBackgroundSrc}
            className="absolute inset-0 w-full h-full object-cover cursor-pointer"
            onClick={() => setPreviewImage(profileBackgroundSrc)} // 👈 추가
          />
        </div>
        {/* 상단 바 */}
        <div className="absolute top-0 left-0 w-full z-30">
          <ProfileBarContent
            userId={userId}
            profileType={profileType}
            isVerified={isVerified}
            friendId={friendId}
            gender={gender}
            image={image}
            background={background}
            pathname={pathname}
            onFriendDeleted={() => {
              console.log("onFriendDeleted 호출됨");
              // 프로필의 상태 변경
              setCurrentType("stranger");

              // 검색 결과 목록도 반영
              setSearchResults(prev =>
                prev.map(user =>
                  user.friendUserid === userId
                    ? { ...user, profileType: "stranger" }
                    : user
                )
              );

              // ✅ 친구 목록 다시 패칭
              onFriendRequestSuccess?.()
            }}
          />
        </div>
      </div>

      {/* 프로필 정보 */}
      <div
        className="relative flex flex-col gap-3 z-10 bg-white px-4 pt-3 pb-3.5 min-h-[120px]"
      >
        {/* 프로필 상단 */}
        <div className="flex items-center space-x-3">
          {/* 프로필 이미지 */}
          <div className='relative bg-white rounded-full border border-gray-200 shadow-sm'>
            <img
              src={profileImageSrc}
              alt={`${name} 프로필`}
              className={`w-14 h-14 object-cover rounded-full cursor-pointer ${isDefault ? 'opacity-65 bg-blue-100' : ''}`}
              onClick={() => setPreviewImage(profileImageSrc)}
            />
          </div>
          {/* 사용자 이름 및 닉네임 */}
          <div className="flex-1 pl-1">
            <div className="flex items-start space-x-2">
              <div className="flex flex-col">
                <h1 className="flex flex-grow gap-1 font-bold text-black text-base xxs:text-xl leading-tight">
                  {name}
                  {currentType === 'self' && (<img src="/icons/profile/isSelf.svg" alt={`본인 프로필`} />)}
                </h1>
                <p className="text-sm text-gray-500 leading-tight">@{nickname}</p>
              </div>
            </div>
          </div>
          {/* 버튼 렌더링 */}
          <div className="self-start mt-1.5">
            {renderButton()}
          </div>
        </div>

        {/* 소개 */}
        {memo && (
          <div className="text-left text-linkleGray text-base whitespace-pre-line">
            {memo}
          </div>
        )}

        {/* 친구 수, 활동 일수, 가입일 */}
        <div className="space-y-1 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span>👥</span>
            {/* <Users className="w-3.5 h-3.5" strokeWidth={2} /> */}
            <span>{friendCount}명의 친구</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🗺️</span>
            {/* <MapPinned className="w-3.5 h-3.5" strokeWidth={2} /> */}
            <span>{daysSinceJoin}일 동안 활동 중</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📅</span>
            {/* <CalendarDays className="w-3.5 h-3.5" strokeWidth={2} /> */}
            <span>{createDate} 가입</span>
          </div>
        </div>
      </div>


      {/* 이미지 프리뷰 모달 */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 
                      transition-opacity duration-150 opacity-100"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg" />
        </div>
      )}
    </div>
  );
}

export default ProfileContent;
