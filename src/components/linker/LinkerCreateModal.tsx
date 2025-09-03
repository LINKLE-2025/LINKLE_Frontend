import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

interface LinkerCreateModalProps {
  open: boolean;
  onClose: () => void;
  initial?: {
    address?: string;
    addressName?: string;
    lat?: number;
    lng?: number;
  };
  onSubmit: (data: {
    name: string;
    addressName?: string;
    memo?: string; // ✅ optional로 수정
    address?: string;
    locationX?: number;
    locationY?: number;
    categoryId: number;
    addressDetail: string;
  }) => void;
}

// ConfirmModal Portal 기반
interface ConfirmModalProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}
const ConfirmModal: React.FC<ConfirmModalProps> = ({ open, message, onConfirm, onCancel }) => {
  if (!open) return null;

  return ReactDOM.createPortal(
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/50'>
      <div className='bg-white rounded-lg p-6 w-[300px]'>
        <p className='mb-4 text-center'>{message}</p>
        <div className='flex justify-between'>
          <button onClick={onCancel} className='px-4 py-2 border rounded'>
            취소
          </button>
          <button onClick={onConfirm} className='px-4 py-2 bg-blue-500 text-white rounded'>
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const ACTIVITIES = [
  "식사",
  "카페",
  "음악",
  "영화",
  "독서",
  "운동",
  "음주",
  "학습",
  "쇼핑",
  "병원",
  "게임",
  "여행",
];

export default function LinkerCreateModal({
  open,
  onClose,
  initial,
  onSubmit,
}: LinkerCreateModalProps) {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [address, setAddress] = useState("");
  const [addressName, setAddressName] = useState("");
  const [activityId, setActivityId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!initial) return;
    setAddress(initial.address ?? "");
    setAddressName(initial.addressName ?? "");
    setTitle("");
    setTags("");
    setActivityId(null);
  }, [initial]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return alert("제목을 입력하세요.");
    if (!activityId) return alert("활동을 선택하세요.");
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    const words = address.trim().split(/\s+/);
    const addressDetail = words.slice(0, 2).join(" ");

    onSubmit({
      name: title,
      addressName,
      memo: tags || undefined,
      address: address || undefined,
      locationX: initial?.lat,
      locationY: initial?.lng,
      categoryId: activityId!,
      addressDetail,
    });

    setConfirmOpen(false);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* LinkerCreateModal */}
      <div className='fixed inset-0 z-[9998] flex items-center justify-center bg-black/30'>
        <div className='bg-white rounded-xl w-[90%] max-w-[420px] p-4'>
          <form onSubmit={handleSubmit} className='flex flex-col'>
            <div className='grid gap-3'>
              {/* 제목 */}
              <div>
                <div className='mb-1.5 text-xs text-gray-500'>별칭을 지정해 주세요</div>
                <input
                  placeholder='예) 함부기함부기집'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2.5'
                />
              </div>
              {/* 태그 */}
              <div>
                <div className='mb-1.5 text-xs text-gray-500'>태그를 입력해 주세요</div>
                <input
                  placeholder='#밥친구  #햄버거'
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2.5'
                />
              </div>
              {/* 주소 */}
              <div>
                <div className='mb-1.5 text-xs text-gray-500'>도로명 주소</div>
                <input
                  value={address}
                  readOnly
                  className='w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5'
                />
              </div>
              {/* 상호명 */}
              <div>
                <div className='mb-1.5 text-xs text-gray-500'>상호명</div>
                <input
                  value={addressName}
                  readOnly
                  className='w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5'
                />
              </div>
              {/* 활동 선택 */}
              <div>
                <div className='mb-2 text-xs text-gray-500'>활동을 선택해 주세요</div>
                <div className='grid grid-cols-4 gap-2'>
                  {ACTIVITIES.map((label, idx) => {
                    const id = idx + 1;
                    const selected = activityId === id;
                    return (
                      <button
                        type='button'
                        key={id}
                        onClick={() => setActivityId(id)}
                        className={`rounded-xl border px-2 py-2.5 text-sm cursor-pointer transition ${
                          selected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
                        }`}
                        aria-pressed={selected}
                        aria-label={`${label} 선택`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className='flex gap-2 border-t border-gray-200 p-4'>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 rounded-lg border border-gray-300 bg-white py-2.5'
              >
                취소
              </button>
              <button
                type='submit'
                className='flex-[2] rounded-lg border-0 bg-gray-900 py-2.5 text-white'
              >
                링커 생성하기
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ConfirmModal Portal */}
      <ConfirmModal
        open={confirmOpen}
        message='정말 링커를 생성하시겠습니까?'
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
