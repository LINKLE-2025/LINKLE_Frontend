//

import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import PostForm, { LinkerLite } from "@/components/post/PostForm";
import { getPost, updatePost, deletePost } from "@/api/postApi";

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

  const currentUserId = 1; // TODO: 로그인 연동 시 교체
  const isMine = post?.userId === currentUserId;


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
      navigate("/post/" + postId, { replace: true });
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

  if (loading) return <div className='p-6 text-gray-500'>불러오는 중…</div>;
  if (error) return <div className='p-6 text-red-500'>{error}</div>;
  if (!post) return <div className='p-6 text-gray-400'>포스트 없음</div>;

  return (
    <div className='flex flex-col min-h-screen w-full'>
      {/* 헤더 */}
      <div
        className="
          sticky top-0 z-20
          flex items-center justify-center relative
          bg-white border-b
          h-12 pt-[env(safe-area-inset-top)]
        "
      >
        <button
          className='absolute left-3 text-[22px]'
          onClick={() => (isEditing ? setIsEditing(false) : navigate(-1))}
          aria-label='back'
        >
          <span className='inline-block -translate-y-[1px]'>‹</span>
        </button>
        <div className='text-[15px] font-semibold'>{isEditing ? "포스트 편집" : "포스트"}</div>

        {isMine && (
          <div className='absolute right-3 flex items-center gap-2'>
            {!isEditing ? (
              <button
                className='px-3 py-1.5 text-sm rounded bg-black text-white'
                onClick={() => setIsEditing(true)}
              >
                편집
              </button>
            ) : (
              <button
                className='px-3 py-1.5 text-sm rounded bg-gray-200'
                onClick={() => setIsEditing(false)}
              >
                취소
              </button>
            )}
          </div>
        )}
      </div>

      <PostForm
        linker={post.linker}
        initialText={post.memo ?? " "}
        initialImageUrl={post.image ? `/api/post/${post.postId}/image?v=${Date.now()}` : null}
        submitting={submitting}
        submitLabel='수정하기'
        onSubmit={handleUpdate}
        onDelete={handleDelete}
        readOnly={!(isMine && isEditing)}
        showDeleteButton={isMine}
        footerOffset={footerHeight}
        authorName={post.name}
      />
    </div>
  );
}
