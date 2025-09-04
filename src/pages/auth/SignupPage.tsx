import { useState } from "react";
import EmailStep from "@/components/auth/signupStep/EmailStep";

const stepTitles: Record<number, string> = {
  1: "이메일 주소 입력",
  2: "이메일 인증",
  3: "인증 코드 입력",
  4: "비밀번호 만들기",
  5: "이름 입력",
  6: "생년월일 입력",
  7: "성별 선택",
  8: "닉네임 만들기",
  9: "약관 동의",
};

export default function SignupPage() {
  const [step, setStep] = useState(1);

  return (
    <div className='flex flex-col items-center justify-center mx-auto w-full max-w-[630px] px-6'>
      {step === 1 && <EmailStep onNext={() => setStep(2)} onPrev={() => setStep(1)} />}
      {/* {step === 2 && <PasswordStep onNext={() => setStep(3)} onPrev={() => setStep(1)} />} */}
      {/* ... 나머지 단계 */}
    </div>
  );
}
