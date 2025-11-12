export default function DarkModeButton({
    mode,
    changeMode
}: {
    mode: string;
    changeMode: () => void;
}) {
    return (
        <button
            onClick={changeMode}
            className="fixed top-4 right-4 w-12 h-12 z-100 flex items-center justify-center rounded-full border border-gray-300 bg-bg-color shadow-lg"
        >
            {/* Sun */}
            {mode === "theme1" ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-yellow-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
            ) : (
                /* Moon */
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-text-secondary translate-x-[-2px] translate-y-[2px]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path d="M21 12.79A9 9 0 0112.21 3 7 7 0 1021 12.79z"></path>
                </svg>
            )}
        </button>
    );
}
