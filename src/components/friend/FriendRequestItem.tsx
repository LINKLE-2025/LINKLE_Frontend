import React from 'react';
import { Link } from 'react-router-dom';


// 친구 요청을 받거나 보낸 리스트를 보여줌
// Friend Request 정보를 담아 준다.
interface FriendRequestItemProps {
  friendId: number;
  id: number;
  name: string;
  nickname: string;
  avatar: string;
  type: 'received' | 'sent';
  // 수락/거절/취소를 할때 함수를 활용하여 각각 fetch 요청 처리
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
  onCancel?: (id: number) => void;
}

const FriendRequestItem: React.FC<FriendRequestItemProps> = ({friendId, id, name, nickname, avatar, type, onAccept, onReject, onCancel }) => {
  return (
    // 친구 리스트에서 각 친구 항목을 표시해주는 영역
    <div className="flex items-center justify-between px-4 py-3">
      {/* 친구 리스트에서 프로필 및 유저 이름 닉네임을 표시해주는 영역 */}
      <div className="flex items-center space-x-3">
        {/* 각 ID값을 활용해 해당 프로필로 이동 */}
        <Link
        to={`/profile`}
        state={{userId:id, type, friendId }}
        >
        {/* 프로필 이지미를 보여줌 */}
        <img
          src={`/api/user/view/profile/${id}`}
          alt={`${name} 프로필`}
          className="w-12 h-12 object-cover rounded-full"
          // 예외 처리 이미지 로드 실패시 실행 시켜주는 함수
          onError={(e) => {
            e.currentTarget.style.display = "none";
            // 회색 기본 프로필 아이콘을 DOM에 추가해 준다.
            e.currentTarget.insertAdjacentHTML(
              "afterend",
              '<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A9.953 9.953 0 0112 15c2.485 0 4.735.896 6.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>'
            );
          }}
        />
        </Link>
        {/* 친구 이름과 닉네임을 보여줌 */}
        <div>
          <h3 className="font-medium text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">@{nickname}</p>
        </div>
      </div>
      {/* 해당 type에 따라 버튼을 보여주는 것을 조절해주고 해당 버튼을 클릭했을때 반응을 조절해주도록 한다. */}
      <div className="flex space-x-2">
      {type === 'received' ? (
        <>
          <button
            className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white"
            onClick={() => onAccept?.(friendId)}
          >
            수락
          </button>
          <button
            className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white"
            onClick={() => onReject?.(friendId)}
          >
            거절
          </button>
        </>
      ) : (
        <button
          className="px-4 py-2 text-sm rounded-lg bg-gray-200 text-gray-700"
          onClick={() => onReject?.(friendId)}
        >
          취소
        </button>
      )}
      </div>
    </div>
  );
};

export default FriendRequestItem;
