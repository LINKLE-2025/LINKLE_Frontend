import { useState, useEffect, useRef } from "react";
import ProfileForm from "@/components/profile/ProfileEditForm";
import { type ProfileDTO } from "@/types/user";
import { Link } from "react-router-dom";
import { patchUserProfile, getUserProfile } from "@/api/profileApi";

export default function ProfileEditContainer({ userId }: { userId: number }) {
  // 프로필 데이터 초기 상태
  const [profileData, setProfileData] = useState<ProfileDTO>({
    name: "",
    password: "",
    nickname: "",
    gender: "",
    intro: "",
    email: "",
  });

  // 프필, 배경, 이미지
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);

  // 프로필 이미지 클릭시 프리뷰
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  // 이미지, 배경 변경
  // 렌더링과 무관하게 값을 저장해둠
  const bgInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);


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
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "background"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "profile") {
        setProfileFile(file);
        setProfilePreview(reader.result as string);
      } else {
        setBackgroundFile(file);
        setBgPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">

      {/* 배경 이미지 */}
      <div className="relative h-40 w-full bg-gray-200">
        {bgPreview && (
          <img
            src={bgPreview ?? `/api/user/view/background/${userId}`}
            alt="배경"
            className="w-full h-full object-cover"
            onClick={() => setPreviewImage(bgPreview ?? `/api/user/view/background/${userId}`)}
          />
        )}
        <button
          onClick={() => bgInputRef.current?.click()}
          className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 text-xs rounded"
        >
          배경사진 추가
        </button>
        <input
          ref={bgInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleImageChange(e, "background")}
          className="hidden"
        />
      </div>

      {/* 프로필 이미지 */}
      <div className="relative w-24 h-24 mx-auto -mt-12">
        <img
          src={`/api/user/view/profile/${userId}`}
          alt={`프로필`}
          className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-md"
          onClick={() => setPreviewImage(`/api/user/view/profile/${userId}`)}
        />
        <button
          onClick={() => profileInputRef.current?.click()}
          className="absolute bottom-0 right-0 bg-white p-1 rounded-full border"
        >
          <img src="/icons/user/camera.svg" alt="변경" className="w-4 h-4" />
        </button>
        <input
          ref={profileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleImageChange(e, "profile")}
          className="hidden"
        />
      </div>


      {/* 폼 */}
      <div className="p-4 space-y-4">
        <ProfileForm profileData={profileData} updateField={updateField} />
      </div>

      <Link to="/profile" className="px-4 py-2 bg-gray-300 text-black rounded">
        <button
          onClick={handleSave}
          className="px-6 py-1 text-white text-sm bg-blue-500 rounded-full"
        >
          완료
        </button>
      </Link>

      {/* 탈퇴 */}
      <div className="text-center mb-10">
        <button className="text-red-500 text-sm">회원탈퇴</button>
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="이미지 미리보기"
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
}




