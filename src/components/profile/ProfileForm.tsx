import React from 'react';
import InputField from '@/components/profile/InputField';

interface ProfileFormProps {
  profileData: {
    name: string;
    password: string;
    nickname: string;
    gender: string;
    intro: string;
    email: string;
  };
  updateField: (field: string, value: string) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profileData, updateField }) => (
  <div className="flex-1">
    <div className="mb-6">
      <div className="px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-900">사진 또는 별명 수정</h2>
      </div>
    </div>

    <div className="mb-6">
      <div className="px-4 py-2">
        <h3 className="text-base font-medium text-gray-900">기본 정보 변경</h3>
      </div>

      <div className="bg-white">
        <InputField label="이름" value={profileData.name} onChange={(value) => updateField('name', value)} />
        <InputField label="비밀번호" value={profileData.password} onChange={(value) => updateField('password', value)} type="password" />
        <InputField label="닉네임" value={profileData.nickname} onChange={(value) => updateField('nickname', value)} />
        <InputField label="성별" value={profileData.gender} onChange={(value) => updateField('gender', value)} />
        <InputField label="소개" value={profileData.intro} onChange={(value) => updateField('intro', value)} />
        <InputField label="이메일" value={profileData.email} onChange={(value) => updateField('email', value)} type="email" />
      </div>
    </div>

    {/* 회원탈퇴 */}
    <div className="px-4 py-4">
      <button className="text-red-500 text-base font-medium">회원탈퇴</button>
    </div>
  </div>
);

export default ProfileForm;
