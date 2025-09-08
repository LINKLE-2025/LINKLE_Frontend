// import

// 유저가 참여한 링커
export interface UserParticipateLinkerDTO {
  linkerId: number;
  name: string;
  participatedDate: string;
  memo: string;
  linkerState: string;
}

// 프로필 수정 요청 DTO
export type ProfileDTO = {
  name: string;
  password?: string;
  nickname: string;
  gender: string;
  intro: string;
  email: string;
};

// 백엔드 응답 DTO
export type UserResponseDTO = {
  userId: number;
  name: string;
  nickname: string;
  gender: string;
  intro: string;
  description: string;
  createdDate: string;
  verified: boolean;
  email: string;
  image?: string | null;
  background?: string | null;
};

export type ProfilePostDTO = {
  postId: number;
  image?: string;
  memo: string;
  createdDate: string;
  userId: number;
}

export type ProfileLinkerCountDTO = {
  categoryId: number;
  count: number;
}

// 이미지 조회 URL 헬퍼
export function profileImageUrl(userId: number, v?: number) {
  return `/api/user/view/profile/${userId}${v ? `?v=${v}` : ""}`;
}
export function backgroundImageUrl(userId: number, v?: number) {
  return `/api/user/view/background/${userId}${v ? `?v=${v}` : ""}`;
}

