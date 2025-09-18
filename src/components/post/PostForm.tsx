// src/components/post/PostForm.tsx
import { getFriendRelationship } from "@/api/friendApi";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export type LinkerLite = { linkerId: number; name: string; address?: string | null };

type Props = {
  PostId?: number;
  linker?: LinkerLite | null;
  initialText?: string;
  initialImageUrl?: string | null;
  submitting?: boolean;
  submitLabel?: string;
  footerOffset?: number;
  onSubmit: (payload: { text: string; file?: File | null }) => void;
  onDelete?: () => void;
  onClickLinker?: () => void;
  readOnly?: boolean;
  showDeleteButton?: boolean;
  userNickname?: string;
  name?: string;
  profileImageUrl?: string | null;

  // ---------------
  userId?: number;
  friendId?: number;
  gender?: string;
  currentUserId?: number;
  // ---------------
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
  userNickname,
  name,
  profileImageUrl,
  // ---------------
  userId,
  friendId,
  gender,
  currentUserId,
  // ---------------
}: Props) {
  const [text, setText] = useState(initialText);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialImageUrl);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  // 텍스트 , 사진 둘 중 하나만 바꿔도 버튼 활성화 
  // 둘 다 안 바뀌면 비활성화
  const canSubmit = useMemo(() => {
    if (readOnly) return false;

    const textChanged = text !== initialText;
    const fileChanged = !!file;
    return textChanged || fileChanged;
  }, [readOnly, text, file, initialText]);

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

  const ClickLinker =
    onClickLinker ??
    (() => {
      if (!linker) return;
      navigate("/map", { state: { openLinkerId: linker.linkerId } });
    });


  // ---------------
  const [relationshipType, setRelationshipType] = useState<
    "self" | "friend" | "sent" | "received" | "stranger" | undefined
  >();

  useEffect(() => {
    if (currentUserId === undefined || userId === undefined) return;
    if (currentUserId === userId) {
      setRelationshipType("self");
      return;
    }

    (async () => {
      try {
        const relation = await getFriendRelationship(currentUserId, userId);
        if (!relation.exists || relation.state === "NONE") {
          setRelationshipType("stranger");
        } else if (relation.state === "ACCEPTED") {
          setRelationshipType("friend");
        } else if (relation.state === "REQUESTED") {
          setRelationshipType(
            relation.userId1 === currentUserId ? "sent" : "received"
          );
        }
      } catch (err) {
        console.error("관계 정보 가져오기 실패", err);
        setRelationshipType(undefined);
      }
    })();
  }, [currentUserId, userId]);
  // ---------------

  return (
    <div className="flex w-full flex-col bg-[#f6f6f6]">
      {/* 업로드 영역 */}
      <div className="relative bg-[#efefef]">
        {!preview ? (
          <div className="h-[42vh] flex items-center justify-center">
            <img src="/icons/favicon/favicon.svg" alt="" />
          </div>
        ) : (
          <div className="w-full h-[50vh] rounded-md bg-white overflow-hidden flex items-center justify-center">
            <img src={preview} alt="미리보기" className="w-full object-cover" />
          </div>
        )}

        {!readOnly && (
          <>
            <button
              onClick={openPicker}
              className="absolute right-3 bottom-3 h-11 w-11 rounded-full bg-white shadow border flex items-center justify-center"
              title="사진 첨부"
            >
              <img src="/icons/mapicon/photo.png" alt="photo" className="h-6 w-6" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onChangeFiles}
            />
          </>
        )}
      </div>

      {/* 작성자/링커 */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-300 overflow-hidden">
              {profileImageUrl ? (
                <Link
                  to={`/profile`}
                  state={{
                    userId,
                    friendId,
                    gender,
                    pathname: location.pathname,
                    ...(relationshipType ? { type: relationshipType } : {}),
                  }}
                >
                  <img src={profileImageUrl} alt="프로필" className="h-full w-full object-cover" />
                </Link>
              ) : (
                <img src="/icons/default-profile.png" alt="기본 프로필" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="leading-tight">
              <div className="text-[13px] font-semibold">{name ?? "알 수 없는 사용자"}</div>
              <div className="text-[11px] text-gray-500">@{userNickname ?? "알 수 없는 사용자"}</div>
            </div>
          </div>
          {linker && (
            <button
              type="button"
              className="flex items-center gap-1 text-[11px] text-gray-700 bg-[#EFDCCB]/20 px-3 py-1.5 rounded-lg"
              onClick={ClickLinker}
            >
              <img src="/logos/linkle-icon.svg" className="h-4 w-4" alt="link" />
              <span className="truncate">{linker.name}</span>
            </button>
          )}
        </div>
      </div>

      {/* 텍스트 입력 */}
      <div className="bg-white px-4 py-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder=" "
          rows={5}
          className="w-full resize-none outline-none text-base placeholder:text-gray-300"
          readOnly={readOnly}
        />
      </div>

      {/* 하단 버튼 */}
      {!readOnly && (
        <div
          className="fixed left-0 right-0 bg-white border-t z-30"
          style={{
            bottom: footerOffset || 0,
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <div className="flex">
            <button
              onClick={() => onSubmit({ text, file })}
              disabled={!canSubmit || submitting}
              aria-busy={submitting}
              className="flex-1 pt-4 text-center font-semibold text-[14px] disabled:opacity-50"
            >
              {submitting ? "업로드 중…" : submitLabel}
            </button>

            {showDeleteButton && (
              <button
                onClick={onDelete}
                className="flex-1 py-4 text-center font-semibold text-[14px] text-red-500"
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
