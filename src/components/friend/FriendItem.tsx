import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { openDm } from "@/services/chat";
import { fr } from "date-fns/locale";

interface FriendSummary {
  id: number;
  name: string;
  nickname: string;
  friendId: number;
}


interface FriendItemProps {
  id: number; // 대상 유저 ID
  name: string;
  nickname: string;
  buttonType: "메시지" | "친구 추가" | "수락 대기중" | "취소";
  friendId?: number; // 친구 관계 ID (친구 요청 수락/거절/삭제 등에 필요)
  image?: string | null;
  gender?: string;
}

const DEV_UID = Number(import.meta.env.VITE_DEV_USER_ID ?? "1");

function FriendItem({ id, name, nickname, buttonType, friendId, image, gender }: FriendItemProps) {
  const isDefaultImage = image === 'public.png' || !image;

  const profileImageSrc = isDefaultImage
    ? gender === '남성'
      ? '/icons/public/Man.png'
      : '/icons/public/Woman.png'
    : `/api/user/view/profile/${id}`;


  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const handleMessage = async () => {
    if (loading) return;
    if (id === DEV_UID) {
      alert("자기 자신에게는 DM을 보낼 수 없습니다.");
      return;
    }
    setLoading(true);
    try {
      const room = await openDm(id);
      navigate(`/chat/room/${room.roomId}`);
    } catch (e) {
      console.error(e);
      alert("DM을 여는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center space-x-3">
        <Link to={`/profile`} state={{ userId: id, friendId: friendId, gender: gender }}>
          <img
            src={profileImageSrc}
            alt={`${name} 프로필`}
            className={`w-12 h-12 object-cover rounded-full cursor-pointer ${isDefaultImage ? 'opacity-20 bg-blue-100' : ''
              }`}
          />
        </Link>
        <div>
          <h3 className='font-medium text-gray-900'>{name}</h3>
          <p className='text-sm text-gray-500'>@{nickname}</p>
        </div>
      </div>

      {buttonType === "메시지" ? (
        <button
          onClick={handleMessage}
          disabled={loading}
          className='px-4 py-2 text-sm rounded-lg bg-blue-500 text-white disabled:opacity-60'
        >
          {loading ? "여는 중…" : "메시지"}
        </button>
      ) : (
        <button className='px-4 py-2 text-sm rounded-lg bg-blue-500 text-white'>
          {buttonType}
        </button>
      )}
    </div>
  );
}

export default FriendItem;
