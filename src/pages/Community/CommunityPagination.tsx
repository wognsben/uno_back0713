import type { CommunityPaginationProps } from "./community.types";

export default function CommunityPagination({
    currentPage,
    totalPages,
}: CommunityPaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <nav className="community-pagination" aria-label="Community Pagination">
            <button
                className="community-pagination-button"
                type="button"
                disabled={currentPage <= 1}
            >
                이전
            </button>

            <div className="community-pagination-numbers">
                {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;

                    return (
                        <button
                            key={page}
                            className={`community-pagination-number ${
                                currentPage === page ? "is-active" : ""
                            }`}
                            type="button"
                            aria-current={currentPage === page ? "page" : undefined}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            <button
                className="community-pagination-button"
                type="button"
                disabled={currentPage >= totalPages}
            >
                다음
            </button>
        </nav>
    );
}
