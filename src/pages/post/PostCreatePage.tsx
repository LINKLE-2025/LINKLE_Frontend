// src/pages/PostCreatePage.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import PostForm, { LinkerLite } from "@/components/post/PostForm";
import { createPost, getLinker } from "@/api/postApi";
import { getCurrentUserId, getCurrentUserInfo } from "@/api/authApi";

export default function PostCreatePage(): React.ReactElement {
  const { footerHeight } = useOutletContext<{ headerHeight: number; footerHeight: number }>();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const location = useLocation() as { state?: { linker?: LinkerLite } };

  const linkerId = sp.get("linkerId");
  const [linker, setLinker] = useState<LinkerLite | null>(location.state?.linker ?? null);
  const [submitting, setSubmitting] = useState(false);


  //현재 로그인한 사용자 ID 상태
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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


  useEffect(() => {
    if (!linkerId) {
      navigate(-1);
    }
  }, [linkerId, navigate]);

  useEffect(() => {
    if (!linker && linkerId) {
      (async () => {
        try {
          const j = await getLinker(linkerId);
          setLinker({ linkerId: j.linkerId, name: j.name, address: j.address ?? j.addressName });
        } catch {
          alert("링커 조회 실패");
        }
      })();
    }
  }, [linker, linkerId]);

  const goToLinkerOnMap = () => {
    if (!linker?.linkerId) return;
    navigate("/map", { state: { openLinkerId: linker.linkerId } });
  };

  const handleSubmit = async ({ text, file }: { text: string; file?: File | null }) => {
    if (!linkerId) return;
    if (!file) {
      alert("사진을 첨부해 주세요.");
      return;
    }
    if (currentUserId == null) {
      alert("로그인한 사용자 정보를 불러오지 못했습니다. 다시 시도해주세요.");
      return;
    }
    try {
      setSubmitting(true);
      await createPost(linkerId, text, file, currentUserId);
      const openId = Number(linker?.linkerId ?? linkerId);
      navigate("/map", { replace: true, state: { openLinkerId: openId } });
    } catch (e: any) {
      alert(e?.message ?? "업로드 실패");
    } finally {
      alert("포스트가 생성되었습니다");
      setSubmitting(false);
    }
  };

  return (
    <div className='flex w-full flex-col'>
      {/* 헤더 */}
      <div className='h-12 flex items-center justify-center relative bg-white border-b'>
        <button
          className='absolute left-3 text-[22px]'
          onClick={() => navigate(-1)}
          aria-label='back'
        >
          <span className='inline-block -translate-y-[1px]'>‹</span>
        </button>
        <div className='text-[15px] font-semibold'>새 포스트 만들기</div>
      </div>

      <PostForm
        linker={linker ?? undefined}
        submitting={submitting}
        submitLabel='작성하기'
        onClickLinker={goToLinkerOnMap}
        onSubmit={handleSubmit}
        footerOffset={footerHeight}
        showDeleteButton={false}
      />
    </div>
  );
}
