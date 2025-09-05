// src/pages/PostCreatePage.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import PostForm, { LinkerLite } from "@/components/post/PostForm";

export default function PostCreatePage(): React.ReactElement {
  const { footerHeight } = useOutletContext<{ headerHeight: number; footerHeight: number }>();

  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const location = useLocation() as { state?: { linker?: LinkerLite } };

  const linkerId = sp.get("linkerId");
  const [linker, setLinker] = useState<LinkerLite | null>(location.state?.linker ?? null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!linkerId) {
      // 필요하면 alert("잘못된 접근입니다."); 후 이동
      navigate(-1);
    }
  }, [linkerId, navigate]);

  useEffect(() => {
    if (!linker && linkerId) {
      (async () => {
        try {
          const res = await fetch(`/api/linker/${linkerId}`, { credentials: "include" });
          if (!res.ok) throw new Error(`링커 조회 실패 (${res.status})`);
          const j = await res.json();
          setLinker({ linkerId: j.linkerId, name: j.name, address: j.address ?? j.adresssName });
        } catch {}
      })();
    }
  }, [linker, linkerId]);

  const goToLinkerOnMap = () => {
    if (!linker?.linkerId) return;
    navigate("/map", { state: { openLinkerId: linker.linkerId } });
  };

  const handleSubmit = async ({ text, file }: { text: string; file?: File | null }) => {
    if (!linkerId) return;
    //사진 필수
    if (!file) {
      alert("사진을 첨부해 주세요.");
      return;
    }

    try {
      setSubmitting(true);
      const form = new FormData();
      form.append("linkerId", linkerId);
      form.append("content", text);
      if (file) form.append("image", file);

      const res = await fetch("/api/post", { method: "POST", body: form, credentials: "include" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || `게시글 생성 실패 (${res.status})`);
      }

      const openId = Number(linker?.linkerId ?? linkerId);
      navigate("/map", { replace: true, state: { openLinkerId: openId } });
    } catch (e: any) {
      alert(e?.message ?? "업로드 실패");
    } finally {
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
      />
    </div>
  );
}
