import type { ReactNode } from "react";

import CommunityHero from "./CommunityHero";
import CommunityNavigation from "./CommunityNavigation";

import type { CommunityLayoutProps } from "./community.types";

type Props = CommunityLayoutProps & {
    children: ReactNode;
};

export default function CommunityLayout({
    type,
    children,
}: Props) {
    return (
        <main className="community-page">

            <CommunityHero type={type} />

            <CommunityNavigation active={type} />

            <section className="community-content">
                {children}
            </section>

        </main>
    );
}