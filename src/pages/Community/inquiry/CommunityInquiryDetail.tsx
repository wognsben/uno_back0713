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

export default function CommunityInquiryDetail({ id }: Props) {
  const [item, setItem] = useState<CommunityBoardPost | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadDetail = () => {
    return getCommunityPostDetail("qna", id).then((response) => response.item);
  };

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

  const handleAnswerSubmit = async (content: string) => {
    await createCommunityInquiryAnswer(id, content, "qna");
    const nextItem = await loadDetail();
    setItem(nextItem);
  };

  const refreshDetail = async () => {
    const nextItem = await loadDetail();
    setItem(nextItem);
  };

  return (
    <CommunityLayout type="inquiry">
      {item ? (
        <CommunityDetail
          item={item}
          canAnswer={Boolean(item.canAnswer || isAdmin)}
          onAnswerSubmit={handleAnswerSubmit}
          onPostUpdate={async (payload) => {
            await updateCommunityPost("qna", id, payload);
            await refreshDetail();
          }}
          onPostDelete={async () => {
            await deleteCommunityPost("qna", id);
            window.history.pushState({}, "", "/community/inquiry");
            window.dispatchEvent(new Event("unotravel:navigate"));
          }}
          onCommentUpdate={async (commentId, content) => {
            await updateCommunityComment("qna", id, commentId, content);
            await refreshDetail();
          }}
          onCommentDelete={async (commentId) => {
            await deleteCommunityComment("qna", id, commentId);
            await refreshDetail();
          }}
        />
      ) : (
        <CommunityEmpty />
      )}
    </CommunityLayout>
  );
}
