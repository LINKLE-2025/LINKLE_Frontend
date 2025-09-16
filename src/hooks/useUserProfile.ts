// src/hooks/useUserProfile.ts
import { getUserProfile } from "@/api/profileApi";
import { useEffect, useState } from "react";
import { getProfileImageSrc } from "@/utils/profileUtils";

export type UserProfile = {
  userId: number;
  name: string;
  nickname: string;
  profileImageUrl: string;
  isDefault: boolean;
};

export function useUserProfile(userId?: number) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const data = await getUserProfile(userId);

        const { src, isDefault } = getProfileImageSrc(
          data.userId,
          data.profileImageUrl,
          data.gender,
        );

        // ✅ 디버깅 로그 추가
        console.log("[useUserProfile] userId:", data.userId);
        console.log("[useUserProfile] gender:", data.gender);
        console.log("[useUserProfile] profileImageUrl from API:", data.profileImageUrl);
        console.log("[useUserProfile] final src:", src);
        console.log("[useUserProfile] isDefault:", isDefault);

        setProfile({
          userId: data.userId,
          name: data.name,
          nickname: data.nickname,
          profileImageUrl: src,
          isDefault,
        });
      } catch (e) {
        console.error("사용자 프로필 불러오기 실패", e);

        const { src, isDefault } = getProfileImageSrc(userId, null, undefined);

        setProfile({
          userId,
          name: "알 수 없음",
          nickname: "unknown",
          profileImageUrl: src,
          isDefault,
        });
      }
    })();
  }, [userId]);

  return profile;
}
