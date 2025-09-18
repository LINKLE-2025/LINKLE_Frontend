// src/components/post/PostForm.tsx
import { getFriendRelationship } from "@/api/friendApi";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ActionCircleButton from "../common/ActionCircleButton";
import { ImagePlus } from "lucide-react";
import { CATEGORY_DATA } from "@/constants/categoryData";

export type LinkerLite = {
  linkerId: number;
  name: string;
  categoryId: number;
  address?: string | null
};

type Props = {
  PostId?: number;
  linker?: LinkerLite | null;
  initialText?: string;
  initialImageUrl?: string | null;
  submitting?: boolean;
  submitLabel?: string;
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

  const category =
    linker?.categoryId && linker.categoryId >= 1 && linker.categoryId <= CATEGORY_DATA.length
      ? CATEGORY_DATA[linker.categoryId - 1]
      : null;

  const bgColor = category?.color ?? "#F3F4F6";
  const icon = category?.icon ?? "/logos/linkle-icon.svg";

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

  return (
    <div className="flex w-full flex-col bg-[#f6f6f6]">
      {/* 업로드 영역 */}
      <div className="relative bg-[#efefef]" onClick={openPicker}>
        {!preview ? (
          // 기본 이미지
          <div className="h-[42vh] flex items-center justify-center">
            <img
              src="/icons/favicon/favicon.svg"
              className="w-2/5 sm:w-1/5 opacity-5"
              alt="" />
          </div>
        ) : (
          // 사진 업로드 후 미리보기
          <div className="w-full h-[50vh] rounded-md bg-white overflow-hidden flex items-center justify-center">
            <img src={preview} alt="미리보기" className="w-full object-cover" />
          </div>
        )}

        {!readOnly && (
          // 사진 첨부 버튼 + 숨겨진 파일 입력
          <>
            <ActionCircleButton
              icon={<ImagePlus className="w-5 h-5 sm:w-6 sm:h-6" />}
              alt="photo"
              className="absolute right-4 bottom-4 rounded-full bg-white 
              shadow border flex items-center justify-center text-gray-700"
            />

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
            {/* 프로필 이미지 */}
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
            {/* 이름 및 닉네임 */}
            <div className="leading-snug text-left">
              <div className="text-[14px] font-bold">{name ?? "알 수 없는 사용자"}</div>
              <div className="text-[11px] text-gray-500">@{userNickname ?? "알 수 없는 사용자"}</div>
            </div>
          </div>
          {/* 링커 정보 */}
          {linker && (
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-gray-700 px-2.5 py-1.5 rounded-lg shadow-sm"
              style={{ backgroundColor: `${bgColor}20` }}
              onClick={ClickLinker}
            >

              <img src={icon} className="h-4 w-4 opacity-80" alt="link" />
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
          className="fixed left-0 right-0 bottom-0 bg-white border-t z-30"
        >
          <div className="flex" >
            <button
              onClick={() => onSubmit({ text, file })}
              disabled={!canSubmit || submitting}
              aria-busy={submitting}
              className="flex-1 py-4 text-center font-bold xs:font-normal text-base disabled:opacity-50
                       bg-white hover:bg-gray-100 transition-colors"
              style={{
                paddingBottom: "calc(1rem + min(env(safe-area-inset-bottom), 16px))",
              }}
            >
              {submitting ? "업로드 중…" : submitLabel}
            </button>

            {showDeleteButton && (
              <button
                onClick={onDelete}
                className="flex-1 py-4 text-center font-bold xs:font-normal text-base text-red-500
                         bg-white hover:bg-gray-100 transition-colors"
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
