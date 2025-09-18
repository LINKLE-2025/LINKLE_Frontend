import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from "react-router-dom";
import { Search, Users, ChevronRight } from 'lucide-react';

import FriendItem from '../../components/friend/FriendItem';
import { FriendResponse } from "@/types/friend";
import { useOutletContext } from "react-router-dom";

import { getFriends, getReceivedFriendRequests } from "@/api/friendApi";
import { useFriendFilter } from "@/hooks/useFriendFilter";
import { getCurrentUserId } from '@/api/authApi';
import SearchBar from '@/components/common/SearchBar';
import SearchHeader from '@/components/header/SearchHeader';

type OutletContextType = {
  headerHeight: number;
  footerHeight: number;
};

function FriendsListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(''); // 디바운스된 검색어
  const [friendList, setFriendList] = useState<FriendResponse[]>([]);
  const [receivedCount, setReceivedCount] = useState<number>(0);

  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);



  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    }, 0); // 다음 tick에서 실행

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const userId = await getCurrentUserId();
        setLoggedInUserId(userId);
      } catch (err) {
        console.error("현재 유저 ID 불러오기 실패:", err);
      } finally {
        setIsAuthLoading(false);
      }
    })();
  }, []);


  const { footerHeight } =
    useOutletContext<OutletContextType>();


  const location = useLocation();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler); // cleanup
  }, [searchQuery]);

  // 디바운스된 검색어로 필터링
  const filteredFriends = useFriendFilter(friendList, debouncedQuery);

  useEffect(() => {
    (async () => {
      try {
        if (!loggedInUserId) return;
        const data = await getFriends(loggedInUserId);
        setFriendList(data);
      } catch (err) {
        console.error("친구 목록 불러오기 실패:", err);
      }
    })();

    (async () => {
      try {
        if (!loggedInUserId) return;
        const data = await getReceivedFriendRequests(loggedInUserId);
        setReceivedCount(data.length);
      } catch (err) {
        console.error("친구 요청 수 불러오기 실패:", err);
      }
    })();
  }, [loggedInUserId, location.key]);

  return (
    <div
      className="max-w-full mx-auto bg-white-100 min-h-screen flex flex-col"
    >
      {/* 검색 헤더 */}
      <SearchHeader
        ref={headerRef}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={() => setDebouncedQuery(searchQuery)}

      />

      {/* 친구 요청 버튼 */}
      <div className="bg-white m-3 z-10">
        <Link to="/profile/friend/received" className="text-gray-900 font-medium">
          <button
            className="w-full  flex items-center justify-between px-5 py-3.5 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-200/80"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mr-2">
                <img src="/icons/friend/User.png" />
              </div>
              {receivedCount}명의 친구 요청
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </Link>
      </div>

      {/* 친구 목록 */}

      <div className="bg-white flex-1"
      >
        {(debouncedQuery ? filteredFriends : friendList).length > 0 ? (
          <div className="divide-y divide-white-100">
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
          <div className="flex items-center justify-center py-20"

          >
            <p className="text-gray-400 text-sm">검색 결과가 없습니다</p>
          </div>
        )}
      </div>


    </div>
  );
}

export default FriendsListPage;
