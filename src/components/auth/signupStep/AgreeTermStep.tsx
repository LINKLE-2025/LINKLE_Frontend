import { useEffect, useState } from "react";
import { Term, terms } from "@/constants/terms";
import AuthFilledButton from "@/components/auth/AuthFilledButton";
import { X } from "lucide-react";

type Props = {
  value: boolean[];
  onChange: (v: boolean[]) => void;
  onNext: () => void;
};

export default function AgreeTermStep({ value, onChange, onNext }: Props) {
  const [error, setError] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);

  // 개별 약관 토글
  const toggleTerm = (idx: number) => {
    const newValue = [...value];
    newValue[idx] = !newValue[idx];
    onChange(newValue);
  };

  // 전체 약관 동의/해제
  const agreeAll = () => {
    const allAgreed = value.every(Boolean);
    onChange(value.map(() => !allAgreed));
  };

  const handleNext = () => {
    if (!value.every(Boolean)) {
      setError("모든 약관에 동의해야 다음 단계로 진행할 수 있습니다.");
      return;
    }
    setError("");
    onNext();
  };

  useEffect(() => {
    if (value.every(Boolean)) {
      setError("");
    }
  }, [value]);

  return (
    <div>
      {/* 모두 동의 */}
      <div className='flex justify-between items-center mb-3'>
        <span className='text-base font-medium'>이용 약관</span>
        <button type='button' className='text-sm text-blue-500' onClick={agreeAll}>
          모두 동의하기
        </button>
      </div>

      {/* 약관 목록 */}
      <div className='rounded-xl border divide-y bg-white/75'>
        {terms.map((term, idx) => (
          <div key={term.id} className='flex items-center justify-between px-4 py-3'>
            <div className='flex flex-col'>
              <span className='font-bold'>
                {term.title}
                {term.required && "(필수)"}
              </span>
              <button
                type='button'
                onClick={() => setSelectedTerm(term)}
                className='text-sm text-blue-500 text-left'
              >
                더 알아보기
              </button>
            </div>
            <input
              type='checkbox'
              checked={value[idx]}
              onChange={() => toggleTerm(idx)}
              className='w-5 h-5 accent-black'
            />
          </div>
        ))}
      </div>

      {/* 에러 메시지 */}
      {error && <p className='text-sm text-center text-red-500 mt-2'>{error}</p>}

      {/* 회원가입 버튼 */}
      <AuthFilledButton type='button' className='my-5 sm:mb-7' onClick={handleNext}>
        회원가입
      </AuthFilledButton>

      {/* 모달 */}
      {selectedTerm && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          onClick={() => setSelectedTerm(null)} // 🔹 바깥 클릭 시 닫힘
        >
          <div
            className="bg-white rounded-xl shadow-lg max-w-md w-full p-5 pb-6 relative max-h-[80vh] overflow-y-auto mx-5"
            onClick={(e) => e.stopPropagation()} // 🔹 내부 클릭은 이벤트 버블링 막기
          >
            <h2 className="text-lg font-bold pl-1 mb-3">{selectedTerm.title}</h2>

            {/* 스크롤 가능한 본문 */}
            <div className="text-sm text-gray-700 bg-slate-50 whitespace-pre-line overflow-y-auto max-h-[50vh] py-3 pl-2 pr-3">
              {selectedTerm.content}
            </div>

            {/* 닫기 버튼 */}
            <button
              className="absolute top-3.5 right-3.5 text-linkleGray hover:text-black"
              onClick={() => setSelectedTerm(null)}
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100/60 transition-colors">
                <X className="w-5 h-5" />
              </div>
            </button>

            {/* 동의 버튼 */}
            <AuthFilledButton
              type="button"
              className="mt-5 w-40 mx-auto block"
              disabled={value[terms.findIndex((t) => t.id === selectedTerm.id)]}
              onClick={() => {
                const idx = terms.findIndex((t) => t.id === selectedTerm.id);
                if (idx !== -1 && !value[idx]) {
                  toggleTerm(idx);
                }
                setSelectedTerm(null);
              }}
            >
              {value[terms.findIndex((t) => t.id === selectedTerm.id)]
                ? "동의함"
                : "동의하기"}
            </AuthFilledButton>
          </div>
        </div>
      )}

    </div>
  );
}
