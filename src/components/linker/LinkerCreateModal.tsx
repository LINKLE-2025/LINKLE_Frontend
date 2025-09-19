import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import ConfirmModal from "./ConfirmModal"; // ConfirmModal import

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
    memo?: string;
    address?: string;
    locationX?: number;
    locationY?: number;
    categoryId: number;
    addressDetail: string;
  }) => void;
}

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

  // 카테고리 아이콘 이미지
  const CATEGORY_ICONS: Record<number, string> = {
    1: "/icons/category/mealicon.png",
    2: "/icons/category/cafeicon.png",
    3: "/icons/category/musicicon.png",
    4: "/icons/category/movieicon.png",
    5: "/icons/category/readingicon.png",
    6: "/icons/category/exerciseicon.png",
    7: "/icons/category/drinkingicon.png",
    8: "/icons/category/learningicon.png",
    9: "/icons/category/shoppingicon.png",
    10: "/icons/category/hospitalicon.png",
    11: "/icons/category/gameicon.png",
    12: "/icons/category/travelicon.png",
    13: "/icons/category/shinhanicon.png",
  };

  const handleConfirm = () => {
    // 🔹 시/도 이름 통일 함수
    const normalizeRegion = (raw: string) => {
      const map: Record<string, string> = {
        서울: "서울특별시",
        부산: "부산광역시",
        대구: "대구광역시",
        인천: "인천광역시",
        광주: "광주광역시",
        대전: "대전광역시",
        울산: "울산광역시",
        세종: "세종특별자치시",
        경기: "경기도",
        강원: "강원특별자치도",
        강원도: "강원특별자치도",
        충북: "충청북도",
        충남: "충청남도",
        전북: "전북특별자치도",
        전라북도: "전북특별자치도",
        전남: "전라남도",
        경북: "경상북도",
        경남: "경상남도",
        제주: "제주특별자치도",
        제주도: "제주특별자치도",
      };
      return map[raw] || raw;
    };

    // 🔹 주소를 공백 기준으로 분리
    const words = address.trim().split(/\s+/);
    const region = normalizeRegion(words[0]); // 시/도 통일
    const district = words[1] ?? ""; // 시/군/구
    const addressDetail = `${region} ${district}`; // 최종 addressDetail

    onSubmit({
      name: title,
      addressName,
      memo: tags || undefined,
      address: address || undefined,
      locationX: initial?.lng,
      locationY: initial?.lat,
      categoryId: activityId!,
      addressDetail,
    });

    setConfirmOpen(false);
    onClose();
  };

  if (!open) return null;

  return ReactDOM.createPortal(
    <>
      {/* LinkerCreateModal UI */}
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
                  maxLength={14}
                />
                {title.length >= 14 && (
                  <div className="mt-1 text-xs text-red-500">
                    최대 14자까지 입력 가능합니다.
                  </div>
                )}
              </div>
              {/* 태그 */}
              <div>
                <div className='mb-1.5 text-xs text-gray-500'>태그를 입력해 주세요</div>
                <input
                  placeholder='밥집, 데이트, 혼밥'
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2.5'
                  maxLength={24}
                />
                {tags.length >= 24 && (
                  <div className="mt-1 text-xs text-red-500">
                    최대 24자까지 입력 가능합니다.
                  </div>
                )}
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
                    const iconSrc = CATEGORY_ICONS[id] ?? "/icons/default.png"; // 이미지 경로

                    return (
                      <button
                        type='button'
                        key={id}
                        onClick={() => setActivityId(id)}
                        className={`flex flex-col items-center justify-center rounded-xl border px-2 py-2.5 text-sm cursor-pointer transition ${selected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
                          }`}
                        aria-pressed={selected}
                        aria-label={`${label} 선택`}
                      >
                        {/* 🔹 아이콘 */}
                        <div className='w-8 h-8 mb-1 flex items-center justify-center'>
                          <img
                            src={iconSrc}
                            alt={label}
                            className='w-6 h-6 object-contain'
                            onError={(e) => {
                              console.log(`아이콘 로드 실패: ${iconSrc}`);
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                        {/* 🔹 텍스트 */}
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className='flex gap-2 border-t border-gray-200 p-4'>
              <button
                type='submit'
                className='flex-[2] rounded-lg border-0 bg-gray-900 py-2.5 text-white'
              >
                링커 생성하기
              </button>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 rounded-lg border border-gray-300 bg-white py-2.5'
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ConfirmModal 사용 */}
      <ConfirmModal
        key={confirmOpen ? "open" : "closed"}
        open={confirmOpen}
        message='정말 링커를 생성하시겠습니까?'
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>,
    document.body,
  );
}
