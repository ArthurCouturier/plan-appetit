type DropPlaceholderProps = {
    isMobile?: boolean;
};

export default function DropPlaceholder({ isMobile }: DropPlaceholderProps) {
    if (isMobile) {
        return (
            <div className="w-full bg-transparent rounded-xl border-2 border-dashed border-cout-base p-4 flex items-center justify-center min-h-[76px]">
                <span className="text-cout-base font-medium text-sm">Poser ici</span>
            </div>
        );
    }

    return (
        <div className="bg-transparent rounded-xl border-2 border-dashed border-cout-base p-6 flex items-center justify-center min-h-[200px] h-full">
            <span className="text-cout-base font-medium">Poser ici</span>
        </div>
    );
}
