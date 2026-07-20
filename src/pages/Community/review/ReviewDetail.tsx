import { useEffect, useState } from "react";

import {
    createCommunityInquiryAnswer,
    deleteCommunityComment,
    deleteCommunityPost,
    getAuthSession,
    getCommunityPostDetail,
    updateCommunityComment,
    updateCommunityPost,
    type CommunityBoardPost,
} from "../../../api/reservationApi";
import CommunityDetail from "../CommunityDetail";
import CommunityEmpty from "../CommunityEmpty";
import CommunityLayout from "../CommunityLayout";

type Props = {
    id: string;
};

export default function ReviewDetail({ id }: Props) {
    const [item, setItem] = useState<CommunityBoardPost | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const loadDetail = () => getCommunityPostDetail("review", id).then((response) => response.item);

    useEffect(() => {
        let isCancelled = false;

        loadDetail()
            .then((nextItem) => {
                if (isCancelled) return;
                setItem(nextItem);
            })
            .catch(() => {
                if (isCancelled) return;
                setItem(null);
            });

        getAuthSession()
            .then((session) => {
                if (isCancelled) return;
                setIsAdmin(Boolean(session.isLoggedIn && session.isAdmin));
            })
            .catch(() => {
                if (isCancelled) return;
                setIsAdmin(false);
            });

        return () => {
            isCancelled = true;
        };
    }, [id]);

    const refreshDetail = async () => {
        const nextItem = await loadDetail();
        setItem(nextItem);
    };

    return (
        <CommunityLayout type="review">
            {item ? (
                <CommunityDetail
                    item={item}
                    canAnswer={Boolean(item.canAnswer || isAdmin)}
                    onAnswerSubmit={async (content) => {
                        await createCommunityInquiryAnswer(id, content, "write");
                        await refreshDetail();
                    }}
                    onPostUpdate={async (payload) => {
                        await updateCommunityPost("write", id, payload);
                        await refreshDetail();
                    }}
                    onPostDelete={async () => {
                        await deleteCommunityPost("write", id);
                        window.history.pushState({}, "", "/community/review");
                        window.dispatchEvent(new Event("unotravel:navigate"));
                    }}
                    onCommentUpdate={async (commentId, content) => {
                        await updateCommunityComment("write", id, commentId, content);
                        await refreshDetail();
                    }}
                    onCommentDelete={async (commentId) => {
                        await deleteCommunityComment("write", id, commentId);
                        await refreshDetail();
                    }}
                />
            ) : (
                <CommunityEmpty />
            )}
        </CommunityLayout>
    );
}
