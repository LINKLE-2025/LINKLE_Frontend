import MainFooter from "@/components/footer/MainFooter";
import BackTitleHeader from "@/components/header/BackTitleHeader";
import MainHeader from "@/components/header/MainHeader";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

export default function AccountLayout() {
    const location = useLocation();
    const [headerHeight, setHeaderHeight] = useState(0);
    const [footerHeight, setFooterHeight] = useState(0);

    // 전역 상태로 링커 생성 모드 관리
    const [linkerCreateMode, setLinkerCreateMode] = useState(false);

    // Header 컴포넌트 동적 설정
    let header;
    switch (true) {
        case location.pathname.startsWith("/post"):
            header = <BackTitleHeader title="포스트" className="bg-white" />;
            break;
        case location.pathname.startsWith("/profile/account/edit"):
            header = <BackTitleHeader title="계좌 수정" className="bg-white" />;
            break;
        case location.pathname.startsWith("/profile/account"):
            header = <BackTitleHeader title="계좌 관리" className="bg-white" />;
            break;

        default:
            header = <MainHeader />;
            break;
    }

    // Header 뒤쪽 paddingTop 높이 동적으로 조정
    useEffect(() => {
        const header = document.querySelector("header");
        if (header) {
            setHeaderHeight(header.clientHeight);
        }
    }, []);

    // Footer 뒤쪽 paddingBottom 높이 동적으로 조정
    useEffect(() => {
        const footer = document.querySelector("footer");
        if (footer) {
            setFooterHeight(footer.clientHeight);
        }
    }, []);

    return (
        <div className='relative flex flex-col min-h-[100dvh] text-black'>
            {/* Header */}
            {header}

            {/* Outlet */}
            <main
                className={`flex flex-col flex-1 items-center text-center pt-[52px] pb-[calc(4.8rem+env(safe-area-inset-bottom))]
          ${location.pathname === "/signup" ? "justify-start sm:justify-center" : "justify-center"}`}
            >
                <Outlet context={{ headerHeight, footerHeight, linkerCreateMode, setLinkerCreateMode }} />
            </main>

            {/* Footer */}
            <MainFooter linkerCreateMode={linkerCreateMode} setLinkerCreateMode={setLinkerCreateMode} />
        </div>
    );
}
