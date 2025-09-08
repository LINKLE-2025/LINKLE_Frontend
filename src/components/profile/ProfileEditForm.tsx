import React from "react";
import type { ProfileDTO } from "@/types/user";

interface ProfileFormProps {
  profileData: ProfileDTO;
  updateField: (field: keyof ProfileDTO, value: string) => void;
}

function ProfileForm({ profileData, updateField }: ProfileFormProps) {
  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-6">
      {/* 기본 정보 변경 제목 */}
      <h2 className="text-center text-gray-800 font-semibold text-lg border-b pb-2">
        기본 정보 변경
      </h2>

      {/* 입력 필드 목록 */}
      <div className="space-y-4">
        {/* 이름 */}
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-gray-500 text-sm">이름</span>
          <input
            type="text"
            value={profileData.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="text-right text-sm text-gray-800 focus:outline-none w-2/3"
          />
        </div>

        {/* 비밀번호 */}
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-gray-500 text-sm">비밀번호</span>
          <input
            type="password"
            value={profileData.password ?? ""}
            onChange={(e) => updateField("password", e.target.value)}
            className="text-right text-sm text-gray-800 focus:outline-none w-2/3"
            placeholder="********"
          />
        </div>

        {/* 닉네임 */}
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-gray-500 text-sm">닉네임</span>
          <input
            type="text"
            value={profileData.nickname}
            onChange={(e) => updateField("nickname", e.target.value)}
            className="text-right text-sm text-gray-800 focus:outline-none w-2/3"
          />
        </div>

        {/* 성별 */}
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-gray-500 text-sm">성별</span>
          <input
            type="text"
            value={profileData.gender}
            onChange={(e) => updateField("gender", e.target.value)}
            className="text-right text-sm text-gray-800 focus:outline-none w-2/3"
          />
        </div>

        {/* 소개 */}
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-gray-500 text-sm">소개</span>
          <input
            type="text"
            value={profileData.intro}
            onChange={(e) => updateField("intro", e.target.value)}
            className="text-right text-sm text-gray-800 focus:outline-none w-2/3"
          />
        </div>

        {/* 이메일 */}
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-gray-500 text-sm">이메일</span>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="text-right text-sm text-gray-800 focus:outline-none w-2/3"
          />
        </div>
      </div>

      {/* 회원탈퇴 버튼 */}
      <div className="text-right">
        <button className="text-red-500 text-sm font-medium">회원탈퇴</button>
      </div>
    </div>
  );
}

export default ProfileForm;
