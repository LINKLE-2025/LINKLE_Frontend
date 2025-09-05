// src/pages/PostDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import PostForm, { LinkerLite } from "@/components/post/PostForm";

type PostDTO = {
  postId: number;
  image?: string | null;
  memo?: string | null;
  createdDate?: string;
  userId: number;
  linker: LinkerLite; // { linkerId, name, address? } 형태로 내려온다고 가정
};

export default function PostDetailPage(): React.ReactElement {
  const { footerHeight } = useOutletContext<{ headerHeight: number; footerHeight: number }>();

  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const goToLinkerOnMap = () => {
    if (!post?.linker?.linkerId) return;
    navigate("/map", { state: { openLinkerId: post.linker.linkerId } });
  };

  const [post, setPost] = useState<PostDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // TODO: 로그인 연동 시 실제 유저 ID 사용
  const currentUserId = 1;

  // 편집 모드 on off
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!postId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/post/${postId}`, { credentials: "include" });
        if (!res.ok) throw new Error(`포스트 조회 실패 (${res.status})`);
        const j: PostDTO = await res.json();
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
      const form = new FormData();
      form.append("content", text);
      if (file) form.append("image", file);

      const res = await fetch(`/api/post/${postId}`, {
        method: "PUT",
        body: form,
        credentials: "include",
      });
      if (!res.ok) throw new Error(`수정 실패 (${res.status})`);

      alert("수정 완료");
      navigate("/post/" + postId, { replace: true }); //수정이니까 수정잘 된 페이지 보여주기
      //navigate("/map", { replace: true });
      //navigate(-1); <- 이전 페이지가 맵이 아닐 수도 있어서 맵으로 고정
    } catch (e: any) {
      alert(e?.message ?? "수정 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/post/${postId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error(`삭제 실패 (${res.status})`);
      alert("삭제 완료");
      navigate("/map", { replace: true }); //삭제 후 맵으로 이동
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div className='p-6 text-gray-500'>불러오는 중…</div>;
  if (error) return <div className='p-6 text-red-500'>{error}</div>;
  if (!post) return <div className='p-6 text-gray-400'>포스트 없음</div>;

  //포스트 작성자가 현재 로그인한 유저인지 확인
  const isMine = post.userId === currentUserId;

  return (
    <div className='flex w-full flex-col'>
      {/* 헤더 */}
      <div className='h-12 flex items-center justify-center relative bg-white border-b'>
        <button
          className='absolute left-3 text-[22px]'
          onClick={() => (isEditing ? setIsEditing(false) : navigate(-1))}
          aria-label='back'
        >
          <span className='inline-block -translate-y-[1px]'>‹</span>
        </button>

        <div className='text-[15px] font-semibold'>{isEditing ? "포스트 편집" : "포스트"}</div>

        {/* 우측: 편집 토글/완료 버튼 */}
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
        initialImageUrl={post.image ? `/api/post/${post.postId}/image` : null} // 초기 이미지
        submitting={submitting}
        submitLabel='수정하기'
        onSubmit={handleUpdate} // PostForm 내부 버튼이 호출
        onDelete={handleDelete} // 삭제 버튼 동작
        readOnly={!(isMine && isEditing)} // 내 글만 수정 가능
        showDeleteButton={isMine} // 내 글일 때만 삭제 버튼 노출
        footerOffset={footerHeight}
      />
    </div>
  );
}
