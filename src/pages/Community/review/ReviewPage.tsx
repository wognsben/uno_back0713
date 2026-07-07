import CommunityLayout from "../CommunityLayout";
import CommunityList from "../CommunityList";
import CommunityPagination from "../CommunityPagination";
import CommunitySearch from "../CommunitySearch";

import { COMMUNITY_POSTS } from "../community.data";

export default function ReviewPage() {
    const items = COMMUNITY_POSTS.filter((item) => item.type === "review");

    return (
        <CommunityLayout type="review">
            <CommunitySearch placeholder="여행후기를 검색하세요." />
            <CommunityList type="review" items={items} />
            <CommunityPagination currentPage={1} totalPages={3} />
        </CommunityLayout>
    );
}
