import React, { useState } from 'react';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import ProfileForm from '@/components/profile/ProfileForm';

const ProfileEditPage: React.FC = () => {
  const [profileData, setProfileData] = useState({
    name: '이정현',
    password: '••••••••••',
    nickname: 'qhrgn98',
    gender: '남자',
    intro: '신한 DS 금융 어플리케이션 5기',
    email: 'linkle@naver.com',
  });

  const updateField = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen flex flex-col">
      <ProfileHeader />
      <ProfileAvatar />
      <ProfileForm profileData={profileData} updateField={updateField} />
    </div>
  );
};

export default ProfileEditPage;
