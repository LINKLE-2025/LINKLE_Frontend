import React, { useRef, useState, useEffect } from "react";

interface BackgroundImageUploaderProps {
    onChange: (file: File | null, previewUrl: string) => void;
    height?: number;
    getBackgroundImageSrc?: any;
    bgPreview: string;
}

export default function BackgroundImageUploader({
    onChange,
    height = 160,
    getBackgroundImageSrc,
    bgPreview,
}: BackgroundImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    // 메뉴 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

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

    const handleResetBackground = () => {
        if (window.confirm("기본 배경화면으로 변경하시겠습니까?")) {
            const defaultBg = "/icons/profile/Background.png";
            onChange(null, defaultBg);
            setMenuOpen(false);
        }
    };

    const displaySrc = bgPreview || getBackgroundImageSrc;

    return (
        <div
            className="relative max-w-full bg-gray-200"
            style={{ height: height * 2 }}
        >
            {/* 현재 배경 */}
            <img src={displaySrc} alt="배경" className="w-full h-full object-cover" />

            {/* 배경 변경 버튼 */}
            <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="absolute flex gap-1.5 bottom-3.5 right-3 bg-white hover:bg-gray-100/90 transition-colors text-linkleGray items-center px-2 py-1 text-xs rounded shadow"
            >
                <img
                    src="/icons/common/imageUpload.svg"
                    alt="변경"
                    className="w-4 h-4"
                />
                <p className="mt-0.5">배경사진 추가</p>
            </button>

            {/* 옵션 메뉴 */}
            {menuOpen && (
                <div
                    ref={menuRef}
                    className="absolute bottom-14 right-3 w-40 bg-white border rounded-lg shadow-md z-50"
                >
                    <button
                        onClick={handleResetBackground}
                        className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                        기본 배경으로 변경
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
