import { useState, type FormEvent } from "react";

import { UnoApiRequestError } from "../../../api/apiClient";
import { isLocalAuthSessionActive } from "../../../api/authSession";
import { createCommunityReview } from "../../../api/reservationApi";
import CommunityLayout from "../CommunityLayout";
import CommunityList from "../CommunityList";
import CommunityPagination from "../CommunityPagination";
import CommunitySearch from "../CommunitySearch";
import { useCommunityPosts } from "../useCommunityPosts";

const LOGIN_PATH = "/login";
const ALLOWED_ATTACHMENT_EXTENSIONS = ["jpg", "jpeg", "png", "pdf", "doc", "docx", "xls", "xlsx"];
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

function formatAttachmentSize(size: number) {
    if (size >= 1024 * 1024) {
        return `${(size / 1024 / 1024).toFixed(1)}MB`;
    }

    if (size >= 1024) {
        return `${(size / 1024).toFixed(1)}KB`;
    }

    return `${size}B`;
}

function isAllowedAttachment(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    return ALLOWED_ATTACHMENT_EXTENSIONS.includes(extension) && file.size <= MAX_ATTACHMENT_SIZE;
}

function navigateTo(path: string) {
    if (typeof window === "undefined") return;

    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("unotravel:navigate"));
}

export default function ReviewPage() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [attachment, setAttachment] = useState<File | null>(null);
    const [status, setStatus] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        items,
        page,
        search,
        totalPages,
        setPage,
        handleSearch,
        reload,
    } = useCommunityPosts("review");

    const openLogin = () => {
        if (typeof window !== "undefined") {
            window.sessionStorage.setItem("unotravel:redirect-after-login", "/community/review");
        }

        navigateTo(LOGIN_PATH);
    };

    const handleAttachmentChange = (fileList: FileList | null) => {
        const file = fileList?.[0] ?? null;
        if (!file) {
            setAttachment(null);
            return;
        }

        if (!isAllowedAttachment(file)) {
            setAttachment(null);
            setStatus({
                type: "error",
                message: "JPG, PNG, PDF, DOC, DOCX, XLS, XLSX / 최대 10MB 파일 1개만 첨부할 수 있습니다.",
            });
            return;
        }

        setAttachment(file);
        setStatus(null);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!isLocalAuthSessionActive()) {
            setIsLoginModalOpen(true);
            return;
        }

        const trimmedSubject = subject.trim();
        const trimmedContent = content.trim();

        if (trimmedSubject.length < 2) {
            setStatus({ type: "error", message: "리뷰 제목을 입력해 주세요." });
            return;
        }

        if (trimmedContent.length < 10) {
            setStatus({ type: "error", message: "리뷰 내용은 10자 이상 입력해 주세요." });
            return;
        }

        setIsSubmitting(true);
        setStatus(null);

        try {
            await createCommunityReview({
                subject: trimmedSubject,
                content: trimmedContent,
                attachment,
            });
            setSubject("");
            setContent("");
            setAttachment(null);
            setPage(1);
            reload();
            setStatus({ type: "success", message: "여행후기가 등록되었습니다." });
        } catch (error) {
            const message =
                error instanceof UnoApiRequestError
                    ? error.response.error.message
                    : "여행후기 등록 중 문제가 발생했습니다.";
            setStatus({ type: "error", message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <CommunityLayout type="review">
            <section className="community-review-write">
                <div className="community-review-write-head">
                    <span>TRAVEL REVIEW</span>
                    <h2>여행후기 작성</h2>
                    <p>다른 여행자에게 도움이 되는 경험과 사진, 문서를 함께 남길 수 있습니다.</p>
                </div>

                <form className="community-inquiry-form" onSubmit={handleSubmit}>
                    <label>
                        <span>리뷰 제목</span>
                        <input
                            value={subject}
                            onChange={(event) => setSubject(event.target.value)}
                            placeholder="예: 동유럽 세미패키지 후기"
                        />
                    </label>
                    <label>
                        <span>리뷰 내용</span>
                        <textarea
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            placeholder="여행 일정, 가이드, 숙소, 좋았던 점 등을 자유롭게 작성해 주세요."
                            rows={7}
                        />
                    </label>
                    <div className="community-inquiry-attachment">
                        <div className="community-inquiry-attachment-controls">
                            <label className="community-inquiry-file-button" htmlFor="community-review-attachment">
                                첨부파일 선택
                            </label>
                            <button
                                type="button"
                                className="community-inquiry-file-remove"
                                onClick={() => setAttachment(null)}
                                disabled={!attachment}
                            >
                                삭제
                            </button>
                            <span className="community-inquiry-file-name">
                                {attachment
                                    ? `${attachment.name} (${formatAttachmentSize(attachment.size)})`
                                    : "선택된 파일 없음"}
                            </span>
                        </div>
                        <input
                            id="community-review-attachment"
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                            onChange={(event) => handleAttachmentChange(event.target.files)}
                        />
                        <p>JPG, PNG, PDF, DOC, DOCX, XLS, XLSX / 최대 10MB / 1개</p>
                    </div>
                    {status && (
                        <p className={`community-inquiry-status is-${status.type}`}>
                            {status.message}
                        </p>
                    )}
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "등록 중" : "여행후기 등록"}
                    </button>
                </form>
            </section>

            <CommunitySearch
                placeholder="여행후기를 검색하세요."
                value={search}
                onSearch={handleSearch}
            />
            <CommunityList type="review" items={items} />
            <CommunityPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />

            {isLoginModalOpen && (
                <div
                    className="community-login-backdrop"
                    role="presentation"
                    onClick={() => setIsLoginModalOpen(false)}
                >
                    <div
                        className="community-login-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="community-review-login-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <span>LOGIN REQUIRED</span>
                        <h2 id="community-review-login-title">로그인이 필요합니다.</h2>
                        <p>
                            여행후기를 작성하려면 로그인이 필요합니다. 로그인 후 커뮤니티 여행후기 화면으로 돌아옵니다.
                        </p>
                        <div className="community-login-actions">
                            <button type="button" onClick={() => setIsLoginModalOpen(false)}>
                                계속 보기
                            </button>
                            <button type="button" onClick={openLogin}>
                                로그인 화면으로 이동
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CommunityLayout>
    );
}
