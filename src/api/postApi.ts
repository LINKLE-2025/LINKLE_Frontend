// src/api/postApi.ts
import apiClient from "./apiClient";

/** 게시글 생성 */
export const createPost = async (
  linkerId: string,
  text: string,
  file: File,
  loggedInUserId: string,
) => {
  const form = new FormData();
  form.append("linkerId", linkerId);
  form.append("content", text);
  form.append("image", file);
  form.append("userId", loggedInUserId);

  const res = await apiClient.post("/post", form, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });

  return res.data;
};

/** 링커 단건 조회 */
export const getLinker = async (linkerId: string) => {
  const res = await apiClient.get(`/linker/${linkerId}`, { withCredentials: true });
  return res.data;
};

/** 포스트 단건 조회 */
export const getPost = async (postId: string) => {
  const res = await apiClient.get(`/post/${postId}`, { withCredentials: true });
  return res.data;
};

/** 포스트 수정 */
export const updatePost = async (postId: string, text: string, file?: File | null) => {
  const form = new FormData();
  form.append("content", text);
  if (file) form.append("image", file);

  const res = await apiClient.put(`/post/${postId}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
  return res.data;
};

/** 포스트 삭제 */
export const deletePost = async (postId: string) => {
  const res = await apiClient.delete(`/post/${postId}`, { withCredentials: true });
  return res.data;
};
