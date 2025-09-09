// src/hooks/useFriendFilter.ts
import { useMemo } from "react";
import type { FriendResponse } from "@/types/friend";

export function useFriendFilter(
    list: FriendResponse[],
    searchQuery: string
): FriendResponse[] {
    return useMemo(() => {
        if (!searchQuery.trim()) return list;

        const lowered = searchQuery.toLowerCase();
        return list.filter(
            (friend) =>
                friend.name.toLowerCase().includes(lowered) ||
                friend.nickname.toLowerCase().includes(lowered)
        );
    }, [list, searchQuery]);
}
