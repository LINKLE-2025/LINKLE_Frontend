import { useEffect, useState } from "react";
import AuthInput from "@/components/auth/AuthInput";
import AuthFilledButton from "@/components/auth/AuthFilledButton";

// 약관 데이터
type Term = {
  id: number;
  title: string;
  required: boolean;
  link: string;
};

// 약관 예시 데이터
const terms: Term[] = [
  { id: 0, title: "이용 약관", required: true, link: "/terms/service" },
  { id: 1, title: "개인정보처리방침", required: true, link: "/terms/privacy" },
  { id: 2, title: "위치 기반 기능", required: true, link: "/terms/location" },
];

type Props = {
  value: boolean[];
  onChange: (v: boolean[]) => void;
  onNext: () => void;
};

export default function AgreeTermStep({ value, onChange, onNext }: Props) {
  const [error, setError] = useState("");

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
              <a
                href={term.link}
                target='_blank'
                rel='noopener noreferrer'
                className='text-sm text-blue-500'
              >
                더 알아보기
              </a>
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
    </div>
  );
}
