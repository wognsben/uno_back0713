// MyReservation.tsx
// 마이페이지의 예약목록 화면으로, 예약 신청 완료 데이터를 목록으로 보여준다.
// reservationStore의 완료 예약 목록을 읽어 예약일, 상품명, 투어일, 상태를 표시한다.
// 새 예약 작성 페이지와 달리 이미 접수된 예약을 확인하는 역할만 담당한다.

import { useEffect, useMemo, useState } from "react";
import { getMyReservations } from "../../api/reservationApi";
import {
  type SubmittedReservation,
  getSubmittedReservations,
} from "../product/product_com/reservationStore";

const FONT_EN = "var(--font-en)";
const FONT_KO = "var(--font-ko)";
const BLACK = "#151515";
const BORDER = "#E8E9E9";
const YELLOW = "#FCC800";

function navigateTo(path: string) {
  if (typeof window === "undefined") return;
  if (window.location.pathname === path) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event("unotravel:navigate"));
}

function getUserName() {
  if (typeof window === "undefined") return "회원";

  try {
    const raw = sessionStorage.getItem("unotravel:user");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.name || parsed?.userName || parsed?.mb_name || "회원";
  } catch {
    return "회원";
  }
}

function logout() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("unotravel:user");
  sessionStorage.removeItem("unotravel:auth");
  window.dispatchEvent(new Event("unotravel:auth-change"));
  navigateTo("/");
}

const MY_MENU = [
  { label: "마이페이지", path: "/mypage" },
  { label: "장바구니", path: "/mypage/cart" },
  { label: "예약목록", path: "/mypage/reservations" },
  { label: "1:1 문의하기", path: "/mypage/inquiry" },
  { label: "개인정보 수정", path: "/mypage/profile" },
  { label: "투어 신청 / 예약 현황", path: "/mypage/tour" },
];

const FALLBACK_RESERVATIONS = [
  {
    id: "R-2406-001",
    reservedAt: "2026.07.18",
    product: "나폴리 아말피 코스트 투어",
    tourDay: "2026.08.12",
    status: "예약 확인",
  },
  {
    id: "R-2406-002",
    reservedAt: "2026.07.20",
    product: "로마 바티칸 프리미엄 투어",
    tourDay: "2026.08.15",
    status: "예약 완료",
  },
];

const STYLE = `
  .mypage-shell {
    width: 100%;
    min-width: 1024px;
    min-height: calc(100vh - 110px);
    background: #fff;
    color: ${BLACK};
    overflow-x: hidden;
  }

  .mypage-inner {
    width: 100%;
    min-height: 780px;
    padding: 150px 54px 80px;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr);
    gap: 54px;
  }

  .mypage-side {
    position: sticky;
    top: 132px;
    align-self: start;
    border: 2px solid ${BORDER};
    border-radius: 22px;
    padding: 28px 24px 24px;
    box-sizing: border-box;
    background: #fff;
  }

  .mypage-side-kicker,
  .mypage-heading span {
    font-family: ${FONT_EN};
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: rgba(21,21,21,.48);
  }

  .mypage-side h1 {
    margin: 18px 0 10px;
    font-family: ${FONT_KO};
    font-size: 28px;
    line-height: 1.05;
    letter-spacing: -0.06em;
  }

  .mypage-side p,
  .notice-box p {
    margin: 0;
    font-family: ${FONT_KO};
    font-size: 14px;
    font-weight: 600;
    line-height: 1.55;
    letter-spacing: -0.04em;
    color: rgba(21,21,21,.62);
    word-break: keep-all;
  }

  .mypage-side p {
    margin-bottom: 28px;
    font-size: 13px;
  }

  .mypage-nav {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .mypage-nav button,
  .mypage-logout {
    border: none;
    background: transparent;
    cursor: pointer;
    font-family: ${FONT_KO};
  }

  .mypage-nav button {
    height: 42px;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    padding: 0 12px;
    border-radius: 14px;
    color: ${BLACK};
    font-size: 14px;
    font-weight: 800;
    letter-spacing: -0.04em;
    text-align: left;
    transition: background .22s ease, transform .22s ease;
  }

  .mypage-nav button:hover,
  .mypage-nav button.is-active {
    background: rgba(252,200,0,.18);
    transform: translateY(-1px);
  }

  .mypage-logout {
    width: 100%;
    height: 42px;
    margin-top: 18px;
    border-top: 1px solid ${BORDER};
    padding-top: 18px;
    color: rgba(21,21,21,.58);
    font-size: 13px;
    font-weight: 800;
    letter-spacing: -0.04em;
    text-align: left;
  }

  .mypage-heading {
    min-height: 186px;
    border-bottom: 2px solid ${BLACK};
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding-bottom: 34px;
    box-sizing: border-box;
  }

  .mypage-heading h2 {
    margin: 18px 0 16px;
    font-family: "Times New Roman", ${FONT_EN};
    font-size: 88px;
    font-weight: 400;
    line-height: .82;
    letter-spacing: -0.065em;
  }

  .mypage-heading p {
    margin: 0;
    max-width: 560px;
    font-family: ${FONT_KO};
    font-size: 17px;
    font-weight: 650;
    line-height: 1.6;
    letter-spacing: -0.045em;
    color: rgba(21,21,21,.68);
    word-break: keep-all;
  }

  .list {
    margin-top: 30px;
    border-top: 1px solid ${BORDER};
  }

  .list-row {
    display: grid;
    grid-template-columns: 150px 1fr 140px;
    gap: 24px;
    align-items: center;
    padding: 22px 0;
    border-bottom: 1px solid ${BORDER};
  }

  .list-row p {
    margin: 0;
    font-family: ${FONT_KO};
    font-size: 14px;
    font-weight: 600;
    line-height: 1.55;
    letter-spacing: -0.04em;
    color: rgba(21,21,21,.62);
    word-break: keep-all;
  }

  .list-row strong {
    font-family: ${FONT_KO};
    font-size: 18px;
    letter-spacing: -0.05em;
  }

  .tag {
    justify-self: end;
    height: 32px;
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 0 12px;
    background: rgba(252,200,0,.18);
    font-family: ${FONT_KO};
    font-size: 12px;
    font-weight: 850;
    letter-spacing: -0.04em;
  }

  .notice-box {
    margin-top: 24px;
    padding: 20px 22px;
    border-radius: 18px;
    background: rgba(21,21,21,.035);
  }

  @media (max-width: 1180px) {
    .mypage-inner {
      grid-template-columns: 260px minmax(0,1fr);
      gap: 32px;
      padding-left: 38px;
      padding-right: 38px;
    }

    .mypage-heading h2 {
      font-size: 72px;
    }
  }
`;

