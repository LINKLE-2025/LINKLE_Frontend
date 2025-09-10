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

type OutletContextType = { loggedInUserId: number };

function FriendRequestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(''); // 🔹 디바운스된 검색어
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [receivedRequests, setReceivedRequests] = useState<FriendResponse[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendResponse[]>([]);

  const isEmpty = receivedRequests.length === 0 && sentRequests.length === 0;

  // 🔹 디바운스 처리
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 🔹 필터링
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

  const { loggedInUserId } = useOutletContext<OutletContextType>();
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
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen flex flex-col pb-24">
      {/* 검색 헤더 - FriendsListPage와 동일 */}
      <div className="bg-white px-4 py-3 border-b flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="친구 요청 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="button"
          className="px-3 py-2 text-sm text-gray-600 hover:text-blue-600"
          onClick={() => setDebouncedQuery(searchQuery)} // 즉시 검색
        >
          <img src="/icons/mapicon/search.png" className="w-5 h-5" />
        </button>
      </div>

      {/* 본문 */}
      {isEmpty ? (
        <EmptyState />
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
              <div className="bg-white divide-y divide-gray-100">
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
              <div className="bg-white divide-y divide-gray-100">
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
