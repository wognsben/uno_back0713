import CommunityLayout from "../CommunityLayout";
import CommunityList from "../CommunityList";
import CommunityPagination from "../CommunityPagination";
import CommunitySearch from "../CommunitySearch";

import { COMMUNITY_POSTS } from "../community.data";

export default function NoticePage() {
    const items = COMMUNITY_POSTS.filter((item) => item.type === "notice");

    return (
        <CommunityLayout type="notice">
            <CommunitySearch placeholder="공지사항을 검색하세요." />
            <CommunityList type="notice" items={items} />
            <CommunityPagination currentPage={1} totalPages={2} />
        </CommunityLayout>
    );
}
