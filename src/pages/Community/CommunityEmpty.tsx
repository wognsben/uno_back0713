type CommunityEmptyProps = {
    title?: string;
    description?: string;
};

export default function CommunityEmpty({
    title = "게시글이 없습니다.",
    description = "등록된 게시글이 없습니다. 새로운 소식을 기다려주세요.",
}: CommunityEmptyProps) {
    return (
        <section className="community-empty">
            <div className="community-empty-inner">

                <div className="community-empty-icon">
                    —
                </div>

                <h2 className="community-empty-title">
                    {title}
                </h2>

                <p className="community-empty-description">
                    {description}
                </p>

            </div>
        </section>
    );
}