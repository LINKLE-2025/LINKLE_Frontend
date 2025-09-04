import React from 'react';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FriendRequestItemProps {
  friendId: number;
  id: number;
  name: string;
  username: string;
  avatar: string;
  type: 'received' | 'sent';
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
  onCancel?: (id: number) => void;
}

const FriendRequestItem: React.FC<FriendRequestItemProps> = ({friendId, id, name, username, avatar, type, onAccept, onReject, onCancel }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center space-x-3">
        <Link to={`/profile/${id}`} >
        <img
          src={`/api/user/view/profile/${id}`}
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
        </Link>
        <div>
          <h3 className="font-medium text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">@{username}</p>
        </div>
      </div>
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
};

export default FriendRequestItem;
