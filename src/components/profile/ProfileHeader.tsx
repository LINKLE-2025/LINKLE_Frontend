import React from 'react';
import { ChevronLeft, Camera } from 'lucide-react';

const ProfileHeader: React.FC = () => (
  <div className="relative">
    {/* 배경 이미지 */}
    <div className="h-48 bg-gradient-to-r from-blue-300 to-green-300 relative overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
        alt="Profile background"
        className="w-full h-full object-cover"
      />
    </div>

    {/* 상단 네비게이션 */}
    <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
      <button className="p-2 bg-black bg-opacity-20 rounded-full">
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg">완료</button>
    </div>

    {/* 배경 사진 변경 버튼 */}
    <div className="absolute bottom-4 right-4">
      <button className="flex items-center space-x-2 px-3 py-2 bg-black bg-opacity-50 text-white text-sm rounded-lg">
        <Camera className="w-4 h-4" />
        <span>배경사진 추가</span>
      </button>
    </div>
  </div>
);

export default ProfileHeader;
