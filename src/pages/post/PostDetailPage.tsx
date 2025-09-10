import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import PostForm, { LinkerLite } from "@/components/post/PostForm";
import { getPost, updatePost, deletePost } from "@/api/postApi";
import { getCurrentUserId, getCurrentUserInfo } from "@/api/authApi";
import BackTitleHeader from "@/components/header/BackTitleHeader";
//TypeScript interface for PostDTO
//TypeScript란?
// JavaScript에 타입 시스템을 추가한 언어
// -> 변수, 함수, 객체 등에 타입을 지정할 수 있음
// -> 컴파일 시점에서 타입 오류를 잡아줌

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
// DTO: Data Transfer Object
// API에서 받아오는 데이터의 형태를 정의
// 필요한 필드만 정의하면 됨
// API에서 받아오는 데이터에 맞게 수정 필요
// 예: createdDate가 string이 아닐 수도 있음
// 예: userId가 number가 아닐 수도 있음
// 예: image가 null이 아닐 수도 있음
// 예: linker의 address가 없을 수도 있음
// 예: userNickname이 없을 수도 있음
// 등등...

export default function PostDetailPage(): React.ReactElement {
  const { footerHeight } = useOutletContext<{ headerHeight: number; footerHeight: number }>();
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<PostDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  //현재 로그인한 사용자 ID 상태
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  console.log("foot" + footerHeight);
  // 로그인 사용자 정보 가져오기
  useEffect(() => {
    (async () => {
      try {
        const userId = await getCurrentUserId(); // 실제 숫자 or 문자열
        setCurrentUserId(String(userId));        // FormData에 안전하게 string으로 변환
      } catch (e) {
        console.error("현재 사용자 정보 불러오기 실패", e);
      }
    })();
  }, []);


  const isMine = post?.userId === Number(currentUserId);


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
    <div className='flex flex-col min-h-screen w-full'
      style={{ paddingBottom: `${footerHeight}px` }}>
      <BackTitleHeader
        title={isEditing ? "새 포스트 만들기" : "포스트"}
        onBack={isEditing ? () => setIsEditing(false) : undefined}
      />

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
        userNickname={post.userNickname}
        name={post.name}
      />
      {/* <div className='text-[15px] font-semibold'>{isEditing ? "포스트 편집" : "포스트"}</div> */}

      {isMine && (
        <div
          className='fixed bottom-2 right-4 z-40'
          style={{ paddingBottom: footerHeight }}
        >
          {!isEditing ? (
            <button
              className='px-4 py-2'
              onClick={() => setIsEditing(true)}
            >
              <img src="/icons/post/FixPost.png"></img>
            </button>
          ) : null}
        </div>
      )}


    </div>
  );
}
