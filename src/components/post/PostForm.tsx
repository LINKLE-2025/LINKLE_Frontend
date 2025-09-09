// src/components/post/PostForm.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export type LinkerLite = { linkerId: number; name: string; address?: string | null };

type Props = {
  PostId?: number;
  linker?: LinkerLite | null;
  initialText?: string;
  initialImageUrl?: string | null;
  submitting?: boolean;
  submitLabel?: string;
  footerOffset?: number;
  //수정
  onSubmit: (payload: { text: string; file?: File | null }) => void;
  //삭제
  onDelete?: () => void;
  onClickLinker?: () => void;
  /** 상세보기 재활용을 위한 읽기 전용 모드 */
  readOnly?: boolean;
  /** (선택) 삭제 버튼 표시 여부 – 수정/생성 화면에서만 쓰고, 기본값 true */
  showDeleteButton?: boolean;
  authorName?: string;
};

export default function PostForm({
  linker,
  initialText = "",
  initialImageUrl = null,
  submitting = false,
  submitLabel = "작성하기",
  footerOffset,
  onSubmit,
  onDelete,
  onClickLinker,
  readOnly = false,
  showDeleteButton = true,
  authorName
}: Props) {
  const [text, setText] = useState(initialText);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialImageUrl);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  //링커 바로가기
  const navigate = useNavigate();

  const canSubmit = useMemo(
    () => !readOnly && (text.trim().length > 0 || !!file),
    [readOnly, text, file],
  );

  useEffect(() => setText(initialText), [initialText]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const openPicker = () => {
    if (readOnly) return;
    fileInputRef.current?.click();
  };

  const onChangeFiles: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (readOnly) return;
    const f = e.target.files?.[0];
    if (!f) return;
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const reset = () => {
    setText("");
    setFile(null);
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  //링커 바로가기
  const ClickLinker =
    onClickLinker ??
    (() => {
      if (!linker) return;
      navigate("/map", { state: { openLinkerId: linker.linkerId } });
    });

  return (
    <div className='flex w-full flex-col bg-[#f6f6f6]'>
      {/* 업로드 영역 */}
      <div className='relative bg-[#efefef]'>
        {!preview ? (
          <div className='h-[42vh] flex items-center justify-center'>
            <img src='/icons/favicon/favicon.svg' alt='' />
          </div>
        ) : (
          <div className='p-2 h-[42vh]'>
            <div className='h-full w-full flex items-center justify-center rounded-md bg-white overflow-hidden'>
              <img src={preview} alt='' className='max-h-full max-w-full object-contain' />
            </div>
          </div>
        )}

        {/* readOnly면 사진 버튼 숨김 */}
        {!readOnly && (
          <>
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
          </>
        )}
      </div>
      {/* 작성자/링커 */}
      <div className='bg-white px-4 py-3 border-b'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='h-8 w-8 rounded-full bg-gray-300 overflow-hidden' />
            <div className='leading-tight'>
              <div className='text-[13px] font-semibold'>
                {authorName ?? "알 수 없는 사용자"}
              </div>
              <div className='text-[11px] text-gray-500'>@ghrgn98</div>
            </div>
          </div>
          {linker && (
            <button
              type='button'
              className='flex items-center gap-1 text-[11px] text-gray-700'
              onClick={ClickLinker}
            >
              <img src='/icons/fire.png' className='h-4 w-4' alt='fire' />
              <span className='truncate'>{linker.name}</span>
            </button>
          )}
        </div>
      </div>
      {/* 텍스트 입력 */}
      <div className='bg-white px-4 py-3'>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder=' '
          rows={5}
          className='w-full resize-none outline-none text-[14px] placeholder:text-gray-300'
          readOnly={readOnly} //
        />
      </div>
      {/* 하단 버튼 – readOnly면 전체 숨김 */}
      {!readOnly && (
        <div
          className='fixed left-0 right-0 bg-white border-t z-30'
          style={{
            bottom: footerOffset || 0, // Footer 높이만큼 위에 붙이기
            paddingBottom: "env(safe-area-inset-bottom)", // iOS 홈바 안전영역
          }}
        >
          <div className='flex'>
            <button
              onClick={() => onSubmit({ text, file })}
              disabled={!canSubmit || submitting}
              aria-busy={submitting}
              className='flex-1 py-4 text-center font-semibold text-[14px] disabled:opacity-50'
            >
              {submitting ? "업로드 중…" : submitLabel}
            </button>

            {showDeleteButton && (
              <button
                onClick={onDelete}
                className='flex-1 py-4 text-center font-semibold text-[14px] text-red-500'
              >
                삭제하기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
