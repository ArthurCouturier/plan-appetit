import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import {
    UserPlusIcon,
    XMarkIcon,
} from "@heroicons/react/24/solid";
import {
    ShoppingListInterface,
    ShoppingListMemberInterface,
} from "../../api/interfaces/shopping/ShoppingListInterface";
import {
    useAddShoppingListMember,
    useLeaveShoppingList,
    useRemoveShoppingListMember,
} from "../../api/hooks/useShoppingLists";
import {
    MemberLimitReachedError,
    UserNotFoundError,
} from "../../api/services/ShoppingListService";
import ShareButton from "../common/ShareButton";
import { lightHaptic } from "../../haptics/light";
import { errorHaptic } from "../../haptics/error";

interface ShareListSectionProps {
    list: ShoppingListInterface;
    currentUserUid: string;
    onLeft?: () => void;
}

function initialsFor(member: ShoppingListMemberInterface): string {
    const source = member.displayName?.trim() || member.email?.trim() || "?";
    return source.slice(0, 1).toUpperCase();
}

function MemberAvatar({ member }: { member: ShoppingListMemberInterface }) {
    if (member.profilePhoto) {
        return (
            <img
                src={member.profilePhoto}
                alt=""
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
        );
    }
    return (
        <div className="w-9 h-9 rounded-full bg-cout-purple/15 text-cout-purple flex items-center justify-center font-bold text-sm flex-shrink-0">
            {initialsFor(member)}
        </div>
    );
}

export default function ShareListSection({ list, currentUserUid, onLeft }: ShareListSectionProps) {
    const isOwner = list.ownerUserUid === currentUserUid;
    const [emailInput, setEmailInput] = useState("");
    const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
    const addMember = useAddShoppingListMember(list.uuid);
    const removeMember = useRemoveShoppingListMember(list.uuid);
    const leaveList = useLeaveShoppingList();

    const baseUrl = Capacitor.isNativePlatform() ? "https://plan-appetit.fr" : window.location.origin;
    const inviteLink = `${baseUrl}/shopping/join/${list.inviteToken}`;
    const inviteText = `Rejoins ma liste de courses partagée "${list.name}" sur Plan'Appétit en cliquant sur ce lien.`;

    const handleAdd = () => {
        const trimmed = emailInput.trim();
        if (!trimmed) return;
        lightHaptic();
        setFeedback(null);
        addMember.mutate(
            { email: trimmed },
            {
                onSuccess: () => {
                    setEmailInput("");
                    setFeedback({ kind: "ok", text: `${trimmed} a été ajouté.` });
                },
                onError: (err) => {
                    errorHaptic();
                    if (err instanceof UserNotFoundError) {
                        setFeedback({ kind: "err", text: "Cet utilisateur n'est pas inscrit sur Plan'Appétit." });
                    } else if (err instanceof MemberLimitReachedError) {
                        setFeedback({ kind: "err", text: `Limite de ${err.limit} membres atteinte.` });
                    } else {
                        setFeedback({ kind: "err", text: err.message });
                    }
                },
            },
        );
    };

    const handleRemove = (member: ShoppingListMemberInterface) => {
        lightHaptic();
        removeMember.mutate(member.userUid, { onError: () => errorHaptic() });
    };

    const handleLeave = () => {
        lightHaptic();
        leaveList.mutate(list.uuid, {
            onSuccess: () => onLeft?.(),
            onError: () => errorHaptic(),
        });
    };

    return (
        <section className="mt-8 pt-4 border-t border-border-color">
            <h2 className="text-xs uppercase tracking-wider text-text-secondary mb-3">
                Membres ({list.members.length})
            </h2>

            <ul className="flex flex-col gap-2 mb-4">
                {list.members.map((m) => (
                    <li key={m.userUid} className="flex items-center gap-3 bg-secondary border border-border-color rounded-xl p-2.5">
                        <MemberAvatar member={m} />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-text-primary truncate">
                                {m.displayName || m.email || m.userUid}
                                {m.userUid === currentUserUid && (
                                    <span className="ml-2 text-xs text-text-secondary font-normal">(toi)</span>
                                )}
                            </p>
                            {m.role === "OWNER" && (
                                <p className="text-[10px] uppercase tracking-wider text-cout-purple font-semibold">Propriétaire</p>
                            )}
                        </div>
                        {isOwner && m.userUid !== currentUserUid && (
                            <button
                                type="button"
                                onClick={() => handleRemove(m)}
                                disabled={removeMember.isPending}
                                aria-label={`Retirer ${m.displayName || m.email}`}
                                className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-cancel-1 transition-colors disabled:opacity-50"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            {isOwner && (
                <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-stretch gap-2">
                        <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
                            placeholder="email@exemple.com"
                            maxLength={120}
                            inputMode="email"
                            autoCapitalize="none"
                            className="flex-1 px-4 py-2.5 bg-secondary border border-border-color rounded-xl text-text-primary placeholder-text-secondary outline-none focus:ring-2 focus:ring-cout-yellow text-sm min-w-0"
                        />
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={addMember.isPending || !emailInput.trim()}
                            aria-label="Inviter par email"
                            className="px-4 inline-flex items-center justify-center rounded-xl bg-cout-yellow text-cout-purple font-bold disabled:opacity-50"
                        >
                            {addMember.isPending
                                ? <span className="animate-pulse text-xs">...</span>
                                : <UserPlusIcon className="w-5 h-5" />}
                        </button>
                    </div>

                    <ShareButton
                        url={inviteLink}
                        title={`Liste de courses partagée — ${list.name}`}
                        text={inviteText}
                        dialogTitle="Partager la liste"
                        label="Partager un lien d'invitation"
                        fullWidth
                    />
                </div>
            )}

            {feedback && (
                <p className={`text-xs text-center mb-3 ${feedback.kind === "ok" ? "text-confirmation-1" : "text-cancel-1"}`}>
                    {feedback.text}
                </p>
            )}

            {!isOwner && (
                <button
                    type="button"
                    onClick={handleLeave}
                    disabled={leaveList.isPending}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-transparent border-2 border-cancel-1 text-cancel-1 font-semibold text-sm hover:bg-cancel-1/10 transition-colors disabled:opacity-50"
                >
                    {leaveList.isPending ? "Sortie..." : "Quitter cette liste"}
                </button>
            )}
        </section>
    );
}
