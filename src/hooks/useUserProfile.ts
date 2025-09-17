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

        // ✅ image 필드 활용
        const { src, isDefault } = getProfileImageSrc(
          data.userId,
          data.image, // <-- 여기! 기존 profileImageUrl → image
          data.gender,
        );

        console.log("[useUserProfile] userId:", data.userId);
        console.log("[useUserProfile] gender:", data.gender);
        console.log("[useUserProfile] image from API:", data.image);
        console.log("[useUserProfile] final src:", src);
        console.log("[useUserProfile] isDefault:", isDefault);

        setProfile({
          userId: data.userId,
          name: data.name,
          nickname: data.nickname,
          profileImageUrl: src, // 최종 URL (DB 이미지 or 기본 이미지)
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
