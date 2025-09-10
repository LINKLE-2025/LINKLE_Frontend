import React, { useRef } from "react";

interface BackgroundImageUploaderProps {
    onChange: (file: File, previewUrl: string) => void;
    height?: number; // 배경 높이 (default 160px)
    getBackgroundImageSrc?: any;
}

export default function BackgroundImageUploader({
    onChange,
    height = 160,
    getBackgroundImageSrc
}: BackgroundImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            onChange(file, reader.result as string);
        };
        reader.readAsDataURL(file);
    };
    console.log("getBackgroundImageSrc" + getBackgroundImageSrc);
    return (
        <div className="relative w-full bg-gray-200" style={{ height }}>
            <img
                src={getBackgroundImageSrc}
                alt="배경"
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => inputRef.current?.click()}
            />
            <button
                onClick={() => inputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 text-xs rounded"
            >
                배경사진 추가
            </button>
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
