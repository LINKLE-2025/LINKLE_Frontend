import { useState } from "react";
import AuthInput from "@/components/auth/AuthInput";
import AuthFilledButton from "@/components/auth/AuthFilledButton";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
};

export default function GenderStep({ value, onChange, onNext }: Props) {
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!value) {
      setError("성별을 선택하세요.");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <div>
      {/* 성별 선택 */}
      <div className='flex gap-4'>
        <AuthInput
          type='button'
          name='gender'
          value='남성'
          onClick={(e) => {
            onChange(e.currentTarget.value);
            if (error) setError("");
          }}
          selected={value === "남성"}
          className='font-bold'
        />
        <AuthInput
          type='button'
          name='gender'
          value='여성'
          onClick={(e) => {
            onChange(e.currentTarget.value);
            if (error) setError("");
          }}
          selected={value === "여성"}
          className='font-bold'
        />
      </div>

      <div className='text-center mt-1'>
        {/* 에러 메시지 */}
        {error && <p className='text-sm font-medium text-red-500'>{error}</p>}
      </div>

      {/* 다음 버튼 */}
      <AuthFilledButton type='button' className='my-5 sm:mb-7' onClick={handleNext}>
        다음
      </AuthFilledButton>
    </div>
  );
}
