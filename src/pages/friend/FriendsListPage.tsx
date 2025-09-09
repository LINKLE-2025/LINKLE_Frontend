import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Search, Users, ChevronRight } from 'lucide-react';

import FriendItem from '../../components/friend/FriendItem';
import { FriendResponse } from "@/types/friend";
import { useOutletContext } from "react-router-dom";

import { getFriends, getReceivedFriendRequests } from "@/api/friendApi";
import { useFriendFilter } from "@/hooks/useFriendFilter";

type OutletContextType = { loggedInUserId: number };

function FriendsListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(''); // 디바운스된 검색어
  const [friendList, setFriendList] = useState<FriendResponse[]>([]);
  const [receivedCount, setReceivedCount] = useState<number>(0);

  const { loggedInUserId } = useOutletContext<OutletContextType>();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler); // cleanup
  }, [searchQuery]);

  // 🔹 디바운스된 검색어로 필터링
  const filteredFriends = useFriendFilter(friendList, debouncedQuery);

  useEffect(() => {
    (async () => {
      try {
        const data = await getFriends(loggedInUserId);
        setFriendList(data);
      } catch (err) {
        console.error("친구 목록 불러오기 실패:", err);
      }
    })();
    (async () => {
      try {
        const data = await getReceivedFriendRequests(loggedInUserId);
        setReceivedCount(data.length);
      } catch (err) {
        console.error("친구 요청 수 불러오기 실패:", err);
      }
    })();
  }, [loggedInUserId]);

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen flex flex-col">
      {/* 검색 헤더 */}
      <div className="bg-white px-4 py-3 border-b flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="친구 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="button"
          className="px-3 py-2 text-sm text-gray-600 hover:text-blue-600"
          onClick={() => setDebouncedQuery(searchQuery)} // 버튼 누르면 즉시 검색
        >
          <img src="/icons/mapicon/search.png" className="w-5 h-5"></img>
        </button>
      </div>

      {/* 친구 요청 버튼 */}
      <div className="bg-white mb-2 border-b">
        <Link to="/received" className="text-gray-900 font-medium">
          <button className="w-full max-w-[calc(100%-2rem)] flex items-center justify-between px-4 py-4 hover:bg-gray-50 rounded-xl shadow-md mb-4 mt-4 ml-4 mr-8" >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mr-2">

                <img src="/icons/friend/User.png"></img>
              </div> {receivedCount}명의 친구 요청
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </Link>
      </div>

      {/* 친구 목록 */}
      <div className="bg-white flex-1">
        {(debouncedQuery ? filteredFriends : friendList).length > 0 ? (
          <div className="divide-y divide-gray-100">
            {(debouncedQuery ? filteredFriends : friendList).map((friend) => (
              <FriendItem
                key={friend.friendId}
                targetUserId={friend.userId1 === loggedInUserId ? friend.userId2 : friend.userId1}
                name={friend.name}
                nickname={friend.nickname}
                buttonType={friend.state === 'ACCEPTED' ? '메시지' : '친구 추가'}
                friendId={friend.friendId}
                image={friend.image}
                gender={friend.gender}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-400 text-sm">검색 결과가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FriendsListPage;
