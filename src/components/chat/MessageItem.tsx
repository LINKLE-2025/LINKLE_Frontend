import { useState } from "react";
import type { MessageResponseDTO } from "../../types/chat";
import { formatTimeLabel } from "../../utils/chat";

const DEV_UID = Number(import.meta.env.VITE_DEV_USER_ID ?? "2");

export default function MessageItem({
  m,
  showAvatar,
  name,
  avatar,
  isFirstOfBlock,
}: {
  m: MessageResponseDTO;
  showAvatar: boolean;
  name?: string | null;
  avatar?: string | null;
  isFirstOfBlock: boolean; // ✅ 추가
}) {
  const isMine = m.senderId === DEV_UID;
  const [imgFailed, setImgFailed] = useState(false);

  const renderAvatar = () => {
    if (isMine) return null; // 내 메시지는 아바타 없음
    if (!showAvatar) return <div className='w-9 h-px flex-shrink-0' />; // 정렬용 스페이서

    if (avatar && !imgFailed) {
      return (
        <img
          src={avatar}
          alt={name ?? ""}
          className='w-9 h-9 rounded-full object-cover flex-shrink-0 mt-0.5'
          onError={() => setImgFailed(true)}
        />
      );
    }
    return <div className='w-9 h-9 rounded-full bg-gray-200 flex-shrink-0 mt-0.5' />;
  };

  // 🔹 간격 규칙: 첫 메시지는 크게, 연속 메시지는 작게
  const outerMarginTop = isFirstOfBlock ? "mt-5" : "mt-1.5"; // 원하는 값으로 조절 가능

  return (
    <div className={`${outerMarginTop} mb-2.5`}>
      <div className={`flex items-start gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
        {renderAvatar()}

        <div className='max-w-[72%]'>
          {/* 첫 메시지에서만 이름 노출 */}
          {!isMine && showAvatar && (
            <div className='text-[12px] text-gray-600 mb-1 ml-1 text-left'>{name ?? "상대"}</div>
          )}

          {isMine ? (
            <div className='flex items-end gap-1.5'>
              <div className='text-[11px] text-gray-500 mb-0.5 whitespace-nowrap'>
                {formatTimeLabel(m.createdDate)}
              </div>
              <div className='inline-block px-3 py-2 rounded-2xl bg-[#e9ffe4] shadow-sm whitespace-pre-wrap break-words'>
                {m.content}
              </div>
            </div>
          ) : (
            <div className='flex items-end gap-1.5'>
              <div className='inline-block px-3 py-2 rounded-2xl bg-white shadow-sm whitespace-pre-wrap break-words'>
                {m.content}
              </div>
              <div className='text-[11px] text-gray-500 mb-0.5 whitespace-nowrap'>
                {formatTimeLabel(m.createdDate)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
