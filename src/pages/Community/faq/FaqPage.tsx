import { useState } from "react";

import CommunityLayout from "../CommunityLayout";

import { FAQ_CATEGORIES, FAQ_ITEMS } from "../community.data";

export default function FaqPage() {
    const [activeCategory, setActiveCategory] = useState("all");
    const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);

    const filteredItems =
        activeCategory === "all"
            ? FAQ_ITEMS
            : FAQ_ITEMS.filter((item) => item.categoryId === activeCategory);

    return (
        <CommunityLayout type="faq">
            <section className="community-faq">
                <div className="community-faq-category" aria-label="FAQ Category">
                    {FAQ_CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            className={`community-faq-category-button ${
                                activeCategory === category.id ? "is-active" : ""
                            }`}
                            type="button"
                            onClick={() => {
                                setActiveCategory(category.id);
                                setOpenId(null);
                            }}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>

                <div className="community-faq-list">
                    {filteredItems.map((item) => {
                        const isOpen = openId === item.id;

                        return (
                            <article
                                key={item.id}
                                className={`community-faq-item ${isOpen ? "is-open" : ""}`}
                            >
                                <button
                                    className="community-faq-question"
                                    type="button"
                                    onClick={() => setOpenId(isOpen ? null : item.id)}
                                    aria-expanded={isOpen}
                                >
                                    <span>{item.question}</span>
                                    <span className="community-faq-icon">+</span>
                                </button>

                                {isOpen && (
                                    <div className="community-faq-answer">
                                        <p>{item.answer}</p>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            </section>
        </CommunityLayout>
    );
}
