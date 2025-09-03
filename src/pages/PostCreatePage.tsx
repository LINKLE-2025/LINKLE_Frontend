// src/pages/PostCreatePage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

type LinkerLite = {
  linkerId: number;
  name: string;
  address?: string | null;
};

export default function PostCreatePage(): React.ReactElement {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const location = useLocation() as { state?: { linker?: LinkerLite } };

  const linkerId = sp.get("linkerId");
  const linkerFromState = location.state?.linker;

  const [linker, setLinker] = useState<LinkerLite | null>(linkerFromState ?? null);

  // 지도 페이지로 이동 (링커 선택 화면)
  const goToLinkerOnMap = () => {
    if (!linker?.linkerId) return;
    // "/map" 로 가면서 열어줄 링커 ID 전달
    console.log(" navigating with linkerId:", linker.linkerId);
    navigate("/map", { state: { openLinkerId: linker.linkerId } });
  };

  // 텍스트/파일 상태
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 필요 시 백엔드에서 상세 다시 조회
  useEffect(() => {
    if (!linker && linkerId) {
      (async () => {
        try {
          const res = await fetch(`/api/linker/${linkerId}`, { credentials: "include" });
          if (!res.ok) throw new Error(`링커 조회 실패 (${res.status})`);
          const j = await res.json();
          setLinker({ linkerId: j.linkerId, name: j.name, address: j.address ?? j.adresssName });
        } catch (e) {
          // 무시하고 비어있는 UI만
        }
      })();
    }
  }, [linker, linkerId]);

  const canSubmit = useMemo(() => text.trim().length > 0 || files.length > 0, [text, files]);

  const openPicker = () => fileInputRef.current?.click();
  const onChangeFiles: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 기존 미리보기 URL 해제
    previews.forEach((u) => URL.revokeObjectURL(u));

    // 항상 1장만 유지
    setFiles([file]);
    setPreviews([URL.createObjectURL(file)]);

    // 같은 사진 다시 선택 가능하게 초기화
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!canSubmit || !linkerId || submitting) return;

    try {
      setSubmitting(true);

      const form = new FormData();
      form.append("linkerId", linkerId); // 숫자면 String()으로
      form.append("content", text); // 본문
      if (files[0]) form.append("image", files[0]); // 이미지 1장

      const res = await fetch("/api/post", {
        method: "POST",
        body: form,
        credentials: "include",
      });

      if (!res.ok) {
        let msg = "";
        try {
          const j = await res.json();
          msg = j?.message || "";
        } catch {}
        throw new Error(msg || `게시글 생성 실패 (${res.status})`);
      }

      // 작성 완료 후: 맵으로 이동 + 해당 링커 상세 자동 열기 로 구현 예정
      // navigate("/map", { replace: true });
      // → 상세 열기까지 처리
      navigate("/map", { replace: true, state: { openLinkerId: Number(linkerId) } });
    } catch (err: any) {
      alert(err?.message ?? "업로드 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const onReset = () => {
    setText("");
    setFiles([]);
    previews.forEach((u) => URL.revokeObjectURL(u));
    setPreviews([]);
  };

  return (
    <div className='flex h-dvh w-full flex-col bg-[#f6f6f6]'>
      {/*  헤더 */}
      <div className='h-12 flex items-center justify-center relative bg-white border-b'>
        <button
          className='absolute left-3 text-[22px] leading-none'
          onClick={() => navigate(-1)}
          aria-label='back'
        >
          <span className='inline-block -translate-y-[1px]'>‹</span>
        </button>
        <div className='text-[15px] font-semibold'>새 포스트 만들기</div>
      </div>

      {/* 업로드 영역  */}
      <div className='relative bg-[#efefef]'>
        {previews.length === 0 ? (
          <div className='h-[42vh] flex items-center justify-center'>
            <div className='text-gray-300 text-7xl font-black select-none'>
              <img src='/icons/favicon/favicon.svg'></img>
            </div>
          </div>
        ) : (
          // 한 장만 전체 영역 꽉 채우기
          <div className='p-2 h-[42vh]'>
            <div className='h-full w-full flex items-center justify-center rounded-md bg-white overflow-hidden'>
              <img
                src={previews[0]}
                alt=''
                className='max-h-full max-w-full object-contain' // 핵심
              />
            </div>
          </div>
        )}

        <button
          onClick={openPicker}
          className='absolute right-3 bottom-3 h-11 w-11 rounded-full bg-white shadow border flex items-center justify-center'
          title='사진 첨부'
        >
          <img src='/icons/photo.png' alt='photo' className='h-6 w-6' />
        </button>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={onChangeFiles}
        />
      </div>

      {/* 작성자 */}

      <div className='bg-white px-4 py-3 border-b'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='h-8 w-8 rounded-full bg-gray-300 overflow-hidden'>
              {/* 프로필 이미지가 있으면 여기에 */}
              {/* <img src="/path" className="h-full w-full object-cover" /> */}
            </div>
            <div className='leading-tight'>
              <div className='text-[13px] font-semibold'>이상협</div>
              <div className='text-[11px] text-gray-500'>@ghrgn98</div>
            </div>
          </div>
          <div
            className='flex items-center gap-1 text-[11px] text-gray-700'
            onClick={goToLinkerOnMap}
          >
            <img src='/icons/fire.png' className='h-4 w-4' alt='fire' />
            <span className='truncate'>{linker?.name ?? "-"}</span>
          </div>
        </div>
      </div>

      {/*  텍스트 입력 박스 (UPDATED UI)  */}
      <div className='bg-white px-4 py-3'>
        {/* 링크 정보 한 줄 (선택) */}
        {linker && (
          <div className='mb-2 text-[12px] text-gray-500'>
            {linker.name}
            {linker.address ? <span className='text-gray-400'> · {linker.address}</span> : null}
          </div>
        )}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='내용을 입력하세요'
          rows={5}
          className='w-full resize-none outline-none text-[14px] placeholder:text-gray-300'
        />
      </div>

      {/*  버튼 */}
      <div className='mt-auto bg-white border-t'>
        <div className='flex'>
          <button
            onClick={onSubmit}
            disabled={!canSubmit || submitting}
            aria-busy={submitting}
            className='flex-1 py-4 text-center font-semibold text-[14px] disabled:opacity-50'
          >
            {submitting ? "업로드 중…" : "작성하기"}
          </button>
          <button
            onClick={onReset}
            className='flex-1 py-4 text-center font-semibold text-[14px] text-red-500'
          >
            삭제하기
          </button>
        </div>
      </div>
    </div>
  );
}
