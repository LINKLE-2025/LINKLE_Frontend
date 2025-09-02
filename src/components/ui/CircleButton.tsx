// src/components/ui/CircleButton.tsx
import React from "react";

export interface CircleButtonProps {
  imgSrc?: string;
  alt: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const CircleButton: React.FC<CircleButtonProps> = ({ imgSrc, alt, onClick, className = "", children }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md cursor-pointer aria-pressed:opacity-80 ${className}`}
      aria-label={alt}
    >
      {imgSrc ? <img src={imgSrc} alt="" className="w-5 h-5" aria-hidden /> : children}
    </button>
  );
};

export default CircleButton;
