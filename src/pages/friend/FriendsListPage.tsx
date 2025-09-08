import React, { useState, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import { Search, Users, ChevronRight } from 'lucide-react';

import FriendItem from '../../components/friend/FriendItem';
import { FriendResponse } from "@/types/friend";

function FriendsListPage() {
  // 친구 검색
  const [searchQuery, setSearchQuery] = useState('');
  // 친구 목록 저장
  const [friendList, setFriendList] = useState<FriendResponse[]>([]);
  // 받은 친구 요청 수
  const [receivedCount, setReceivedCount] = useState<number>(0);

  // 검색어에 따른 친구 목록 필터링
  const filteredFriends = friendList.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 로그인한 유저 아이디
  const loggedInUserId = 1;

  useEffect(() => {
    // 유저의 친구 목록 가져오기
    fetch(`/api/friend/${loggedInUserId}`)
      .then((res) => res.json())
      .then((data: FriendResponse[]) => {
        setFriendList(data);
      })
      .catch((err) => console.error(err));

    // 받은 친구 요청 수 가져오기
    fetch(`/api/friend/received?user_id2=${loggedInUserId}`)
      .then((res) => res.json())
      .then((data: FriendResponse[]) => setReceivedCount(data.length))
      .catch((err) => console.error(err));

  }, [loggedInUserId]);

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen flex flex-col">
      {/* 검색 헤더 */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="친구 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 친구 요청 버튼 */}
      <div className="bg-white mb-2">
        <Link to="/received" className="text-gray-900 font-medium">
          <button
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50"
            onClick={() => console.log('친구 요청 화면으로 이동')}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              {receivedCount}명의 친구 요청
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </Link>
      </div>

      {/* 친구 목록 제목 */}
      <div className="px-4 py-2">
        <h2 className="text-sm text-gray-500 font-medium">친구 목록</h2>
      </div>

      {/* 친구 목록 */}
      <div className="bg-white flex-1">
        {filteredFriends.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredFriends.map((friend) => (
              <FriendItem
                key={friend.friendId}
                id={friend.userId1 === loggedInUserId ? friend.userId2 : friend.userId1}
                name={friend.name}
                nickname={friend.nickname}
                buttonType={friend.state === 'ACCEPTED' ? '메시지' : '친구 추가'}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-400 text-sm">검색 결과가 없습니다</p>
          </div>
        )}
      </div>

      {/* Footer */}
    </div>
  );
}

export default FriendsListPage;
