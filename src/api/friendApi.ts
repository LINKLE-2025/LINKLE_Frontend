import apiClient from "./apiClient";
import { FriendResponse } from "@/types/friend";

// 친구 목록 조회
export const getFriends = async (userId: number) => {
    const res = await apiClient.get<FriendResponse[]>(`/friend/${userId}`);
    return res.data;
}

export const getAllFriends = async (userId: number) => {
    const res = await apiClient.get<FriendResponse[]>(`/friend/list/${userId}`);
    return res.data;
}

// 친구 요청
export const sendFriendRequest = async (userId1: number, userId2: number) => {
    const res = await apiClient.post(`/friend`, { userId1, userId2 });
    return res.data;
}

// 친구 요청 수락
// 요청 수락 /api/friend/${friendId}/reception (PUT)
export const acceptFriendRequest = async (friendId: number) => {
    const res = await apiClient.put(`/friend/${friendId}/reception`);
    return res.data;
}

// 친구 요청 거절
// 친구 요청 거절 /api/friend/refusal (POST)
export const rejectFriendRequest = async (friend: FriendResponse) => {
    const res = await apiClient.delete(`/friend/${friend.friendId}`, {
        data: {
            userId1: friend.userId1,
            userId2: friend.userId2,
            state: friend.state,
        },
    });
    return res.data;
};

// 친구 삭제
export const deleteFriend = async (friendId: number) => {
    return await apiClient.delete(`/friend/${friendId}`);
};

// 받은 요청 목록
export const getReceivedFriendRequests = async (userId: number) => {
    const res = await apiClient.get<FriendResponse[]>(`/friend/received`, {
        params: { user_id2: userId },   // 서버가 요구하는 key 이름
    });
    return res.data;
};

// 보낸 요청 목록
export const getSentFriendRequests = async (userId: number) => {
    const res = await apiClient.get<FriendResponse[]>(`/friend/sent`, {
        params: { user_id1: userId },   // 서버가 요구하는 key 이름
    });
    return res.data;
};


// 친구 관계 단건 조회
export const getFriendRelationship = async (userId1: number, userId2: number) => {
    const res = await apiClient.get(`/friend/relationship`, {
      params: { userId1, userId2 },
    });
    return res.data as {
      exists: boolean;
      friendId?: number;
      state: "ACCEPTED" | "REQUESTED" | "NONE";
      userId1?: number;
      userId2?: number;
    };
  };
