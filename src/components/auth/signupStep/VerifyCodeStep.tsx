import { useState } from "react";
import AuthInput from "@/components/auth/AuthInput";
import AuthFilledButton from "@/components/auth/AuthFilledButton";
import AuthOutlinedButton from "../AuthOutlinedButton";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
};

export default function VerifyCodeStep({ value, onChange, onNext }: Props) {
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!value) {
      setError("유효한 인증 코드를 입력하세요.");
      return;
    }
    // TODO: 이메일 형식 검증 추가 가능
    setError("");
    onNext();
  };

  const handleSendCode = () => {
    if (!value) {
      setError("인증번호가 올바르지 않습니다.");
      return;
    }
    setError("");
    // TODO: 인증 코드 전송 로직 추가
  };

  return (
    <div>
      {/* 인증 코드 입력 */}
      <AuthInput
        type='text'
        placeholder='인증 코드 6자리'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        maxLength={6}
      />

      {/* 다음 버튼 */}
      <AuthFilledButton type='button' className='mt-5 mb-3' onClick={handleNext}>
        다음
      </AuthFilledButton>

      {/* 코드 재전송 버튼 */}
      <AuthOutlinedButton type='button' className='mb-5 sm:mb-7' onClick={handleSendCode}>
        코드를 받지 못했습니다
      </AuthOutlinedButton>
    </div>
  );
}
