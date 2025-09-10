import PrimaryButton from "@/components/auth/AuthFilledButton";
import AndroidInstallModal from "@/components/modal/AndroidInstallModal";
import IosInstallModal from "@/components/modal/IosInstallModal";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(true);
  const [showAndroidModal, setShowAndroidModal] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isPC = !isAndroid && !isIOS;

  // ✅ PWA 실행 여부 감지
  const isInPWA = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;

  // PWA 설치 관련 이벤트 처리
  useEffect(() => {
    if (isInPWA()) {
      setShowInstallButton(false); // PWA 실행 중이면 설치 버튼 숨김
    }

    // PC/Android: PWA 설치 이벤트 감지
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (isPC && deferredPrompt) {
      // ✅ PC : PWA 설치
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("PWA 설치 상태:", outcome);
      setDeferredPrompt(null);
    } else if (isAndroid && deferredPrompt) {
      // ✅ Android Chrome : PWA 설치
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("PWA 설치 상태:", outcome);
      setDeferredPrompt(null);
    } else if (isAndroid) {
      // ✅ Android (크롬 외 브라우저)
      setShowAndroidModal(true);
    } else if (isIOS) {
      // ✅ iOS Safari
      setShowIosModal(true);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center mx-auto w-full max-w-[630px] px-5'>
      {/* 로고 */}
      <figure className='flex flex-col items-center'>
        <img
          src='/logos/linkle-icon.svg'
          alt='LINKLE 심볼'
          className='w-1/2 max-w-[500px] h-auto'
        />
        <img
          src='/logos/logo_text.svg'
          alt='LINKLE 텍스트 로고'
          className='w-[45vw] max-w-[200px] h-auto my-5'
        />
        <figcaption className='sr-only'>LINKLE 로고</figcaption>
      </figure>

      {/* 소개 멘트 */}
      <p className='text-gray-600 text-base md:text-lg leading-relaxed mt-1 mb-5'>
        링커에 참여하고 친구들을 만나
        <br />
        다양한 추억을 남겨보세요.
      </p>

      {/* 앱 설치 버튼 (PWA 실행 중이면 숨김) */}
      {showInstallButton && (
        <PrimaryButton className='mb-5' onClick={handleInstallClick}>
          LINKLE 앱 설치
        </PrimaryButton>
      )}

      {/* 로그인 및 회원가입 이동 버튼 */}
      <p className='text-base md:text-base mb-5'>
        <Link to='/login' className='font-semibold text-linkleGray hover:text-black'>
          로그인
        </Link>
        <span className='text-gray-400'> 또는 </span>
        <Link to='/signup' className='font-semibold text-linkleGray hover:text-black'>
          가입하기
        </Link>
      </p>

      {/* App 설치 안내 모달 */}
      <AndroidInstallModal open={showAndroidModal} onClose={() => setShowAndroidModal(false)} />
      <IosInstallModal open={showIosModal} onClose={() => setShowIosModal(false)} />
    </div>
  );
}
