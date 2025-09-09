import { useEffect, useState } from "react";
import EmailStep from "@/components/auth/signupStep/EmailStep";
import VerifyCodeStep from "@/components/auth/signupStep/VerifyCodeStep";
import PasswordStep from "@/components/auth/signupStep/PasswordStep";
import BackTitleHeader from "@/components/header/BackTitleHeader";
import { Link } from "react-router-dom";

// 각 단계별 안내 문구
const stepContents: Record<number, { title: string; description: string }> = {
    1: {
        title: "이메일 주소 입력",
        description: "비밀번호를 재설정하기 위해 계정 생성시 사용한 이메일 주소를 입력하세요.",
    },
    2: {
        title: "인증 코드 입력",
        description: "계정을 확인하려면 입력하신 메일 주소로 전송된 6자리 코드를 입력하세요.",
    },
    3: {
        title: "비밀번호 재설정",
        description:
            "다른 사람이 추측할 수 없는 6자 이상의 영문 대소문자, 숫자 및 특수문자의 조합으로 비밀번호를 만드세요.",
    },
};

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1);

    // 전체 폼 데이터 상태
    const [formData, setFormData] = useState({
        email: "",
        code: "",
        password: "",
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

        // 페이로드 설정
        const payload = {
            ...formData,
        };
        console.log("최종 제출 데이터:", payload);

        // 서버에 비밀번호 재설정 요청
        // try {
        //     if (await signup(payload)) {
        //         console.log("회원가입 성공: ", payload);
        //         alert("회원가입이 완료되었습니다.");
        //         window.location.href = "/login"; // 로그인 페이지로 이동
        //     } else {
        //         alert("이미 사용 중인 이메일이거나 닉네임입니다.");
        //     }
        // } catch (error) {
        //     console.error("회원가입 오류:", error);
        //     alert("회원가입에 실패했습니다.");
        // }
    };

    return (
        <div className='flex flex-col items-center justify-center mx-auto w-full max-w-[630px] px-6'>
            {/* header */}
            <BackTitleHeader
                title='비밀번호 찾기'
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
                        forgot={true}
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
                        onNext={handleSubmit}
                    />
                )}
            </div>
            {/* 로그인 이동 링크 */}
            <div className='text-base sm:mb-10'>
                <Link to='/login' className='text-base font-bold text-linkleGray hover:text-black'>
                    로그인 페이지로 돌아가기
                </Link>
            </div>
        </div>
    );
}