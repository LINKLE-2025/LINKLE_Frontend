import React from 'react';
import { Link } from 'react-router-dom';

// Friend 요약 정보 표시하는 Item 컴포넌트

// Friend 요약 정보 타입
interface FriendItemProps {
  id: number;
  name: string;
  nickname: string;
  buttonType: '메시지' | '친구 추가' | '수락 대기중' | '취소'; // 버튼 타입 추가
}

const FriendItem: React.FC<FriendItemProps> = ({ id, name, nickname, buttonType }) => {
  
  return (
    // 친구 리스트에서 각 친구 항목을 표시해주는 영역
    <div className="flex items-center justify-between px-4 py-3">
      {/* 친구 리스트에서 프로필 및 유저 이름 닉네임을 표시해주는 영역 */}
      <div className="flex items-center space-x-3">
        {/* user의 ID 값을 받아오며 해당 프로필로 이동하는 경로 */}
        <Link to={`/profile`} state={{userId: id}}>
        <img
          src={`/api/user/view/profile/${id}`}
          // 프로필이 보이지 않을 경우 ${name} 프로필이라는 텍스트가 표시된다.
          alt={`${name} 프로필`}
          // 프로필 이미지 둥글게 조절
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
      {/* 해당 친구에게 메시지를 보낼 수 있게 해줌 */}
      <button
        className={`px-4 py-2 text-sm rounded-lg ${
          buttonType === '메시지' ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'
        }`}
      >
        {buttonType}
      </button>
    </div>
  );
};

export default FriendItem;
