import type { CommunityType } from "./community.types";

type CommunityHeroProps = {
    type: CommunityType;
};

const HERO_CONTENT: Record<
    CommunityType,
    {
        eyebrow: string;
        title: string;
        description: string;
    }
> = {
    review: {
        eyebrow: "COMMUNITY",
        title: "여행후기",
        description:
            "우노트래블과 함께한 여행자들의 실제 경험을 만나보세요.",
    },

    notice: {
        eyebrow: "COMMUNITY",
        title: "공지사항",
        description:
            "여행 일정, 운영 변경, 새로운 소식을 가장 먼저 안내합니다.",
    },

    event: {
        eyebrow: "COMMUNITY",
        title: "이벤트",
        description:
            "현재 진행 중인 다양한 이벤트와 혜택을 확인해보세요.",
    },

    faq: {
        eyebrow: "COMMUNITY",
        title: "FAQ",
        description:
            "자주 묻는 질문을 빠르게 확인할 수 있습니다.",
    },
};

export default function CommunityHero({
    type,
}: CommunityHeroProps) {
    const hero = HERO_CONTENT[type];

    return (
        <section className="community-hero">

            <div className="community-hero-inner">

                <span className="community-hero-eyebrow">
                    {hero.eyebrow}
                </span>

                <h1 className="community-hero-title">
                    {hero.title}
                </h1>

                <p className="community-hero-description">
                    {hero.description}
                </p>

            </div>

        </section>
    );
}