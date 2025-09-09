// src/utils/profileUtils.ts
export function getProfileImageSrc(
  userId: number,
  image?: string | null,
  gender?: string,
  bustCache: boolean = false
) {
  const isDefault = image === "public.png" || !image;
  const version = bustCache ? `?v=${Date.now()}` : "";

  const src = isDefault
    ? gender === "남성"
      ? "/icons/public/Man.png"
      : "/icons/public/Woman.png"
    : `/api/user/view/profile/${userId}${version}`;

  return { src, isDefault };
}

export function getBackgroundImageSrc(
  userId: number,
  background?: string | null,
  bustCache: boolean = false
) {
  const isDefault = background === "public.png" || !background;
  const version = bustCache ? `?v=${Date.now()}` : "";

  const src = isDefault
    ? "/icons/public/Background.png"
    : `/api/user/view/background/${userId}${version}`;

  return { src, isDefault };
}
