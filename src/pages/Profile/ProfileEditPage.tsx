import { useParams } from "react-router-dom";
import ProfileEditContainer from "./ProfileEditContainer";

export default function ProfileEditPage() {
  const { userId } = useParams<{ userId: string }>();
  if (!userId) return <div>잘못된 접근입니다</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">프로필 편집</h1>
      <ProfileEditContainer userId={parseInt(userId, 10)} />
    </div>
  );
}
