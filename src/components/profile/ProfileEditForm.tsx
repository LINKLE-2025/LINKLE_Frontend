import React from "react";
import type { ProfileDTO } from "@/types/user";

interface ProfileFormProps {
  profileData: ProfileDTO;
  updateField: (field: keyof ProfileDTO, value: string) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profileData, updateField }) => (
  <div className="space-y-3">
    <input
      type="text"
      placeholder="이름"
      value={profileData.name}
      onChange={(e) => updateField("name", e.target.value)}
      className="border p-2 w-full"
    />
    <input
      type="password"
      placeholder="비밀번호"
      value={profileData.password ?? ""}
      onChange={(e) => updateField("password", e.target.value)}
      className="border p-2 w-full"
    />
    <input
      type="text"
      placeholder="닉네임"
      value={profileData.nickname}
      onChange={(e) => updateField("nickname", e.target.value)}
      className="border p-2 w-full"
    />
    <input
      type="text"
      placeholder="성별"
      value={profileData.gender}
      onChange={(e) => updateField("gender", e.target.value)}
      className="border p-2 w-full"
    />
    <input
      type="text"
      placeholder="소개"
      value={profileData.intro}
      onChange={(e) => updateField("intro", e.target.value)}
      className="border p-2 w-full"
    />
    <input
      type="email"
      placeholder="이메일"
      value={profileData.email}
      onChange={(e) => updateField("email", e.target.value)}
      className="border p-2 w-full"
    />
  </div>
);

export default ProfileForm;
