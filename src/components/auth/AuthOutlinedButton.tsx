import React from "react";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
};

export default function AuthOutlinedButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-white/75 border border-gray-400/75 text-black 
        hover:bg-gray-100/50 transition-colors
        font-bold py-2 rounded-full w-full max-w-sm 
        disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}
