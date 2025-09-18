import React, { useRef, useState } from "react";

interface ProfileImageUploaderProps {
    onChange: (file: File | null, previewUrl: string) => void;
    size?: number;
    getProfileImageSrc?: any;
    profilePreview: string;
    gender?: string | null;
}

export default function ProfileImageUploader({
    onChange,
    size = 96,
    getProfileImageSrc,
    profilePreview,
    gender,
}: ProfileImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            onChange(file, reader.result as string);
            setMenuOpen(false);
        };
        reader.readAsDataURL(file);
    };

    const handleResetProfile = () => {
        if (window.confirm("기본 프로필로 변경하시겠습니까?")) {
            let defaultProfile = "/icons/profile/Default.png";
            if (gender === "남성") defaultProfile = "/icons/profile/Man.png";
            else if (gender === "여성") defaultProfile = "/icons/profile/Woman.png";

            onChange(null, defaultProfile);
            setMenuOpen(false);
        }
    };

    const displaySrc = profilePreview || getProfileImageSrc;

    return (
        <div
            className="relative mx-auto -mt-12 max-w-full"
            style={{ width: size, height: size }}
        >
            {/* 프로필 이미지 */}
            <img
                src={displaySrc}
                alt="프로필"
                className="w-full h-full object-cover rounded-full border-4 bg-white border-white shadow-md"
            />

            {/* 변경 버튼 */}
            <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="absolute bottom-0 right-0 bg-white hover:bg-gray-100 transition-colors p-1 rounded-full border"
            >
                <img src="/icons/common/imageUpload.svg" alt="변경" className="w-5 h-5" />
            </button>

            {/* 옵션 메뉴 */}
            {menuOpen && (
                <div className="absolute bottom-12 right-0 w-36 bg-white border rounded-lg shadow-md z-50">
                    <button
                        onClick={handleResetProfile}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        기본 프로필로 변경
                    </button>
                    <button
                        onClick={() => inputRef.current?.click()}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        사진 업로드
                    </button>
                </div>
            )}

            {/* 숨겨진 파일 입력 */}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
            />
        </div>
    );
}
