import React, { useMemo, useRef, useState } from "react";
import { Sheet } from "react-modal-sheet";
import { useNavigate } from "react-router-dom";

export type LinkerDetail = {
  linkerId: number;
  name: string;
  address?: string;
  adresssName?: string; // 호환
  categoryId?: number | null;
  locationX?: number | null; // lng
  locationY?: number | null; // lat
  memo?: string | null;
  createdAt?: string;
  phone?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  detail: LinkerDetail | null;
  loading: boolean;
  error: string | null;
};

const prettyDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString() : "-");

export default function LinkerDetailSheet({ open, onClose, detail, loading, error }: Props) {
  const navigate = useNavigate();

  const CreatePost = () => {
    if (!detail) return;
    // state로 상세 전달 + 필요하면 쿼리도 함께
    navigate(`/post?linkerId=${detail.linkerId}`, { state: { linker: detail } });
  };
  return (
    <Sheet
      isOpen={open}
      onClose={onClose}
      /** 화면 상단이 비도록 바텀시트 높이(비율) 설정 */
      snapPoints={[0.92, 0.78, 0.6]}
      initialSnap={1} // 0.78에서 시작 -> 위쪽에 지도 약간 보임
      detent='content-height'
    >
      <Sheet.Container>
        {/* 상단 핸들바 */}
        <Sheet.Header>
          <div className='mx-auto my-2 h-1.5 w-12 rounded-full bg-gray-300' />
        </Sheet.Header>

        <Sheet.Content>
          {/* 제목/주소/우측 아이콘 */}
          <div className='px-4 pb-2'>
            {loading ? (
              <p className='text-gray-500'>불러오는 중…</p>
            ) : error ? (
              <p className='text-red-500'>{error}</p>
            ) : (
              <>
                <div className='flex items-start justify-between'>
                  <div className='min-w-0'>
                    <h2 className='text-lg font-bold truncate'>{detail?.name ?? "-"}</h2>
                    <p className='mt-0.5 text-sm text-gray-500 truncate'>
                      {detail?.address ?? detail?.adresssName ?? "-"}
                    </p>
                  </div>
                  <div className='ml-3 flex shrink-0 gap-2'>
                    <button
                      className='h-10 w-10 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center'
                      title='포스트작성'
                      onClick={CreatePost}
                    >
                      <img src='public/icons/photo.png' />
                    </button>
                    <button
                      className='h-10 w-10 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center'
                      title='채팅방생성'
                    >
                      <img src='public/icons/chat.png' />
                    </button>
                  </div>
                </div>

                {/* 메타 정보 라인 */}
                <div className='mt-3 flex items-center justify-between text-xs text-gray-500'>
                  <div className='flex gap-4'>
                    <span>3 채팅방</span>
                    <span>85 포스트</span>
                  </div>
                  <span>{prettyDate(detail?.createdAt)} 만료 예정</span>
                </div>
              </>
            )}
          </div>

          {/* 탭 바 */}
          <div className='mt-2 border-b'>
            <div className='flex items-center justify-around text-sm'>
              <button className='relative py-2 font-semibold'>
                <img src='public/icons/Vector.png' />
                <span className='absolute -bottom-[1px] left-0 right-0 h-[2px] bg-black' />
              </button>
              <button className='py-2 text-gray-400'>
                <img src='public/icons/User Account.png' />
              </button>
              <button className='py-2 text-gray-400'>
                <img src='public/icons/lucide_crown.png' />
              </button>
            </div>
          </div>

          {/* 이미지 그리드 (더미) */}
          <div className='px-1 pt-2 pb-6'>
            <div className='grid grid-cols-3 gap-1'>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className='aspect-square overflow-hidden bg-gray-100'>
                  <img src='/placeholder/food.jpg' alt='' className='h-full w-full object-cover' />
                </div>
              ))}
            </div>
          </div>
        </Sheet.Content>
      </Sheet.Container>
    </Sheet>
  );
}
