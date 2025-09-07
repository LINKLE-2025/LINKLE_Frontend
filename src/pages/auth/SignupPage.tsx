import { useEffect, useReducer, useState } from "react";
import EmailStep from "@/components/auth/signupStep/EmailStep";
import VerifyCodeStep from "@/components/auth/signupStep/VerifyCodeStep";
import PasswordStep from "@/components/auth/signupStep/PasswordStep";
import NameStep from "@/components/auth/signupStep/NameStep";
import BirthStep from "@/components/auth/signupStep/BirthStep";
import GenderStep from "@/components/auth/signupStep/GenderStep";
import NicknameStep from "@/components/auth/signupStep/NicknameStep";
import AgreeTermStep from "@/components/auth/signupStep/AgreeTermStep";
import BackTitleHeader from "@/components/header/BackTitleHeader";
import axios from "axios";

// 각 단계별 안내 문구
const stepContents: Record<number, { title: string; description: string }> = {
  1: {
    title: "이메일 주소 입력",
    description:
      "회원님에게 연락할 수 있는 이메일 주소를 입력하세요. 이 이메일 주소는 프로필에서 다른 사람에게 공개되지 않습니다.",
  },
  2: {
    title: "인증 코드 입력",
    description: "계정을 확인하려면 입력하신 메일 주소로 전송된 6자리 코드를 입력하세요.",
  },
  3: {
    title: "비밀번호 만들기",
    description:
      "다른 사람이 추측할 수 없는 6자 이상의 영문 대소문자, 숫자 및 특수문자의 조합으로 비밀번호를 만드세요.",
  },
  4: {
    title: "이름 입력",
    description:
      "친구들이 회원님을 찾을 수 있도록 이름을 추가하세요. 이름은 언제든 변경할 수 있습니다. (한글, 영문 대소문자, 숫자 및 공백만 가능)",
  },
  5: {
    title: "생년월일 입력",
    description:
      "회원님의 생년월일을 입력해주세요. 입력하신 정보는 본인 확인 및 맞춤형 서비스 제공을 위해 사용되며, 다른 사람에게 공개되지 않습니다.",
  },
  6: {
    title: "성별 선택",
    description:
      "회원님의 성별을 선택해주세요. 입력하신 정보는 맞춤형 서비스 제공을 위해 사용되며, 다른 사람에게 공개되지 않습니다.",
  },
  7: {
    title: "닉네임 만들기",
    description:
      "회원님의 개성을 드러낼 수 있는 닉네임을 사용하세요. 언제든지 변경할 수 있습니다. (4~20자의 숫자, 영문 소문자 및 언더스코어(_)만 가능)",
  },
  8: {
    title: "약관 동의",
    description: "서비스 이용을 위해 약관에 동의해 주세요.",
  },
};

// 나이 그룹 변환 함수
const getAgeGroup = (birth: string) => {
  const year = new Date(birth).getFullYear();
  const age = new Date().getFullYear() - year;

  if (age < 30) return 20;
  if (age < 40) return 30;
  if (age < 50) return 40;
  if (age < 60) return 50;
  return 60;
};

export default function SignupPage() {
  const [step, setStep] = useState(1);

  // 전체 폼 데이터 상태
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    password: "",
    name: "",
    birth: "",
    gender: "",
    nickname: "",
    agree: [false, false, false],
  });

  // formData 변경 시 콘솔에 출력
  useEffect(() => {
    console.log(formData);
  }, [formData]);

  // formData 업데이트 함수
  const updateField = (field: keyof typeof formData, value: string | boolean | boolean[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 최종 제출 처리 함수
  const handleSubmit = async () => {
    // 나이 그룹 변환
    const ageGroup = getAgeGroup(formData.birth);

    // 페이로드 설정
    const payload = {
      ...formData,
      age: ageGroup,
    };
    console.log("최종 제출 데이터:", payload);

    // 서버에 회원가입 요청
    try {
      const response = await axios.post("/api/auth/signup", payload);
      if (response.data) {
        console.log("회원가입 성공:", response.data);
        alert("회원가입이 완료되었습니다.");
        window.location.href = "/login"; // 로그인 페이지로 이동
      } else {
        alert("이미 사용 중인 이메일이거나 닉네임입니다.");
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
      alert("회원가입에 실패했습니다.");
    }
  };

  return (
    <div className='flex flex-col items-center justify-center mx-auto w-full max-w-[630px] px-6'>
      {/* header */}
      <BackTitleHeader
        title='회원가입'
        className='bg-white/60'
        onBack={step > 1 ? () => setStep(step - 1) : undefined}
      />

      {/* 안내 문구 */}
      <div className='text-left w-full max-w-sm'>
        <h2 className='text-3xl sm:text-4xl sm:text-center font-bold mt-6 mb-3 sm:mb-14'>
          {stepContents[step].title}
        </h2>
        <p className='text-linkleGray text-sm sm:text-base mb-3 sm:mb-5'>
          {stepContents[step].description}
        </p>

        {/* 단계별 컴포넌트 렌더링 */}
        {step === 1 && (
          <EmailStep
            value={formData.email}
            onChange={(v) => updateField("email", v)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <VerifyCodeStep
            value={formData.code}
            email={formData.email}
            onChange={(v) => updateField("code", v)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <PasswordStep
            value={formData.password}
            onChange={(v) => updateField("password", v)}
            onNext={() => setStep(4)}
          />
        )}
        {step === 4 && (
          <NameStep
            value={formData.name}
            onChange={(v) => updateField("name", v)}
            onNext={() => setStep(5)}
          />
        )}
        {step === 5 && (
          <BirthStep
            value={formData.birth}
            onChange={(v) => updateField("birth", v)}
            onNext={() => setStep(6)}
          />
        )}
        {step === 6 && (
          <GenderStep
            value={formData.gender}
            onChange={(v) => updateField("gender", v)}
            onNext={() => setStep(7)}
          />
        )}
        {step === 7 && (
          <NicknameStep
            value={formData.nickname}
            onChange={(v) => updateField("nickname", v)}
            onNext={() => setStep(8)}
          />
        )}
        {step === 8 && (
          <AgreeTermStep
            value={formData.agree}
            onChange={(v) => updateField("agree", v)}
            onNext={handleSubmit}
          />
        )}
      </div>
      {/* 로그인 이동 링크 */}
      <div className='text-base sm:mb-10'>
        <a href='/login' className='text-base font-bold text-linkleGray hover:text-black'>
          이미 계정이 있습니다
        </a>
      </div>
    </div>
  );
}
