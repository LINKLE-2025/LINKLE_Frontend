import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = {
  title: string;
  backTo?: string; // 기본은 뒤로가기, 특정 주소 지정 가능
  className?: string;
  onBack?: () => void;
};

export default function BackTitleHeader({ title, backTo, className, onBack }: Props) {
  const navigate = useNavigate();

  return (
    <header
      className={`fixed top-0 w-full flex items-center justify-center bg-white border-b border-gray-200 py-3 z-50 ${className}`}
    >
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => {
          if (onBack) {
            onBack(); // 🔹 상위에서 정의된 동작 실행
          } else {
            backTo ? navigate(backTo) : navigate(-1);
          }
        }}
        className='absolute left-0 flex items-center'
      >
        <div className='flex items-center justify-center w-14 h-12 mx-0.5'>
          <div className='flex items-center justify-center rounded-xl hover:bg-gray-100/60 transition-colors p-1'>
            <ChevronLeft className="w-8 h-8 text-black" strokeWidth={1.5} />
          </div>
        </div>
      </button>

      {/* 중앙 타이틀 */}
      <h1 className='text-lg font-bold'>{title}</h1>
    </header>
  );
}
