import { useState, type FormEvent } from "react";

import type { CommunityDetailProps } from "./community.types";

function formatCommunityFileSize(size: number) {
    if (size >= 1024 * 1024) {
        return `${(size / 1024 / 1024).toFixed(1)}MB`;
    }

    if (size >= 1024) {
        return `${(size / 1024).toFixed(1)}KB`;
    }

    return `${size}B`;
}

function isInlineCommunityFile(source: string) {
    const extension = source.split(".").pop()?.toLowerCase() ?? "";
    return ["jpg", "jpeg", "png", "pdf"].includes(extension);
}

export default function CommunityDetail({
    item,
    canAnswer = false,
    onAnswerSubmit,
    onPostUpdate,
    onPostDelete,
    onCommentUpdate,
    onCommentDelete,
}: CommunityDetailProps) {
    const isEvent = item.type === "event";
    const listHref = item.board === "qna" ? "/community/inquiry" : `/community/${item.type}`;
    const [answerContent, setAnswerContent] = useState("");
    const [answerStatus, setAnswerStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [isAnswerSubmitting, setIsAnswerSubmitting] = useState(false);
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [editSubject, setEditSubject] = useState(item.title);
    const [editContent, setEditContent] = useState(item.contentText ?? item.excerpt ?? "");
    const [editIsSecret, setEditIsSecret] = useState(Boolean(item.isSecret));
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentContent, setEditingCommentContent] = useState("");

    const handleBackNavigate = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();

        if (window.location.pathname === listHref) {
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
            return;
        }

        window.history.pushState({}, "", listHref);
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        window.dispatchEvent(new Event("unotravel:navigate"));
    };

    const handleAnswerSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedContent = answerContent.trim();
        if (trimmedContent.length < 2 || !onAnswerSubmit) {
            setAnswerStatus({ type: "error", message: "답변 내용을 입력해 주세요." });
            return;
        }

        setIsAnswerSubmitting(true);
        setAnswerStatus(null);

        try {
            await onAnswerSubmit(trimmedContent);
            setAnswerContent("");
            setAnswerStatus({ type: "success", message: "답변을 등록했습니다." });
        } catch {
            setAnswerStatus({ type: "error", message: "답변 등록 중 문제가 발생했습니다." });
        } finally {
            setIsAnswerSubmitting(false);
        }
    };

    const handlePostUpdate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!onPostUpdate) return;
        await onPostUpdate({
            subject: editSubject.trim(),
            content: editContent.trim(),
            isSecret: editIsSecret,
        });
        setIsEditingPost(false);
    };

    const handlePostDelete = async () => {
        if (!onPostDelete || !window.confirm("게시글을 삭제할까요?")) return;
        await onPostDelete();
    };

    const startCommentEdit = (comment: NonNullable<typeof item.comments>[number]) => {
        setEditingCommentId(comment.id);
        setEditingCommentContent(comment.contentText ?? "");
    };

    const submitCommentEdit = async (commentId: string) => {
        if (!onCommentUpdate) return;
        await onCommentUpdate(commentId, editingCommentContent.trim());
        setEditingCommentId(null);
        setEditingCommentContent("");
    };

    const handleCommentDelete = async (commentId: string) => {
        if (!onCommentDelete || !window.confirm("답변을 삭제할까요?")) return;
        await onCommentDelete(commentId);
    };

    return (
        <article className={`community-detail community-detail--${item.type}`}>
            <header className="community-detail-header">
                <h1 className="community-detail-title">{item.title}</h1>

                <div className="community-detail-info">
                    {item.author && <span>{item.author}</span>}
                    <span>{item.date}</span>
                    {typeof item.views === "number" && <span>조회 {item.views}</span>}
                    {item.isSecret && <span>비밀글</span>}
                </div>
                {(item.canEdit || item.canDelete) && (
                    <div className="community-detail-actions">
                        {item.canEdit && (
                            <button type="button" onClick={() => setIsEditingPost((value) => !value)}>
                                수정
                            </button>
                        )}
                        {item.canDelete && (
                            <button type="button" onClick={handlePostDelete}>
                                삭제
                            </button>
                        )}
                    </div>
                )}
            </header>

            {isEditingPost && (
                <form className="community-detail-edit-form" onSubmit={handlePostUpdate}>
                    <input
                        value={editSubject}
                        onChange={(event) => setEditSubject(event.target.value)}
                        placeholder="제목"
                    />
                    <textarea
                        value={editContent}
                        onChange={(event) => setEditContent(event.target.value)}
                        rows={7}
                        placeholder="내용"
                    />
                    {item.board === "qna" && (
                        <label className="community-detail-secret-toggle">
                            <input
                                type="checkbox"
                                checked={editIsSecret}
                                onChange={(event) => setEditIsSecret(event.target.checked)}
                            />
                            <span>비밀글</span>
                        </label>
                    )}
                    <div className="community-detail-edit-actions">
                        <button type="submit">저장</button>
                        <button type="button" onClick={() => setIsEditingPost(false)}>
                            취소
                        </button>
                    </div>
                </form>
            )}

            {item.thumbnail && (
                <div
                    className="community-detail-thumbnail"
                    style={{ backgroundImage: `url(${item.thumbnail})` }}
                    aria-hidden="true"
                />
            )}

            {isEvent && item.startDate && item.endDate && (
                <div className="community-detail-period">
                    <span>EVENT PERIOD</span>
                    <strong>
                        {item.startDate} — {item.endDate}
                    </strong>
                </div>
            )}

            <div className="community-detail-content">
                {item.contentHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: item.contentHtml }} />
                ) : (
                    <p>{item.contentText ?? item.excerpt}</p>
                )}
            </div>

            {item.attachments && item.attachments.length > 0 && (
                <section className="community-detail-attachments" aria-label="첨부파일">
                    <h2>첨부파일</h2>
                    <div className="community-detail-attachment-list">
                        {item.attachments.map((file) => (
                            <a
                                key={`${file.no}-${file.source}`}
                                className="community-detail-attachment-link"
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span>{file.source}</span>
                                <small>
                                    {formatCommunityFileSize(file.size)} · {isInlineCommunityFile(file.source) ? "보기" : "다운로드"}
                                </small>
                            </a>
                        ))}
                    </div>
                </section>
            )}

            {item.comments && item.comments.length > 0 && (
                <section className="community-detail-comments">
                    <h2>답변</h2>
                    <div className="community-detail-comment-list">
                        {item.comments.map((comment) => (
                            <article className="community-detail-comment" key={comment.id}>
                                <div className="community-detail-comment-head">
                                    {comment.author && <strong>{comment.author}</strong>}
                                    <span>{comment.date}</span>
                                </div>
                                {editingCommentId === comment.id ? (
                                    <div className="community-detail-comment-edit">
                                        <textarea
                                            value={editingCommentContent}
                                            onChange={(event) => setEditingCommentContent(event.target.value)}
                                            rows={4}
                                        />
                                        <div>
                                            <button type="button" onClick={() => submitCommentEdit(comment.id)}>
                                                저장
                                            </button>
                                            <button type="button" onClick={() => setEditingCommentId(null)}>
                                                취소
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="community-detail-comment-body">
                                        {comment.contentHtml ? (
                                            <div dangerouslySetInnerHTML={{ __html: comment.contentHtml }} />
                                        ) : (
                                            <p>{comment.contentText}</p>
                                        )}
                                    </div>
                                )}
                                {(comment.canEdit || comment.canDelete) && editingCommentId !== comment.id && (
                                    <div className="community-detail-comment-actions">
                                        {comment.canEdit && (
                                            <button type="button" onClick={() => startCommentEdit(comment)}>
                                                수정
                                            </button>
                                        )}
                                        {comment.canDelete && (
                                            <button type="button" onClick={() => handleCommentDelete(comment.id)}>
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {canAnswer && (
                <section className="community-detail-answer">
                    <h2>우노트래블 답변</h2>
                    <form onSubmit={handleAnswerSubmit}>
                        <textarea
                            value={answerContent}
                            onChange={(event) => setAnswerContent(event.target.value)}
                            placeholder="공개 문의에 답변을 입력하세요."
                            rows={5}
                        />
                        {answerStatus && (
                            <p className={`community-detail-answer-status is-${answerStatus.type}`}>
                                {answerStatus.message}
                            </p>
                        )}
                        <button type="submit" disabled={isAnswerSubmitting}>
                            {isAnswerSubmitting ? "등록 중" : "답변 등록"}
                        </button>
                    </form>
                </section>
            )}

            <footer className="community-detail-footer">
                <a
                    href={listHref}
                    className="community-detail-back"
                    onClick={handleBackNavigate}
                >
                    목록으로
                </a>
            </footer>
        </article>
    );
}
