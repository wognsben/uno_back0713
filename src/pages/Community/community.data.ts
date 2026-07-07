import type {
    CommunityFaqCategory,
    CommunityFaqItem,
    CommunityNavItem,
    CommunityPost,
} from "./community.types";

/* ==========================================================
   Community Navigation
========================================================== */

export const COMMUNITY_NAV_ITEMS: CommunityNavItem[] = [
    {
        id: "review",
        label: "여행후기",
        labelEn: "Review",
        href: "/community/review",
        description: "여행자들의 생생한 후기",
    },
    {
        id: "notice",
        label: "공지사항",
        labelEn: "Notice",
        href: "/community/notice",
        description: "우노트래블의 새로운 소식",
    },
    {
        id: "event",
        label: "이벤트",
        labelEn: "Event",
        href: "/community/event",
        description: "진행중인 이벤트",
    },
    {
        id: "faq",
        label: "FAQ",
        labelEn: "FAQ",
        href: "/community/faq",
        description: "자주 묻는 질문",
    },
];

/* ==========================================================
   Temporary Board Data

   Backend Mapping 예정

   review
   notice
   event
========================================================== */

export const COMMUNITY_POSTS: CommunityPost[] = [
    {
        id: "1",
        type: "notice",
        title: "2026년 여름 시즌 예약 안내",
        excerpt: "예약 일정 및 운영 안내입니다.",
        date: "2026-07-07",
        views: 324,
        href: "/community/notice/1",
        isPinned: true,
        isNew: true,
    },
    {
        id: "2",
        type: "review",
        title: "돌로미티 세미패키지 여행 후기",
        excerpt: "평생 기억에 남을 최고의 여행이었습니다.",
        author: "UNO",
        date: "2026-07-05",
        views: 128,
        thumbnail: "/images/temp/review01.jpg",
        href: "/community/review/2",
    },
    {
        id: "3",
        type: "event",
        title: "여름 얼리버드 이벤트",
        excerpt: "예약 고객 대상 특별 혜택",
        date: "2026-07-01",
        views: 91,
        thumbnail: "/images/temp/event01.jpg",
        href: "/community/event/3",
        startDate: "2026-07-01",
        endDate: "2026-08-31",
        status: "active",
    },
];

/* ==========================================================
   FAQ Category
========================================================== */

export const FAQ_CATEGORIES: CommunityFaqCategory[] = [
    {
        id: "all",
        label: "전체",
    },
    {
        id: "reservation",
        label: "예약",
    },
    {
        id: "tour",
        label: "투어",
    },
    {
        id: "payment",
        label: "결제",
    },
];

/* ==========================================================
   FAQ Data
========================================================== */

export const FAQ_ITEMS: CommunityFaqItem[] = [
    {
        id: "1",
        categoryId: "reservation",
        question: "예약은 언제까지 가능한가요?",
        answer: "상품마다 예약 가능 기간이 다르며 상세페이지를 참고해주세요.",
    },
    {
        id: "2",
        categoryId: "payment",
        question: "결제는 어떻게 진행되나요?",
        answer: "카드 및 계좌이체를 지원합니다.",
    },
];