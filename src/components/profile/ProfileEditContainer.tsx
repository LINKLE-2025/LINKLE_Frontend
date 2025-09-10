import { useState, useEffect } from "react";
import ProfileForm from "@/components/profile/ProfileEditForm";
import { type ProfileDTO } from "@/types/user";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { patchUserProfile, getUserProfile, getBackgroundImage } from "@/api/profileApi";
import ProfileImageUploader from "@/components/profile/ProfileImageUploader";
import BackgroundImageUploader from "@/components/profile/BackgroundImageUploader";
import { useLocation } from "react-router-dom";
import { getFriends } from "@/api/friendApi";
import { getProfileImageSrc, getBackgroundImageSrc } from "@/utils/profileUtils";

export default function ProfileEditContainer({ userId }: { userId: number }) {
  const [profileData, setProfileData] = useState<ProfileDTO>({
    name: "",
    password: "",
    nickname: "",
    gender: "",
    memo: "",
    email: "",
  });
  const location = useLocation();
  const { gender, image, background } = location.state || {};

  // console.log(gender, image, background);

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);

  const { src: profileImageSrc, isDefault } = getProfileImageSrc(userId, image, gender);
  const { src: backgroundImageSrc, isDefault: isBgDefault } = getBackgroundImageSrc(userId, background);

  const [profilePreview, setProfilePreview] = useState<string>("");
  const [bgPreview, setBgPreview] = useState<string>("");

  useEffect(() => {
    getUserProfile(userId).then((data) => {
      setProfileData({
        name: data.name,
        nickname: data.nickname,
        gender: data.gender,
        memo: data.memo,
        email: data.email,
      });
    });
  }, [userId]);

  const updateField = (field: keyof ProfileDTO, value: string) =>
    setProfileData((prev) => ({ ...prev, [field]: value }));
  const navigate = useNavigate();

  const handleSave = async () => {
    await patchUserProfile(userId, profileData, {
      profile: profileFile,
      background: backgroundFile,
    });

    alert("프로필 저장 완료");

    // 저장 끝난 후 이동
    navigate("/profile");

    // 필요하면 친구 목록 갱신
    const updatedFriends = await getFriends(userId);
    console.log("갱신된 친구 목록:", updatedFriends);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* 배경 업로더 */}
      <BackgroundImageUploader
        bgPreview={bgPreview}
        getBackgroundImageSrc={backgroundImageSrc}
        onChange={(file, previewUrl) => {
          setBackgroundFile(file);
          setBgPreview(previewUrl);
        }}
      />

      {/* 프로필 업로더 */}
      <ProfileImageUploader
        profilePreview={profilePreview}
        getProfileImageSrc={profileImageSrc}
        onChange={(file, previewUrl) => {
          setProfileFile(file);
          setProfilePreview(previewUrl);

        }}
      />

      {/* 폼 */}
      <div className="p-4 space-y-4">
        <ProfileForm
          userId={userId}
          profileData={profileData} updateField={updateField} />
      </div>

      <div className="p-4">
        <button
          onClick={handleSave}
          className="px-6 py-1 text-white text-sm bg-blue-500 rounded-full"
        >
          완료
        </button>
      </div>
    </div>
  );
}
