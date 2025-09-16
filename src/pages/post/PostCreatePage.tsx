// src/pages/PostCreatePage.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import PostForm, { LinkerLite } from "@/components/post/PostForm";
import { createPost, getLinker } from "@/api/postApi";
import { getCurrentUserId } from "@/api/authApi"; // ✅ userId만 가져옴
import BackTitleHeader from "@/components/header/BackTitleHeader";
import { useUserProfile } from "@/hooks/useUserProfile"; // ✅ 추가

export default function PostCreatePage(): React.ReactElement {
  const { footerHeight } = useOutletContext<{ headerHeight: number; footerHeight: number }>();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const location = useLocation() as { state?: { linker?: LinkerLite } };

  const linkerId = sp.get("linkerId");
  const [linker, setLinker] = useState<LinkerLite | null>(location.state?.linker ?? null);
  const [submitting, setSubmitting] = useState(false);

  // ✅ 현재 로그인한 사용자 ID
  const [meId, setMeId] = useState<number | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const id = await getCurrentUserId();
        setMeId(Number(id));
      } catch (e) {
        console.error("현재 사용자 ID 불러오기 실패", e);
      }
    })();
  }, []);

  // ✅ 프로필 훅 (이름, 닉네임, 기본 이미지까지 알아서 처리)
  const meProfile = useUserProfile(meId ?? undefined);

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
    if (!meId) {
      alert("로그인한 사용자 정보를 불러오지 못했습니다. 다시 시도해주세요.");
      return;
    }
    try {
      setSubmitting(true);
      await createPost(linkerId, text, file, meId.toString());
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
    <div className="flex w-full flex-col">
      <BackTitleHeader title="새 포스트 만들기" className="bg-white" />
      <PostForm
        linker={linker ?? undefined}
        submitting={submitting}
        submitLabel="작성하기"
        onClickLinker={goToLinkerOnMap}
        onSubmit={handleSubmit}
        footerOffset={footerHeight}
        showDeleteButton={false}
        name={meProfile?.name}
        userNickname={meProfile?.nickname}
        profileImageUrl={meProfile?.profileImageUrl}
      />
    </div>
  );
}
