import { useActionMenu } from "@/components/modal/useActionMenu";
import { EllipsisVertical, RotateCw, Settings } from "lucide-react"

export default function AccountPage() {
    const { open: openMenu, confirm, ActionMenu } = useActionMenu();

    const onEditProfile = async () => {
        await openMenu({
            title: "계좌 관리",
            actions: [
                {
                    id: "edit",
                    label: "계좌 수정",
                    type: "link",
                    href: `/profile/account/edit`,
                    icon: <Settings className="h-5 w-5" />,
                },
            ],
            cancelText: "",
            closeOnOverlay: true,
        });
    };

    return (
        <div className="flex flex-col flex-1 w-full bg-blue-50/40 items-center gap-4 p-4">
            {/* 상단 컨텐츠 */}
            <div className="w-full border bg-white p-5 rounded-xl space-y-6">
                {/* 계좌 정보 */}
                <div className="flex justify-between items-center">
                    <div className="flex flex-row items-center">
                        {/* 은행사별 동적 아이콘 */}
                        {/* <img className="w-9 h-9 *:rounded-full mr-3"
                            src="/icons/account/Shinhan_Symbol.png"
                            alt="신한아이콘"
                        /> */}
                        {/* 은행사 정보 없을 경우 */}
                        <div className="w-9 h-9 rounded-full mr-3 bg-gray-200/60" />
                        <div className="flex flex-col items-start">
                            <p className="text-sm"><span className="font-bold">홍길동</span>님의 계좌</p>
                            <p className="text-xs text-black/50">신한 123-456-789012</p>
                        </div>
                    </div>
                    <button onClick={onEditProfile} className="p-2 rounded-xl hover:bg-gray-100/80">
                        <EllipsisVertical />
                    </button>
                </div>
                {/* 잔액 */}
                <div className="flex flex-row items-center space-x-0.5">
                    <h1 className="text-2xl xxs:text-3xl font-bold">1,000,000,000원</h1>
                    <div onClick={() => alert("잔액 새로고침")} className="p-1.5 text-gray-400 hover:text-linkleGray hover:bg-gray-100/80 rounded-xl cursor-pointer">
                        <RotateCw strokeWidth={2} />
                    </div>
                </div>
                {/* 입출금 버튼 */}
                <div className="flex justify-around space-x-4 px-2">
                    <button className="w-screen border rounded-lg bg-gray-100/20 hover:bg-gray-100/60 py-1.5"
                        onClick={() => alert("입금 기능")}>
                        <p>입금</p>
                    </button>
                    <button className="w-screen border rounded-lg bg-gray-100/20 hover:bg-gray-100/60 py-1.5"
                        onClick={() => alert("출금 기능")}>
                        <p>출금</p>
                    </button>
                </div>
            </div>
            {/* 하단 컨텐츠 */}
            <div className="flex-1 w-full border bg-white p-5 rounded-xl space-y-5">
                <div className="flex text-lg font-bold justify-between border-b">
                    <p>입출금 내역 조회</p>
                </div>
                <div className="flex flex-col space-y-6">
                    {/* 내역 없을 때 */}
                    {/* <p className="text-gray-400 mt-4">입출금 내역이 존재하지 않습니다.</p> */}


                    {/* Mock Data */}
                    <div className="flex justify-between">
                        <div className="items-start justify-start text-left">
                            <p className="text-xs text-black/50">2023-10-01 오후 2:30</p>
                            <p className="text-lg">클래스톡 참여비</p>
                        </div>
                        <div className="items-start justify-start text-right">
                            <p className="text-xs font-bold text-blue-600/90">입금</p>
                            <p className="text-lg font-bold text-blue-600/90">20,000원</p>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="items-start justify-start text-left">
                            <p className="text-xs text-black/50">2023-10-01 오후 2:30</p>
                            <p className="text-lg">링커 유지기간 연장</p>
                        </div>
                        <div className="items-start justify-start text-right">
                            <p className="text-xs font-bold text-red-600/90">출금</p>
                            <p className="text-lg font-bold text-red-600/90">5,000원</p>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="items-start justify-start text-left">
                            <p className="text-xs text-black/50">2023-10-01 오후 2:30</p>
                            <p className="text-lg">내 계좌로 출금</p>
                        </div>
                        <div className="items-start justify-start text-right">
                            <p className="text-xs font-bold text-red-600/90">출금</p>
                            <p className="text-lg font-bold text-red-600/90">300,000원</p>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="items-start justify-start text-left">
                            <p className="text-xs text-black/50">2023-10-01 오후 2:30</p>
                            <p className="text-lg">클래스톡 참여비</p>
                        </div>
                        <div className="items-start justify-start text-right">
                            <p className="text-xs font-bold text-blue-600/90">입금</p>
                            <p className="text-lg font-bold text-blue-600/90">20,000원</p>
                        </div>
                    </div>


                    {/* <div className="flex justify-between">
                        <div className="items-start justify-start text-left">
                            <p className="text-xs text-black/50">2023-10-01 오후 2:30</p>
                            <p className="text-lg">클래스톡 참여비</p>
                        </div>
                        <div className="items-start justify-start text-right">
                            <p className="text-xs font-bold text-blue-600/90">입금</p>
                            <p className="text-lg font-bold text-blue-600/90">20,000원</p>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="items-start justify-start text-left">
                            <p className="text-xs text-black/50">2023-10-01 오후 2:30</p>
                            <p className="text-lg">클래스톡 참여비</p>
                        </div>
                        <div className="items-start justify-start text-right">
                            <p className="text-xs font-bold text-blue-600/90">입금</p>
                            <p className="text-lg font-bold text-blue-600/90">20,000원</p>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="items-start justify-start text-left">
                            <p className="text-xs text-black/50">2023-10-01 오후 2:30</p>
                            <p className="text-lg">클래스톡 참여비</p>
                        </div>
                        <div className="items-start justify-start text-right">
                            <p className="text-xs font-bold text-blue-600/90">입금</p>
                            <p className="text-lg font-bold text-blue-600/90">20,000원</p>
                        </div>
                    </div> */}

                    {ActionMenu}
                </div>
            </div>
        </div >
    );
}