import type { CommunitySearchProps } from "./community.types";

export default function CommunitySearch({
    placeholder = "검색어를 입력하세요.",
}: CommunitySearchProps) {
    return (
        <section className="community-search" aria-label="Community Search">
            <div className="community-search-inner">
                <label className="community-search-label" htmlFor="community-search-input">
                    SEARCH
                </label>

                <input
                    id="community-search-input"
                    className="community-search-input"
                    type="search"
                    placeholder={placeholder}
                />

                <button className="community-search-button" type="button">
                    검색
                </button>
            </div>
        </section>
    );
}
