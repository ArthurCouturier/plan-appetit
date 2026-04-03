import { useRef, useState, useCallback } from "react";
import { BellIcon } from "@heroicons/react/24/solid";
import NotificationPanel from "./NotificationPanel";
import useUnreadNotificationCount from "../../api/hooks/useUnreadNotificationCount";

interface NotificationBellProps {
    className?: string;
}

export default function NotificationBell({ className = "" }: NotificationBellProps) {
    const bellRef = useRef<HTMLButtonElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [originRect, setOriginRect] = useState<DOMRect | null>(null);
    const { unreadCount, refetch } = useUnreadNotificationCount();

    const handleOpen = useCallback(() => {
        if (bellRef.current) {
            setOriginRect(bellRef.current.getBoundingClientRect());
        }
        setIsOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        if (bellRef.current) {
            setOriginRect(bellRef.current.getBoundingClientRect());
        }
        setIsOpen(false);
        refetch();
    }, [refetch]);

    return (
        <>
            <button
                ref={bellRef}
                onClick={handleOpen}
                className={`relative flex items-center justify-center transition-all duration-500 ease-in-out ${isOpen ? "opacity-0 scale-[0.01]" : "opacity-100 scale-100"} ${className}`}
            >
                <BellIcon className="w-5 h-5 text-white" />

                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-cout-purple/80 animate-pulse" />
                )}
            </button>

            <NotificationPanel
                isOpen={isOpen}
                onClose={handleClose}
                originRect={originRect}
            />
        </>
    );
}
