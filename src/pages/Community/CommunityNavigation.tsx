import { COMMUNITY_NAV_ITEMS } from "./community.data";

import type { CommunityNavigationProps } from "./community.types";

export default function CommunityNavigation({
    active,
}: CommunityNavigationProps) {
    return (
        <nav
            className="community-navigation"
            aria-label="Community Navigation"
        >
            <ul className="community-navigation-list">
                {COMMUNITY_NAV_ITEMS.map((item) => (
                    <li
                        key={item.id}
                        className="community-navigation-item"
                    >
                        <a
                            href={item.href}
                            className={`community-navigation-link ${
                                active === item.id ? "is-active" : ""
                            }`}
                            onClick={(event) => {
                                event.preventDefault();

                                window.history.pushState({}, "", item.href);

                                window.dispatchEvent(
                                    new Event("unotravel:navigate")
                                );
                            }}
                        >
                            <span className="community-navigation-label">
                                {item.label}
                            </span>

                            <span className="community-navigation-label-en">
                                {item.labelEn}
                            </span>
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}