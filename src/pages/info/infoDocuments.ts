/* ==========================================================
   infoDocuments
   ----------------------------------------------------------
   UNO TRAVEL INFO 문서 데이터 단일 관리 파일

   주의:
   - 이 파일은 .ts 파일이므로 JSX를 절대 넣지 않는다.
   - InfoDocumentNav 컴포넌트는 InfoDocumentNav.tsx에서만 관리한다.
========================================================== */

export type InfoDocumentId = "guide_use" | "notice" | "refund" | "rule";

export type InfoDocumentItem = {
  id: InfoDocumentId;
  number: string;
  label: string;
  title: string;
  description: string;
  path: string;
};

export const INFO_DOCUMENT_ITEMS: InfoDocumentItem[] = [
  {
    id: "guide_use",
    number: "01",
    label: "GUIDE USE",
    title: "이용방법",
    description: "우노트래블 예약과 이용 절차를 확인합니다.",
    path: "/info/guide_use",
  },
  {
    id: "notice",
    number: "02",
    label: "NOTICE",
    title: "공지사항",
    description: "여행 전 확인해야 할 주요 공지사항을 안내합니다.",
    path: "/info/notice",
  },
  {
    id: "refund",
    number: "03",
    label: "REFUND POLICY",
    title: "취소 및 환불규정",
    description: "취소 및 환불 기준을 확인합니다.",
    path: "/info/refund",
  },
  {
    id: "rule",
    number: "04",
    label: "TRAVEL TERMS",
    title: "여행자 약관",
    description: "여행자 약관과 이용 조건을 확인합니다.",
    path: "/info/rule",
  },
];

export function getInfoDocument(id: InfoDocumentId) {
  return INFO_DOCUMENT_ITEMS.find((item) => item.id === id);
}

export function getInfoDocumentByPath(path: string) {
  return INFO_DOCUMENT_ITEMS.find((item) => item.path === path);
}
