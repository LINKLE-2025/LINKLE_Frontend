// src/components/header/ChatHeader.tsx
export default function ChatHeader({ title = "채팅", className = "" }: { title?: string; className?: string }) {
    return (
        <header className={`select-none fixed top-0 w-full flex items-center justify-center bg-white border-b border-gray-200 py-3 z-50 ${className}`}>
            <h1 className="text-lg font-bold">{title}</h1>
        </header>
    );
}
