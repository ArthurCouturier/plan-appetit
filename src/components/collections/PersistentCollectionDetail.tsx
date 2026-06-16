import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import CollectionDetail from "../../pages/CollectionDetail";

const COLLECTION_ROUTE_REGEX = /^\/collections\/([a-f0-9-]+)$/i;

export default function PersistentCollectionDetail() {
    const location = useLocation();
    const match = COLLECTION_ROUTE_REGEX.exec(location.pathname);
    const currentUuid = match?.[1] ?? null;
    const isActive = currentUuid !== null;
    const [mountedUuid, setMountedUuid] = useState<string | null>(currentUuid);
    const scrollRef = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (currentUuid && currentUuid !== mountedUuid) {
            setMountedUuid(currentUuid);
        }
    }, [currentUuid, mountedUuid]);

    useEffect(() => {
        if (!isActive && containerRef.current) {
            scrollRef.current = window.scrollY;
        }
        if (isActive && scrollRef.current > 0) {
            requestAnimationFrame(() => {
                window.scrollTo(0, scrollRef.current);
            });
        }
    }, [isActive]);

    if (!mountedUuid) return null;

    return (
        <div
            ref={containerRef}
            style={{ display: isActive ? "block" : "none" }}
        >
            <CollectionDetail persistentUuid={mountedUuid} isActive={isActive} />
        </div>
    );
}
