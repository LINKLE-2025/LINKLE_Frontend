import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useParams } from "react-router-dom";

import FriendRequestItem from '../../components/friend/FriendRequestItem';
import EmptyState from '../../components/friend/EmptyState';
import { UserResponseDTO } from '@/types/user';
import { FriendResponse } from "@/types/friend";

import { RECEIVED_REQUESTS, SENT_REQUESTS } from '../../constants/friendRequests';
import { useOutletContext } from "react-router-dom";

//로그인한 유저 아이디
type OutletContextType = { loggedInUserId: number };
function FriendRequestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [receivedRequests, setReceivedRequests] = useState<FriendResponse[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendResponse[]>([]);
  const [requests, setRequests] = useState<FriendResponse[]>(); // 사용 안함 (필요 시 제거 가능)

  const isEmpty = receivedRequests.length === 0 && sentRequests.length === 0;

  const filteredReceived = receivedRequests.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSent = sentRequests.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAccept = async (friendId: number) => {
    try {
      const res = await fetch(`/api/friend/${friendId}/reception`, {
        method: "PUT"
      });
      if (res.ok) {
        setReceivedRequests(prev => prev.filter(req => req.friendId !== friendId));
      }
    } catch (err) {
      console.error("친구 수락 실패:", err);
    }
  };

  const handleReject = async (friend: FriendResponse) => {
    try {
      const res = await fetch(`/api/friend/refusal`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          friendId: friend.friendId,
          userId1: friend.userId1,
          userId2: friend.userId2,
          state: friend.state
        })
      });
      if (res.ok) {
        setReceivedRequests(prev => prev.filter(req => req.friendId !== friend.friendId));
      }
    } catch (err) {
      console.error("친구 거절 실패:", err);
    }
  };

  
  const { loggedInUserId } = useOutletContext<OutletContextType>();
  // 
  const { userId: profileUserIdParam } = useParams<{ userId: string }>();
  const profileUserId = profileUserIdParam ? Number(profileUserIdParam) : loggedInUserId;

  useEffect(() => {
    if (!profileUserId) return;

    fetch(`/api/user/${profileUserId}`)
      .then((res) => res.json())
      .then((data: UserResponseDTO) => setUser(data))
      .catch((err) => console.error(err));

    fetch(`/api/friend/received?user_id2=${profileUserId}`)
      .then((res) => res.json())
      .then((data: FriendResponse[]) => setReceivedRequests(data))
      .catch((err) => console.error(err));

    fetch(`/api/friend/sent?user_id1=${profileUserId}`)
      .then((res) => res.json())
      .then((data: FriendResponse[]) => setSentRequests(data))
      .catch((err) => console.error(err));
  }, [profileUserId]);

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

      {/* 빈 상태 */}
      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* 받은 친구 요청 */}
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
                    avatar="bg-blue-500"
                    type="received"
                    onAccept={handleAccept}
                    onReject={() => handleReject(request)}
                    onCancel={() => handleReject(request)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 보낸 친구 요청 */}
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
                    avatar="bg-blue-500"
                    type="sent"
                    onAccept={handleAccept}
                    onReject={() => handleReject(request)}
                    onCancel={() => handleReject(request)}
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
