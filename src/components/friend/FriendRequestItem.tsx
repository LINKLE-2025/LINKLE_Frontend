import { Link, useLocation } from 'react-router-dom';
import { getProfileImageSrc } from '@/utils/profileUtils';

// 친구 요청을 받거나 보낸 리스트를 보여줌
// Friend Request 정보를 담아 준다.
interface FriendRequestItemProps {
  friendId: number;
  id: number;
  name: string;
  nickname: string;
  avatar: string;
  gender: string;
  image?: string | null;
  type: 'received' | 'sent';
  // 수락/거절/취소를 할때 함수를 활용하여 각각 fetch 요청 처리
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
  onCancel?: (id: number) => void;
}

// React.FC 제거한 함수형 컴포넌트
function FriendRequestItem({
  friendId,
  id,
  name,
  nickname,
  avatar,
  type,
  gender,
  onAccept,
  onReject,
  onCancel,
  image
}: FriendRequestItemProps) {
  const { src: profileImageSrc, isDefault } = getProfileImageSrc(id, image, gender);
  const location = useLocation();
  const pathname = location.pathname;
  return (
    // 친구 리스트에서 각 친구 항목을 표시해주는 영역


    <div className="flex items-center justify-between px-4 py-3">
      {/* 친구 리스트에서 프로필 및 유저 이름 닉네임을 표시해주는 영역 */}
      <div className="flex items-center space-x-3">
        {/* 각 ID값을 활용해 해당 프로필로 이동 */}
        <Link
          to={`/profile`}
          state={{ userId: id, type, friendId, gender, pathname }}
        >
          {/* 프로필 이지미를 보여줌 */}
          <img
            src={profileImageSrc}
            alt={`${name} 프로필`}
            className={`w-12 h-12 object-cover rounded-full cursor-pointer ${isDefault ? 'opacity-20 bg-blue-100' : ''
              }`}

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
            onClick={() => onCancel?.(friendId)}
          >
            취소
          </button>
        )}
      </div>
    </div>

  );
}

export default FriendRequestItem;
