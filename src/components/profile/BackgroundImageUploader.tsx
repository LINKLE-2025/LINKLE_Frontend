import React, { useRef, useState } from "react";

interface BackgroundImageUploaderProps {
    onChange: (file: File, previewUrl: string) => void;
    height?: number; // 배경 높이 (default 160px)
    getBackgroundImageSrc?: any;
    bgPreview: string;
}

type OutletContextType = {
    headerHeight: number;
    footerHeight: number;
};

export default function BackgroundImageUploader({
    onChange,
    height = 160,
    getBackgroundImageSrc,
    bgPreview
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
    const displaySrc = bgPreview || getBackgroundImageSrc;
    return (
        <div className="relative max-w-full bg-gray-200" style={{ height }}>
            <img
                src={displaySrc}
                alt="배경"
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => inputRef.current?.click()}
            />
            <button
                onClick={() => inputRef.current?.click()}
                className="absolute flex gap-1.5 bottom-3.5 right-3 bg-white hover:bg-gray-100/90 transition-colors text-linkleGray items-center px-2 py-1 text-xs rounded"
            >
                <img src="/icons/common/imageUpload.svg" alt="변경" className="w-4 h-4" />
                <p className="mt-0.5">배경사진 추가</p>
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
