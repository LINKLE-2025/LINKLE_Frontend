import { UserResponseDTO } from "@/types/user";
import apiClient from "./apiClient";

// 유저 정보 불러오기
export const getUserProfile = async (userId: number) => {
  const res = await apiClient.get(`/user/${userId}`);
  return res.data;
}

// 포스트 목록 불러오기
export const getUserPosts = async (userId: number) => {
  const res = await apiClient.get(`/post/user/${userId}`);
  return res.data;
};

// 프로필 수정
export const patchUserProfile = async (
  userId: number,
  profileData: {
    name: string;
    password?: string;
    nickname: string;
  },
  files: { profile?: File | null; background?: File | null }
) => {
  const formData = new FormData();
  formData.append("name", profileData.name);
  if (profileData.password) {
    formData.append("password", profileData.password);
  }
  formData.append("nickname", profileData.nickname);
  if (files.profile) {
    formData.append("profile", files.profile);
  }
  if (files.background) {
    formData.append("background", files.background);
  }

  const res = await apiClient.patch(`/user/${userId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 링커 참여 내역 통계 불러오기
export const getLinkerStats = async (userId: number) => {
  const res = await apiClient.post(`/user/linker/history`, { userId });
  return res.data;
};

// 링커 참여 내역 불러오기
export const getLinkerParticipations = async (userId: number) => {
  const res = await apiClient.post(`/user/linker/list`, { userId });
  return res.data;
};

// 현재 보고 있는 프로필 기준 아이디값으로 친구 목록 불러오기
export const getFriendList = async (userId: number) => {
  const res = await apiClient.get(`/friend/${userId}`);
  return res.data;
};

// 프로필 이미지 보기
export const getProfileImage = (userId: number, v?: number) => {
  return `/api/user/view/profile/${userId}${v ? `?v=${v}` : ""}`;
};

// 배경 이미지 보기
export const getBackgroundImage = (userId: number, v?: number) => {
  return `/api/user/view/background/${userId}${v ? `?v=${v}` : ""}`;
};
