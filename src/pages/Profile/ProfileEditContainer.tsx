import { useState, useEffect } from "react";
import ProfileForm from "@/components/profile/ProfileEditForm";
import { getUserProfile, patchUserProfile, type ProfileDTO } from "@/types/user";
import { Link } from "react-router-dom";

export default function ProfileEditContainer({ userId }: { userId: number }) {
  console.log("ProfileEditContainer userId:", userId);
  const [profileData, setProfileData] = useState<ProfileDTO>({
    name: "",
    password: "",
    nickname: "",
    gender: "",
    intro: "",
    email: "",
  });
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);

  // 초기 데이터 불러오기
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
    alert("✅ 프로필 저장 완료");
  };

  return (
    <div className="p-4 space-y-4">
      {/* 파일 업로드 */}
      <div>
        <label>프로필 이미지</label>
        <input type="file" accept="image/*" onChange={(e) => setProfileFile(e.target.files?.[0] ?? null)} />
      </div>
      <div>
        <label>배경 이미지</label>
        <input type="file" accept="image/*" onChange={(e) => setBackgroundFile(e.target.files?.[0] ?? null)} />
      </div>

      {/* 폼 */}
      <ProfileForm profileData={profileData} updateField={updateField} />
      <Link to="/profile" className="px-4 py-2 bg-gray-300 text-black rounded">
        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">
          저장
        </button>
      </Link>
      
    </div>
  );
}
