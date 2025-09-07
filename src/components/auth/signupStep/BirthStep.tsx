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
    if (!value) {
      setError("생년월일을 선택하세요.");
      return;
    }
    // TODO: 생년월일 형식 검증 추가 가능
    setError("");
    onNext();
  };

  return (
    <div>
      <div className='relative'>
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

        {/* 캘린더 버튼 및 다이얼로그 */}
        {isMobile ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <VisuallyHidden>
              <DialogTitle>날짜 선택</DialogTitle>
            </VisuallyHidden>
            <DialogTrigger asChild>
              <button
                type='button'
                className='
                  absolute right-3 top-1/2 -translate-y-1/2
                  p-1.5 pb-2.5 rounded-md
                  text-linkleGray hover:text-black'
              >
                <CalendarIcon className='h-5 w-5' />
              </button>
            </DialogTrigger>

            <DialogContent className='w-auto p-0'>
              <Calendar
                mode='single'
                selected={value ? new Date(value) : undefined}
                onSelect={(d) => {
                  if (d) {
                    onChange(format(d, "yyyy-MM-dd"));
                    setOpen(false);
                  }
                }}
                className='w-[300px] h-[333px]'
              />
            </DialogContent>
          </Dialog>
        ) : (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type='button'
                className='
                absolute right-3 top-1/2 -translate-y-1/2
                p-1.5 pb-2.5 rounded-md
                text-linkleGray hover:text-black'
              >
                <CalendarIcon className='h-5 w-5' />
              </button>
            </PopoverTrigger>

            <PopoverContent className='w-auto p-0'>
              <Calendar
                mode='single'
                selected={value ? new Date(value) : undefined}
                onSelect={(d) => {
                  if (d) {
                    onChange(format(d, "yyyy-MM-dd"));
                    setOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* 다음 버튼 */}
      <AuthFilledButton type='button' className='my-5 sm:mb-7' onClick={handleNext}>
        다음
      </AuthFilledButton>
    </div>
  );
}
