import { useOutletContext, useParams } from "react-router-dom";
import ProfileEditContainer from "../../components/profile/ProfileEditContainer";
import { useEffect, useState } from "react";
import { getCurrentUserId } from "@/api/authApi";
import BackTitleHeader from "@/components/header/BackTitleHeader";

type OutletContextType = {
  footerHeight: number;
  headerHeight: number;
};
function ProfileEditPage() {
  // const { headerHeight, footerHeight } =
  //   useOutletContext<OutletContextType>();


  const [headerHeight, setHeaderHeight] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const id = await getCurrentUserId().catch(() => null);
      setCurrentUserId(id);
    })();
  }, []);

  if (!currentUserId) {
    return <div></div>;
  }

  console.log(headerHeight)
  return (
    <div className="max-w-full mx-auto">
      {/* <BackTitleHeader title="프로필 수정" /> */}
      <div>
        <ProfileEditContainer userId={currentUserId} />
      </div>
    </div>
  );
}
export default ProfileEditPage;
