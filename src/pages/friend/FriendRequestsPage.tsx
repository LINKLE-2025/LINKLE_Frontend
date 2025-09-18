import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useParams } from "react-router-dom";

import FriendRequestItem from '../../components/friend/FriendRequestItem';
import EmptyState from '../../components/friend/EmptyState';
import { UserResponseDTO } from '@/types/user';
import { FriendResponse } from "@/types/friend";

import { useOutletContext } from "react-router-dom";
import {
  acceptFriendRequest,
  rejectFriendRequest,
  deleteFriend,
  getReceivedFriendRequests,
  getSentFriendRequests
} from '@/api/friendApi';
import { getUserProfile } from '@/api/profileApi';

import { useFriendFilter } from "@/hooks/useFriendFilter";
import { getCurrentUserId } from '@/api/authApi';
import SearchBar from '@/components/common/SearchBar';
import SearchHeader from '@/components/header/SearchHeader';

type OutletContextType = {
  headerHeight: number;
  footerHeight: number;
};
function FriendRequestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [receivedRequests, setReceivedRequests] = useState<FriendResponse[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendResponse[]>([]);

  const isEmpty = receivedRequests.length === 0 && sentRequests.length === 0;

  // 디바운스 처리
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 필터링
  const filteredReceived = useFriendFilter(receivedRequests, debouncedQuery);
  const filteredSent = useFriendFilter(sentRequests, debouncedQuery);

  const handleAccept = async (friendId: number) => {
    try {
      await acceptFriendRequest(friendId);
      setReceivedRequests(prev => prev.filter(req => req.friendId !== friendId));
    } catch (err) {
      console.error("친구 수락 실패:", err);
    }
  };

  const handleReject = async (friend: FriendResponse) => {
    try {
      await rejectFriendRequest(friend);
      setReceivedRequests(prev =>
        prev.filter(req => req.friendId !== friend.friendId)
      );
    } catch (err) {
      console.error("친구 거절 실패:", err);
    }
  };

  const handleCancel = async (friendId: number) => {
    try {
      await deleteFriend(friendId);
      setSentRequests(prev => prev.filter(req => req.friendId !== friendId));
    } catch (err) {
      console.error("친구 요청 취소 실패:", err);
    }
  };

  const { headerHeight, footerHeight } =
    useOutletContext<OutletContextType>();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);


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


  const { userId: profileUserIdParam } = useParams<{ userId: string }>();
  const profileUserId = profileUserIdParam ? Number(profileUserIdParam) : loggedInUserId;


  // 데이터 패칭
  useEffect(() => {
    if (!profileUserId) return;
    (async () => {
      try {
        const [userData, received, sent] = await Promise.all([
          getUserProfile(profileUserId),
          getReceivedFriendRequests(profileUserId),
          getSentFriendRequests(profileUserId),
        ]);
        setUser(userData);
        setReceivedRequests(received);
        setSentRequests(sent);
      } catch (err) {
        console.error("프로필 관련 데이터 불러오기 실패:", err);
      }
    })();
  }, [profileUserId]);

  return (
    <div
      className="max-w-full mx-auto bg-white min-h-screen flex flex-col"
    >
      {/* 검색 헤더 - FriendsListPage와 동일 */}
      <SearchHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={() => setDebouncedQuery(searchQuery)}
        placeholder="친구 검색"
      />

      {/* 본문 */}
      {isEmpty ? (
        <EmptyState footerHeight={footerHeight} />
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* 받은 요청 */}
          {filteredReceived.length > 0 && (
            <div className="mb-6">
              <div className="px-4 py-3">
                <h2 className="text-lg text-gray-900 font-semibold">
                  {filteredReceived.length}명의 친구 요청
                </h2>
              </div>
              <div className="divide-y divide-white-100">
                {filteredReceived.map((request) => (
                  <FriendRequestItem
                    key={request.friendId}
                    id={request.userId1 === loggedInUserId ? request.userId2 : request.userId1}
                    friendId={request.friendId}
                    name={request.name}
                    nickname={request.nickname}
                    gender={request.gender ?? "남성"}
                    image={request.image}
                    avatar="bg-blue-500"
                    type="received"
                    onAccept={handleAccept}
                    onReject={() => handleReject(request)}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 보낸 요청 */}
          {filteredSent.length > 0 && (
            <div>
              <div className="px-4 py-3">
                <h2 className="text-lg text-gray-900 font-semibold">
                  {filteredSent.length}명 수락 대기 중
                </h2>
              </div>
              <div className="divide-y divide-white-100">
                {filteredSent.map((request) => (
                  <FriendRequestItem
                    key={request.friendId}
                    id={request.userId1 === loggedInUserId ? request.userId2 : request.userId1}
                    friendId={request.friendId}
                    name={request.name}
                    nickname={request.nickname}
                    gender={request.gender ?? "남성"}
                    image={request.image}
                    avatar="bg-blue-500"
                    type="sent"
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FriendRequestsPage;
