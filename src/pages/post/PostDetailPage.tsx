// src/pages/PostDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import PostForm, { LinkerLite } from "@/components/post/PostForm";
import { getPost, updatePost, deletePost } from "@/api/postApi";
import { getCurrentUserId } from "@/api/authApi";
import BackTitleHeader from "@/components/header/BackTitleHeader";
import { useUserProfile } from "@/hooks/useUserProfile";
import { get } from "http";

type PostDTO = {
  postId: number;
  image?: string | null;
  memo?: string | null;
  createdDate?: string;
  userId: number;
  linker: LinkerLite;
  name: string;
  userNickname: string;
};

export default function PostDetailPage(): React.ReactElement {
  const { footerHeight } = useOutletContext<{ headerHeight: number; footerHeight: number }>();
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<PostDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const userId = await getCurrentUserId();
        setCurrentUserId(String(userId));
      } catch (e) {
        console.error("현재 사용자 정보 불러오기 실패", e);
      }
    })();
  }, []);

  const isMine = post?.userId === Number(currentUserId);
  const profile = useUserProfile(post?.userId);

  useEffect(() => {
    if (!postId) return;
    (async () => {
      try {
        setLoading(true);
        const j = await getPost(postId);
        setPost(j);
      } catch (e: any) {
        setError(e?.message ?? "조회 실패");
      } finally {
        setLoading(false);
      }
    })();
  }, [postId]);

  const handleUpdate = async ({ text, file }: { text: string; file?: File | null }) => {
    if (!postId) return;
    try {
      setSubmitting(true);
      await updatePost(postId, text, file ?? null);
      alert("수정 완료");
      setIsEditing(false);

      const updated = await getPost(postId);
      setPost(updated);
    } catch (e: any) {
      alert(e?.message ?? "수정 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!postId || !window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      setSubmitting(true);
      await deletePost(postId);
      alert("삭제 완료");
      navigate("/map", { replace: true });
    } catch (err) {
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">불러오는 중…</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!post) return <div className="p-6 text-gray-400">포스트 없음</div>;

  return (
    <div className="flex flex-col min-h-screen w-full" style={{ paddingBottom: `${footerHeight}px` }}>
      <BackTitleHeader title={isEditing ? "포스트 수정" : "포스트"} onBack={isEditing ? () => setIsEditing(false) : undefined} />

      <PostForm
        key={`${post.postId}-${isEditing ? "edit" : "view"}`}
        linker={post.linker}
        initialText={post.memo ?? ""}
        initialImageUrl={post.image ? `/api/post/${post.postId}/image?v=${Date.now()}` : null}
        submitting={submitting}
        submitLabel="수정하기"
        onSubmit={handleUpdate}
        onDelete={handleDelete}
        readOnly={!(isMine && isEditing)}
        showDeleteButton={isMine}
        footerOffset={footerHeight}
        name={profile?.name}
        userNickname={profile?.nickname}
        profileImageUrl={profile?.profileImageUrl}
      />

      {isMine && !isEditing && (
        <div className="fixed bottom-2 right-4 z-40" style={{ paddingBottom: footerHeight }}>
          <button className="px-4 py-2" onClick={() => setIsEditing(true)}>
            <img src="/icons/post/FixPost.png" alt="edit" />
          </button>
        </div>
      )}
    </div>
  );
}
