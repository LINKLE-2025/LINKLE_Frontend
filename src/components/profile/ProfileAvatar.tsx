import React from 'react';
import { Camera, User } from 'lucide-react';

const ProfileAvatar: React.FC = () => (
  <div className="relative -mt-12 flex justify-center mb-6">
    <div className="relative">
      <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white">
        <User className="w-12 h-12 text-white" />
      </div>
      <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
        <Camera className="w-4 h-4 text-white" />
      </button>
    </div>
  </div>
);

export default ProfileAvatar;
