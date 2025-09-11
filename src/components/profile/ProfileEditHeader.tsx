import React from "react";
import { ChevronLeft } from "lucide-react";
import BackgroundImageUploader from "@/components/profile/BackgroundImageUploader";

function ProfileEditHeader({
  backgroundUrl,
  onBack,
  onSave,
  onBackgroundChange,
}: {
  backgroundUrl: string;
  onBack: () => void;
  onSave: () => void;
  onBackgroundChange: (file: File, preview: string) => void;
}) {
  return (
    <div className="relative">
      <BackgroundImageUploader
        bgPreview={backgroundUrl}
        onChange={onBackgroundChange}
        height={192} // h-48
      />

      {/* 상단 네비게이션 */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
        <button
          onClick={onBack}
          className="p-2 bg-black bg-opacity-20 rounded-full"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg"
        >
          완료
        </button>
      </div>
    </div>
  );
}

export default ProfileEditHeader;
