import apiClient from "./apiClient";

// 로그인
export const login = async (email: string, password: string) => {
  const res = await apiClient.post(`/auth/login`, { email, password });
  return res.data;
};

// 회원가입
export const signup = async (data: {
  email: string;
  code: string;
  password: string;
  name: string;
  birth: string;
  gender: string;
  nickname: string;
  agree: boolean[];
}) => {
  const res = await apiClient.post(`/auth/signup`, data);
  return res.data;
};

// 이메일 중복 검사
export const checkEmail = async (email: string) => {
  const res = await apiClient.get(`/auth/email/${encodeURIComponent(email)}`);
  return res.data;
};

// 이메일 인증 코드 발송
export const sendEmailCode = async (email: string) => {
  const res = await apiClient.post(`/auth/email/${encodeURIComponent(email)}`);
  return res.data;
};

// 이메일 인증 코드 검증
export const verifyEmailCode = async (email: string, code: string) => {
  const res = await apiClient.post(`/auth/email/${encodeURIComponent(email)}/code/${code}`);
  return res.data;
};

// 닉네임 중복 검사
export const checkNickname = async (nickname: string) => {
  const res = await apiClient.get(`/auth/nickname/${encodeURIComponent(nickname)}`);
  return res.data;
};

// 현재 로그인한 사용자 ID 조회
export const getCurrentUserId = async () => {
  const res = await apiClient.get(`/auth/me`);
  return res.data.userId;
};

// 현재 로그인한 사용자 정보 조회
export const getCurrentUserInfo = async () => {
  const res = await apiClient.get(`/auth/me`);
  console.log(res.data);
  return res.data;
};

// 로그아웃
export const logout = async () => {
  const res = await apiClient.post(`/auth/logout`);
  return res.data;
};

// 토큰 갱신
export const refreshToken = async () => {
  const res = await apiClient.post(`/auth/refresh`);
  return res.data;
};
