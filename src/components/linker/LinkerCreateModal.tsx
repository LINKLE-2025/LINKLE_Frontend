import { useEffect, useRef, useState } from "react";

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
    addressName: string;
    memo: string;
    address: string;
    locationX?: number;
    locationY?: number;
    categoryId: number;
    addressDetail: string;
  }) => void;
}

export default function LinkerCreateModal({
  open,
  onClose,
  initial,
  onSubmit,
}: LinkerCreateModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [address, setAddress] = useState("");
  const [addressName, setAddressName] = useState("");
  const [activityId, setActivityId] = useState<number | null>(null);

  useEffect(() => {
    if (!initial) return;
    console.log("Initial values:", initial); // 🔹 디버깅 로그
    setAddress(initial.address ?? "");
    setAddressName(initial.addressName ?? "알 수 없는 상호명");
    setTitle("");
    setTags("");
    setActivityId(null);
  }, [initial]);

  useEffect(() => {
    if (!dialogRef.current) return;
    if (open) dialogRef.current.showModal();
    else dialogRef.current.close();
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert("제목을 입력하세요.");
    if (!activityId) return alert("활동을 선택하세요.");

    const words = address.trim().split(/\s+/);
    const addressDetail = words.slice(0, 2).join(" ");

    onSubmit({
      name: title,
      addressName,
      memo: tags,
      address,
      locationX: initial?.lat,
      locationY: initial?.lng,
      categoryId: activityId,
      addressDetail,
    });
  };

  return (
    <dialog ref={dialogRef} className='max-w-[420px] w-[90%] rounded-xl border-0 p-0'>
      <form onSubmit={handleSubmit} className='flex flex-col'>
        <div className='flex items-center justify-between border-b border-gray-200 px-4 py-3'>
          <strong>링커 생성</strong>
          <button
            type='button'
            onClick={onClose}
            className='text-base cursor-pointer bg-transparent border-0'
          >
            닫기
          </button>
        </div>

        <div className='grid gap-3 p-4'>
          <div>
            <div className='mb-1.5 text-xs text-gray-500'>별칭을 지정해 주세요</div>
            <input
              placeholder='예) 함부기함부기집'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='w-full rounded-lg border border-gray-300 px-3 py-2.5'
            />
          </div>

          <div>
            <div className='mb-1.5 text-xs text-gray-500'>태그를 입력해 주세요</div>
            <input
              placeholder='#밥친구  #햄버거'
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className='w-full rounded-lg border border-gray-300 px-3 py-2.5'
            />
          </div>

          <div>
            <div className='mb-1.5 text-xs text-gray-500'>도로명 주소</div>
            <input
              value={address}
              readOnly
              className='w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5'
            />
          </div>

          <div>
            <div className='mb-1.5 text-xs text-gray-500'>상호명</div>
            <input className='w-full rounded-lg border border-red-300 bg-gray-100 px-3 py-2.5' />
          </div>

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
    </dialog>
  );
}
