import React from 'react';
import { useActionMenu } from "@/components/modal/useActionMenu";
import { Settings, CreditCard, Trash2 } from "lucide-react";

// ProfileBarContent 컴포넌트 props 타입 정의
// Props는 타입을 명확하게 정의하기 위해서 인터페이스로 작성한다.
// 이는 선언된 타입 이외의 다른 타입이 들어오면, 오류 메시지를 보여준다.
interface ProfileContentProps {
  userId: number;
  profileType: 'self' | 'friend' | 'stranger' | 'wait';
  isVerified?: boolean;
}
// const { open: openMenu, ActionMenu } = useActionMenu();
// ProfileBarContent 컴포넌트
const ProfileContent: React.FC<ProfileContentProps> = ({
  userId,
  profileType,
  isVerified = false,
}) => {
  // ActionMenu 훅 사용
  // openMenu: 액션 시트 열기 함수
  // ActionMenu: 렌더링할 액션 시트 컴포넌트
  // confirm: 확인 모달 함수
  const { open: openMenu, confirm, ActionMenu } = useActionMenu();

  // 프로필 편집 또는 친구 관리 버튼 클릭 시 실행되는 함수
  // 각 버튼 클릭 시 다른 액션 시트를 보여줌
  const onEditProfile = async () => {
    
    // 3개 들어올 때 액션
    await openMenu({
      title: "내 프로필 관리",
      // 작업
      actions: [
        { id: "edit", label: "프로필 편집", type: "link", href: `/profileEdit/${userId}`, icon: <Settings className="h-5 w-5" /> },
        { id: "account", label: "계좌 관리", type: "link", href: "/accountManage", icon: <CreditCard className="h-5 w-5" /> },
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
    // 2개(행동 1 + 취소)
    const res = await openMenu({
      title: "친구 설정",
      actions: [
        {
          id: "delete_friend",
          label: "친구삭제",
          type: "fetch",
          request: { url: `/api/friend/${userId}`, method: "DELETE" },
          danger: true,
          icon: <Trash2 className="h-5 w-5" />,
        },
      ],
      cancelText: "취소",
      closeOnOverlay: false, // 파괴적 작업은 오버레이로 닫히지 않게
      showBack: true,
      onBack: () => {
        // 필요하면 이전 시트로 이동 로직
      },
    });

    if (res?.pickedId === "delete_friend") {
      // res.data에 서버 응답 있음 (JSON 또는 text)
      // TODO: 토스트/리프레시
    }
  };
  const renderButton = () => {
    switch (profileType) {
      case 'self':
        return (
          <button onClick={onEditProfile} className="text-lg rounded-lg px-4 py-2">...</button>
        );
      case 'stranger':
        return (
          <></>
        );
      case 'friend':
        return (
          <button onClick={onFriendMenu} className="rounded-lg px-4 py-2">...</button>
        );
      case 'wait':
        return (
          <></>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* 버튼을 상단 오른쪽으로 */}
      <div className="absolute top-2 right-2">
        <button
          onClick={onEditProfile}
          className="p-2 text-black"
        >
          ⋯
        </button>
      </div>
  
      {/* 나머지 프로필 내용 */}
      <div className="flex flex-col items-center">
        {/* 프로필 이미지, 이름, 닉네임 등 */}
      </div>
  
      {ActionMenu}
    </div>
  );
};

export default ProfileContent;
