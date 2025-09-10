import React from 'react';
import { useActionMenu } from "@/components/modal/useActionMenu";
import { Settings, CreditCard, Trash2, ChevronLeft, Ellipsis } from "lucide-react";
import { fr } from 'date-fns/locale';
import { deleteFriend } from "@/api/friendApi";
import { add } from 'date-fns';
import { useNavigate } from 'react-router-dom';

// ProfileBarContent 컴포넌트 props 타입 정의
// Props는 타입을 명확하게 정의하기 위해서 인터페이스로 작성한다.
// 이는 선언된 타입 이외의 다른 타입이 들어오면, 오류 메시지를 보여준다.
interface ProfileContentProps {
  userId: number;
  profileType: 'self' | 'friend' | 'stranger' | 'wait';
  isVerified?: boolean;
  friendId?: number;
  gender?: string;
  image?: string | null;
  background?: string | null;
  pathname: string;
}

// ProfileBarContent 컴포넌트
function ProfileBarContent({
  userId,
  profileType,
  friendId,
  isVerified = false,
  gender,
  image,
  background,
  pathname,
}: ProfileContentProps) {

  const navigate = useNavigate();

  const handleBack = () => {
    if (pathname) {
      navigate(pathname);
    } else {
      navigate(pathname); // 또는 navigate('/')
    }
  };



  // ActionMenu 훅 사용
  // openMenu: 액션 시트 열기 함수
  // ActionMenu: 렌더링할 액션 시트 컴포넌트
  // confirm: 확인 모달 함수
  const { open: openMenu, confirm, ActionMenu } = useActionMenu();
  // 프로필 편집 또는 친구 관리 버튼 클릭 시 실행되는 함수
  // 각 버튼 클릭 시 다른 액션 시트를 보여줌
  const onEditProfile = async () => {
    await openMenu({
      title: "내 프로필 관리",
      actions: [
        {
          id: "edit",
          label: "프로필 편집",
          type: "link",
          href: `/profileEdit/${userId}`,
          state: { gender, image, background },
          icon: <Settings className="h-5 w-5" />,
        },
        {
          id: "account",
          label: "계좌 관리",
          type: "link",
          href: "/accountManage",
          icon: <CreditCard className="h-5 w-5" />,
        },
      ],
      cancelText: "취소",
      closeOnOverlay: true,
    });
  };


  // 링커 생성시 실행되는 함수
  const onCreateLinker = async () => {
    const { confirmed, data } = await confirm({
      message: "링커를 생성하시겠습니까?",
      confirmText: "생성",
      cancelText: "취소",
      // 아래 셋 중 하나를 사용
      action: {
        type: "fetch",
        request: { url: "/api/linker", method: "POST", body: { /* payload */ } },
      },
      // action: { type: "link", href: "/linker/new" },
      // action: { type: "callback", run: () => doSomething() },
    });

    if (!confirmed) return;
    // 생성 성공 후 후처리 (data 사용 가능)
  };


  // 친구 관리 버튼 클릭시 실행되는 함수
  const onFriendMenu = async () => {
    // if (!friendId) {
    //   console.error("friendId가 없습니다. 삭제할 수 없습니다.");
    //   return;
    // }

    const res = await openMenu({
      title: "친구 설정",
      actions: [
        {
          id: "delete_friend",
          label: "친구삭제",
          type: "callback",
          onClick: async () => {
            try {
              await deleteFriend(friendId!);
            } catch (err) {
              console.error("친구 삭제 실패:", err);
            }
          },
          danger: true,
          icon: <Trash2 className="h-5 w-5" />,
        },
      ],
      cancelText: "취소",
      closeOnOverlay: false,
      showBack: true,
    });

    if (res?.pickedId === "delete_friend") {
      // UI 후처리 (예: 버튼 숨기거나 리스트 갱신)
    }
  };


  const renderButton = () => {
    switch (profileType) {
      case 'self':
        return (
          <Ellipsis onClick={onEditProfile} className="px-4 py-2" />
        );
      case 'stranger':
        return (
          <></>
        );
      case 'friend':
        return (
          <Ellipsis onClick={onFriendMenu} className="px-4 py-2" />
        );
      case 'wait':
        return (
          <></>
        );
      default:
        return null;
    }
  };

  const backButton = () => {
    switch (profileType) {
      case 'self':
        return (
          <></>
        );
      case 'stranger':
        return (
          <></>
        );
      case 'friend':
        return (
          <ChevronLeft
            onClick={onFriendMenu}
            className="w-6 h-6 text-gray-800 cursor-pointer hover:opacity-80"
          ></ChevronLeft>
        );
      case 'wait':
        return (
          <ChevronLeft
            onClick={onFriendMenu}
            className="w-6 h-6 text-gray-800 cursor-pointer hover:opacity-80"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-between items-center w-full px-4 mt-2 z-20">
      {/* 왼쪽 ← 버튼 또는 빈 공간 */}
      <div className="w-6">
        {profileType === 'friend' || profileType === 'wait' ? (
          <ChevronLeft
            onClick={handleBack}
            className="w-6 h-6 text-gray-900 cursor-pointer hover:opacity-80"
          />
        ) : null}
      </div>

      {/* 오른쪽 ⋯ 버튼 */}
      <div>
        {(profileType === 'self' || profileType === 'friend') && (
          <button onClick={profileType === 'self' ? onEditProfile : onFriendMenu} className="w-8 h-8 flex items-center justify-center text-xl">
            ⋯
          </button>
        )}
      </div>
      {ActionMenu}
    </div>

  );
}

export default ProfileBarContent;
