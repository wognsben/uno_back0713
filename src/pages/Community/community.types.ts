/**
 * Community Types
 * ------------------------------------------------------------
 * Review / Notice / Event / FAQ 공통 타입 정의
 *
 * Backend Mapping 예정
 * - Gnuboard board
 * - Review board
 * - Notice board
 * - Event board
 * - FAQ master / faq_list
 */

export type CommunityType = "review" | "notice" | "event" | "faq";

export type CommunityStatus = "active" | "closed" | "scheduled" | "default";

export type CommunityNavItem = {
    id: CommunityType;
    label: string;
    labelEn: string;
    href: string;
    description: string;
};

export type CommunityPost = {
    /**
     * Backend Mapping
     * - wr_id
     * - bo_table + wr_id 조합 가능
     */
    id: string;

    /**
     * Backend Mapping
     * - board type
     * - review / notice / event
     */
    type: Exclude<CommunityType, "faq">;

    /**
     * Backend Mapping
     * - wr_subject
     */
    title: string;

    /**
     * Backend Mapping
     * - wr_content 요약
     */
    excerpt?: string;

    /**
     * Backend Mapping
     * - wr_name
     */
    author?: string;

    /**
     * Backend Mapping
     * - wr_datetime
     */
    date: string;

    /**
     * Backend Mapping
     * - wr_hit
     */
    views?: number;

    /**
     * Backend Mapping
     * - 첨부 이미지
     * - cheditor 이미지
     * - 이벤트 썸네일
     */
    thumbnail?: string;

    /**
     * Backend Mapping
     * - 상세 페이지 링크
     * - SPA 전환용 href
     */
    href: string;

    /**
     * Backend Mapping
     * - 이벤트 진행 상태
     */
    status?: CommunityStatus;

    /**
     * Backend Mapping
     * - 이벤트 시작일
     */
    startDate?: string;

    /**
     * Backend Mapping
     * - 이벤트 종료일
     */
    endDate?: string;

    /**
     * Backend Mapping
     * - 공지사항 상단 고정 여부
     */
    isPinned?: boolean;

    /**
     * Backend Mapping
     * - 새 글 여부
     */
    isNew?: boolean;
};

export type CommunityFaqCategory = {
    /**
     * Backend Mapping
     * - g5_faq_master.fm_id
     */
    id: string;

    /**
     * Backend Mapping
     * - g5_faq_master.fm_subject
     */
    label: string;
};

export type CommunityFaqItem = {
    /**
     * Backend Mapping
     * - faq id
     */
    id: string;

    /**
     * Backend Mapping
     * - fm_id
     */
    categoryId: string;

    /**
     * Backend Mapping
     * - question subject
     */
    question: string;

    /**
     * Backend Mapping
     * - answer content
     */
    answer: string;
};

export type CommunityLayoutProps = {
    type: CommunityType;
};

export type CommunityListProps = {
    type: Exclude<CommunityType, "faq">;
    items: CommunityPost[];
};

export type CommunityCardProps = {
    item: CommunityPost;
};

export type CommunityDetailProps = {
    item: CommunityPost;
};

export type CommunitySearchProps = {
    placeholder?: string;
};

export type CommunityPaginationProps = {
    currentPage: number;
    totalPages: number;
};

export type CommunityNavigationProps = {
    active: CommunityType;
};