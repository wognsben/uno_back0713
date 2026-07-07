import CommunityCard from "./CommunityCard";
import CommunityEmpty from "./CommunityEmpty";

import type { CommunityListProps } from "./community.types";

export default function CommunityList({
    items,
}: CommunityListProps) {
    if (items.length === 0) {
        return <CommunityEmpty />;
    }

    return (
        <section
            className="community-list"
            aria-label="Community List"
        >
            {items.map((item) => (
                <CommunityCard
                    key={item.id}
                    item={item}
                />
            ))}
        </section>
    );
}