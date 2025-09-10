import { useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import AuthInput from "@/components/auth/AuthInput";
import AuthFilledButton from "@/components/auth/AuthFilledButton";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/Calendar";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
};

export default function BirthStep({ value, onChange, onNext }: Props) {
  const [error, setError] = useState("");
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const handleNext = () => {
    // 생년월일 입력 여부 확인
    if (!value) {
      setError("생년월일을 선택하세요.");
      return;
    }
    // 생년월일 유효성 검사
    const birthDate = new Date(value);
    const today = new Date();
    if (isNaN(birthDate.getTime()) || birthDate > today) {
      setError("유효한 날짜를 선택하세요.");
      return;
    }
    // 오류 없으면 다음 단계로
    setError("");
    onNext();
  };

  return (
    <div>
      <div className='relative'>
        {/* 캘린더 버튼 및 다이얼로그 */}
        <Dialog open={open} onOpenChange={setOpen}>
          <VisuallyHidden>
            <DialogTitle>날짜 선택</DialogTitle>
          </VisuallyHidden>
          <DialogTrigger asChild>
            {/* 생년월일 입력 */}
            <AuthInput
              type='text'
              placeholder='생년월일'
              value={value ? format(new Date(value), "yyyy-MM-dd") : ""}
              readOnly
              onChange={(e) => {
                onChange(e.target.value);
                if (error) setError("");
              }}
              className='pr-12'
              error={error}
            />
          </DialogTrigger>

          <DialogContent className='w-auto h-auto p-0'>
            <Calendar
              captionLayout='dropdown'
              mode='single'
              selected={value ? new Date(value) : undefined}
              onSelect={(d) => {
                if (d) {
                  onChange(format(d, "yyyy-MM-dd"));
                  setOpen(false);
                }
              }}
              className='sm:w-[320px]'
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* 다음 버튼 */}
      <AuthFilledButton type='button' className='my-5 sm:mb-7' onClick={handleNext}>
        다음
      </AuthFilledButton>
    </div>
  );
}
