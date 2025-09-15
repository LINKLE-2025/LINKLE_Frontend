interface BankButtonProps {
    symbolSrc: string;
    wordmarkSrc: string;
    alt: string;
    onClick: () => void;
    selected?: boolean;
    colors: { border: string; bg: string };
}

export default function BankButton({
    symbolSrc,
    wordmarkSrc,
    alt,
    onClick,
    selected = false,
    colors,
}: BankButtonProps) {
    const { border, bg } = colors;

    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center rounded-lg p-5 space-y-3 border shadow-sm cursor-pointer transition-colors duration-100
        ${selected
                    ? `${border} ${bg}`
                    : `border-gray-200 hover:border-black/10 hover:bg-gray-100/30`
                }`}
        >
            <img className="w-20" src={symbolSrc} alt={`${alt} 심볼`} />
            <img className="w-24" src={wordmarkSrc} alt={`${alt} 로고`} />
        </button>
    );
}