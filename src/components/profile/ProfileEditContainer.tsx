import { useState, useEffect } from "react";
import ProfileForm from "@/components/profile/ProfileEditForm";
import { type ProfileDTO } from "@/types/user";
import { Link } from "react-router-dom";
import { patchUserProfile, getUserProfile } from "@/api/profileApi";
import ProfileImageUploader from "@/components/profile/ProfileImageUploader";
import BackgroundImageUploader from "@/components/profile/BackgroundImageUploader";
import { useLocation } from "react-router-dom";
import { getFriends } from "@/api/friendApi";

export default function ProfileEditContainer({ userId }: { userId: number }) {
  const [profileData, setProfileData] = useState<ProfileDTO>({
    name: "",
    password: "",
    nickname: "",
    gender: "",
    intro: "",
    email: "",
  });
  const location = useLocation();
  const { gender, image, background } = location.state || {};

  console.log(gender, image, background);

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>(
    `/api/user/view/profile/${userId}?v=${Date.now()}`
  );

  const [bgPreview, setBgPreview] = useState<string>(
    `/api/user/view/background/${userId}?v=${Date.now()}`
  );

  useEffect(() => {
    getUserProfile(userId).then((data) => {
      setProfileData({
        name: data.name,
        nickname: data.nickname,
        gender: data.gender,
        intro: data.intro,
        email: data.email,
      });
    });
  }, [userId]);

  const updateField = (field: keyof ProfileDTO, value: string) =>
    setProfileData((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    await patchUserProfile(userId, profileData, {
      profile: profileFile,
      background: backgroundFile,
    });
    alert("프로필 저장 완료");

    // 친구 목록 다시 불러오기
    const updatedFriends = await getFriends(userId);
    console.log("갱신된 친구 목록:", updatedFriends);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* 배경 업로더 */}
      <BackgroundImageUploader
        currentImage={bgPreview}
        onChange={(file, previewUrl) => {
          setBackgroundFile(file);
          setBgPreview(previewUrl);
        }}
      />

      {/* 프로필 업로더 */}
      <ProfileImageUploader
        currentImage={profilePreview}
        onChange={(file, previewUrl) => {
          setProfileFile(file);
          setProfilePreview(previewUrl);
        }}
      />

      {/* 폼 */}
      <div className="p-4 space-y-4">
        <ProfileForm profileData={profileData} updateField={updateField} />
      </div>

      <Link to="/profile" className="px-4 py-2 text-black rounded">
        <button
          onClick={handleSave}
          className="px-6 py-1 text-white text-sm bg-blue-500 rounded-full"
        >
          완료
        </button>
      </Link>
    </div>
  );
}