function MyPageLayout({ children }: { children: React.ReactNode }) {
  const userName = getUserName();

  return (
    <main className="mypage-shell">
      <style>{STYLE}</style>
      <section className="mypage-inner" aria-label="예약목록">
        <aside className="mypage-side">
          <div className="mypage-side-kicker">MY PAGE</div>
          <h1>{userName}님</h1>
          <p>예약과 문의, 회원 정보를 한곳에서 관리합니다.</p>

          <nav className="mypage-nav" aria-label="마이페이지 메뉴">
            {MY_MENU.map((item) => (
              <button
                key={item.path}
                type="button"
                className={item.path === "/mypage/reservations" ? "is-active" : ""}
                onClick={() => navigateTo(item.path)}
              >
                <span>{item.label}</span>
                <span aria-hidden="true">›</span>
              </button>
            ))}
          </nav>

          <button type="button" className="mypage-logout" onClick={logout}>
            로그아웃
          </button>
        </aside>

        <div className="mypage-content">
          <div className="mypage-heading">
            <span>RESERVATION</span>
            <h2>예약목록</h2>
            <p>예약일, 예약상품, 투어일, 현재 상태를 확인합니다.</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}

const formatDate = (value: number | string) => {
  const date = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
};

const formatTourDate = (item: SubmittedReservation) =>
  item.selectedDateLabel || item.selectedDateId || "예약 확정 시 안내";

type DisplayReservation = {
  id: string;
  reservedAt: string;
  product: string;
  tourDay: string;
  status: string;
};

const getDisplayReservations = () => {
  const submittedItems = getSubmittedReservations();
  if (!submittedItems.length) return FALLBACK_RESERVATIONS;

  return submittedItems.map((item) => ({
    id: item.reservationId,
    reservedAt: formatDate(item.submittedAt),
    product: item.title,
    tourDay: formatTourDate(item),
    status: item.status,
  }));
};

export default function MyReservation() {
  const [serverReservations, setServerReservations] = useState<DisplayReservation[] | null>(null);
  const [serverLoadFailed, setServerLoadFailed] = useState(false);
  const fallbackReservations = useMemo(() => getDisplayReservations(), []);
  const reservations = serverReservations ?? fallbackReservations;

  useEffect(() => {
    let isMounted = true;

    getMyReservations()
      .then((response) => {
        if (!isMounted) return;
        setServerReservations(
          response.items.map((item) => ({
            id: String(item.reservationNo || item.rid),
            reservedAt: item.createdAt || "-",
            product: item.product.title || "상품명 없음",
            tourDay: item.tourDate || "-",
            status: item.statusLabel || item.status,
          })),
        );
        setServerLoadFailed(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setServerLoadFailed(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <MyPageLayout>
      {serverLoadFailed ? (
        <div className="notice-box">
          <p>서버 예약내역을 불러오지 못해 임시 저장된 예약목록을 표시합니다. 로그인 상태를 확인해 주세요.</p>
        </div>
      ) : null}
      <div className="list">
        {reservations.map((item) => (
          <div className="list-row" key={item.id}>
            <p>
              {item.reservedAt}
              <br />
              {item.id}
            </p>
            <div>
              <strong>{item.product}</strong>
              <p>투어일 {item.tourDay}</p>
            </div>
            <span className="tag">{item.status}</span>
          </div>
        ))}
      </div>
      <div className="notice-box">
        <p>
          예약금 결제, 취소 요청, 바우처 출력은 백엔드 예약 데이터 연결 후 기존
          my_reser.php 흐름과 이어질 예정입니다.
        </p>
      </div>
    </MyPageLayout>
  );
}
