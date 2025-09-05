import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { openDm } from "@/services/chat";

interface FriendItemProps {
  id: number; // 대상 유저 ID
  name: string;
  username: string;
  buttonType: "메시지" | "친구 추가";
}

const FriendItem: React.FC<FriendItemProps> = ({ id, name, username, buttonType }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleMessage = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const room = await openDm(id); // 존재시 재사용, 없으면 생성
      navigate(`/chat/${room.roomId}`);
    } catch (e) {
      console.error(e);
      alert("DM을 여는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-between px-4 py-3'>
      <div className='flex items-center space-x-3'>
        <Link to={`/profile/${id}`}>
          <img
            src={`/api/user/view/profile/${id}`}
            alt={`${name} 프로필`}
            className='w-12 h-12 object-cover rounded-full'
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.insertAdjacentHTML(
                "afterend",
                '<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A9.953 9.953 0 0112 15c2.485 0 4.735.896 6.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>',
              );
            }}
          />
        </Link>
        <div>
          <h3 className='font-medium text-gray-900'>{name}</h3>
          <p className='text-sm text-gray-500'>@{username}</p>
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
        <button className='px-4 py-2 text-sm rounded-lg bg-blue-500 text-white'>친구 추가</button>
      )}
    </div>
  );
};

export default FriendItem;
