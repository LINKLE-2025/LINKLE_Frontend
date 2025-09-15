import React, { useRef } from "react";

interface ProfileImageUploaderProps {
    onChange: (file: File, previewUrl: string) => void;
    size?: number; // 아바타 크기 (default 96px)
    getProfileImageSrc?: any;
    profilePreview: string;
}

export default function ProfileImageUploader({
    onChange,
    size = 96,
    getProfileImageSrc,
    profilePreview,
}: ProfileImageUploaderProps) {
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

    const displaySrc = profilePreview || getProfileImageSrc;


    return (
        <div
            className="relative mx-auto -mt-12 max-w-full"
            style={{ width: size, height: size }}
        >
            <img
                src={displaySrc}
                alt="프로필"
                className="w-full h-full object-cover rounded-full border-4 border-white shadow-md cursor-pointer"
                onClick={() => inputRef.current?.click()}
            />
            <button
                onClick={() => inputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-white hover:bg-gray-100 transition-colors p-1 rounded-full border"
            >
                <img src="/icons/common/imageUpload.svg" alt="변경" className="w-5 h-5" />
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
