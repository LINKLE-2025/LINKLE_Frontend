import { useState } from "react";
import AuthInput from "@/components/auth/AuthInput";
import AuthFilledButton from "@/components/auth/AuthFilledButton";

type Props = {
  value: boolean[];
  onChange: (v: string) => void;
  onNext: () => void;
};

export default function AgreeTermStep({ value, onChange, onNext }: Props) {
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!value.every(Boolean)) {
      setError("모든 약관에 동의해야 다음 단계로 진행할 수 있습니다.");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <div>
      {/* 다음 버튼 */}
      <AuthFilledButton type='button' className='my-5 sm:mb-7' onClick={handleNext}>
        다음
      </AuthFilledButton>
    </div>
  );
}
