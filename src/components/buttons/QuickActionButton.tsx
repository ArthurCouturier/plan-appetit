interface QuickActionButtonProps {
    icon: string;
    iconSize?: number;
    title: string;
    onClick: () => void;
    disabled?: boolean;
}

export default function QuickActionButton({ icon, iconSize = 24, title, onClick, disabled = false }: QuickActionButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="flex items-center justify-center gap-3 h-[48px] w-full px-[24px] py-[12px] bg-premium-background text-cout-purple rounded-full text-sora text-[18px] leading-[24px] shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
            <img src={icon} alt="" style={{ width: iconSize, height: iconSize }} />
            <span>{title}</span>
        </button>
    );
}
