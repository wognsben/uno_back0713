import CommunityLayout from "../CommunityLayout";
import CommunityList from "../CommunityList";
import CommunityPagination from "../CommunityPagination";
import CommunitySearch from "../CommunitySearch";

import { COMMUNITY_POSTS } from "../community.data";

export default function EventPage() {
    const items = COMMUNITY_POSTS.filter((item) => item.type === "event");

    return (
        <CommunityLayout type="event">
            <CommunitySearch placeholder="이벤트를 검색하세요." />
            <CommunityList type="event" items={items} />
            <CommunityPagination currentPage={1} totalPages={1} />
        </CommunityLayout>
    );
}
