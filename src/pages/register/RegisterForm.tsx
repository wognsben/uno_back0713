// RegisterForm.tsx
// UNO Travel 회원가입 정보 입력 화면입니다.
// 기존 그누보드 회원 DB와 연결되는 리뉴얼 회원가입 API를 호출합니다.
import { useMemo, useState } from "react";
import { registerMember } from "../../api/reservationApi";

/* ==========================================================
   RegisterForm.tsx

   UNOTRAVEL Register Form Page

   사용 페이지
   - /register/form

   백엔드 연동
   ------------------------------------------
   member register       ← 기존 그누보드 회원 DB 생성
   register complete     ← 회원가입 완료 페이지 이동
========================================================== */

function navigateTo(path: string) {
  if (typeof window === "undefined") return;

  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event("unotravel:navigate"));
}

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState("");

  const canSubmit = useMemo(() => {
    return (
      name.trim().length > 0 &&
      email.trim().length > 0 &&
      phone.trim().length > 0 &&
      password.trim().length > 0 &&
      password === passwordConfirm
    );
  }, [email, name, password, passwordConfirm, phone]);

  function clearNotice() {
    if (notice) setNotice("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setNotice("필수 정보를 모두 입력해 주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      setNotice("비밀번호 확인 값이 일치하지 않습니다.");
      return;
    }

    setNotice("");
    setIsSubmitting(true);

    try {
      const session = await registerMember({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("unotravel:auth", "true");

        if (session.member?.name) {
          window.sessionStorage.setItem("unotravel:user-name", session.member.name);
        }

        if (session.member?.email) {
          window.sessionStorage.setItem("unotravel:user-email", session.member.email);
          window.sessionStorage.setItem("unotravel:email", session.member.email);
        }

        window.dispatchEvent(new Event("unotravel:auth-change"));
      }

      navigateTo("/register/complete");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "회원가입 중 문제가 발생했습니다. 다시 시도해 주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="register-form-shell">
      <style>{STYLE}</style>

      <section className="register-form-inner" aria-label="우노트래블 회원가입 입력">
        <aside className="register-form-aside" aria-label="회원가입 현재 단계">
          <button
            type="button"
            className="register-form-back-button"
            aria-label="약관 동의 페이지로 이동"
            onClick={() => navigateTo("/register/agreement")}
          >
            ←
          </button>

          <div className="register-form-aside-center">
            <div className="register-form-kicker">REGISTER STEP 02</div>

            <h1 className="register-form-title">회원정보 입력</h1>

            <p className="register-form-description">
              예약 내역과 문의 내역을 관리하기 위한 기본 정보를 입력합니다.
              계정 생성에 필요한 최소 정보만 받습니다.
            </p>
          </div>

          <div className="register-form-step-index" aria-hidden="true">
            <span>02</span>
            <strong>ACCOUNT FORM</strong>
          </div>
        </aside>

        <div className="register-form-content">
          <div className="register-form-document-header">
            <div>
              <span>INFORMATION</span>
              <strong>계정 생성 정보</strong>
            </div>

            <p>필수 입력</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit} noValidate>
            <label className="register-field register-field-name">
              <span>이름</span>
              <input
                type="text"
                value={name}
                placeholder="이름을 입력하세요"
                autoComplete="name"
                onChange={(event) => {
                  setName(event.target.value);
                  clearNotice();
                }}
              />
            </label>

            <label className="register-field register-field-email">
              <span>이메일 주소</span>
              <input
                type="email"
                value={email}
                placeholder="이메일 주소를 입력하세요"
                autoComplete="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearNotice();
                }}
              />
            </label>

            <label className="register-field register-field-phone">
              <span>휴대폰 번호</span>
              <input
                type="tel"
                value={phone}
                placeholder="휴대폰 번호를 입력하세요"
                autoComplete="tel"
                onChange={(event) => {
                  setPhone(event.target.value);
                  clearNotice();
                }}
              />
            </label>

            <div className="register-password-grid">
              <label className="register-field">
                <span>비밀번호</span>
                <div className="register-password-wrap">
                  <input
                    type={isPasswordVisible ? "text" : "password"}
                    value={password}
                    placeholder="비밀번호를 입력하세요"
                    autoComplete="new-password"
                    onChange={(event) => {
                      setPassword(event.target.value);
                      clearNotice();
                    }}
                  />
                  <button
                    type="button"
                    className={`register-password-toggle ${isPasswordVisible ? "is-visible" : ""}`}
                    aria-label={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
                    onClick={() => setIsPasswordVisible((prev) => !prev)}
                  >
                    <span aria-hidden="true" />
                  </button>
                </div>
              </label>

              <label className="register-field">
                <span>비밀번호 확인</span>
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  value={passwordConfirm}
                  placeholder="비밀번호를 다시 입력하세요"
                  autoComplete="new-password"
                  onChange={(event) => {
                    setPasswordConfirm(event.target.value);
                    clearNotice();
                  }}
                />
              </label>
            </div>
            {notice && (
              <p className="register-form-notice" role="alert" aria-live="polite">
                <span aria-hidden="true" />
                {notice}
              </p>
            )}

            <div className="register-form-actions">
              <button
                type="button"
                className="register-form-back"
                onClick={() => navigateTo("/register/agreement")}
              >
                이전
              </button>
              <button
                type="submit"
                className={`register-form-submit ${canSubmit ? "is-ready" : ""}`}
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? "계정 생성 중" : "계정 생성"}</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

const STYLE = `
  .register-form-shell {
    width: 100%;
    min-width: 1024px;
    min-height: 100vh;
    background: #ffffff;
    color: #111111;
    overflow-x: hidden;
  }

  .register-form-inner {
    width: 100%;
    min-height: 100vh;
    display: grid;
    grid-template-columns: minmax(360px, 34vw) minmax(620px, 1fr);
    gap: 0;
    padding: 14px;
    box-sizing: border-box;
    background: #ffffff;
    align-items: start;
  }

  .register-form-aside {
    position: sticky;
    top: 14px;
    min-height: calc(100vh - 28px);
    padding: 34px 44px 40px;
    box-sizing: border-box;
    display: grid;
    grid-template-rows: auto 1fr auto;
    border-right: 1px solid rgba(17, 17, 17, 0.12);
    background: #ffffff;
  }

  .register-form-back-button {
    width: 34px;
    height: 34px;
    border: 0;
    background: transparent;
    color: rgba(17, 17, 17, 0.48);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    font-family: var(--font-en);
    font-size: 26px;
    line-height: 1;
    transition: color 0.2s ease, transform 0.2s ease;
  }

  .register-form-back-button:hover {
    color: #111111;
    transform: translateX(-2px);
  }

  .register-form-aside-center {
    width: min(360px, 100%);
    align-self: center;
  }

  .register-form-kicker {
    margin: 0 0 34px;
    font-family: var(--font-en);
    font-size: 10px;
    line-height: 1;
    letter-spacing: 0.31em;
    font-weight: 760;
    color: rgba(17, 17, 17, 0.36);
  }

  .register-form-title {
    margin: 0;
    font-family: var(--font-ko);
    font-size: clamp(38px, 3.7vw, 56px);
    line-height: 1.08;
    letter-spacing: -0.075em;
    font-weight: 620;
    color: #111111;
    word-break: keep-all;
  }

  .register-form-description {
    max-width: 330px;
    margin: 36px 0 0;
    font-family: var(--font-ko);
    font-size: 13px;
    line-height: 1.86;
    letter-spacing: -0.04em;
    font-weight: 500;
    color: rgba(17, 17, 17, 0.56);
    word-break: keep-all;
  }

  .register-form-step-index {
    display: grid;
    gap: 8px;
    font-family: var(--font-en);
    line-height: 1;
  }

  .register-form-step-index span {
    font-size: 10px;
    letter-spacing: 0.22em;
    font-weight: 760;
    color: #111111;
  }

  .register-form-step-index span::after {
    content: "";
    display: block;
    width: 22px;
    height: 2px;
    margin-top: 16px;
    background: #fcc800;
  }

  .register-form-step-index strong {
    margin-top: 10px;
    font-size: 10px;
    letter-spacing: 0.18em;
    font-weight: 760;
    color: rgba(17, 17, 17, 0.38);
  }

  .register-form-content {
    min-height: calc(100vh - 28px);
    padding: 42px 54px 40px;
    box-sizing: border-box;
    background: #ffffff;
  }

  .register-form-document-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 40px;
    padding-bottom: 32px;
    border-bottom: 1px solid rgba(17, 17, 17, 0.22);
  }

  .register-form-document-header div {
    display: grid;
    gap: 9px;
  }

  .register-form-document-header span {
    font-family: var(--font-en);
    font-size: 10px;
    line-height: 1;
    letter-spacing: 0.26em;
    font-weight: 760;
    color: rgba(17, 17, 17, 0.36);
  }

  .register-form-document-header strong {
    font-family: var(--font-ko);
    font-size: 20px;
    line-height: 1.2;
    letter-spacing: -0.055em;
    font-weight: 640;
    color: #111111;
  }

  .register-form-document-header p {
    margin: 0;
    font-family: var(--font-ko);
    font-size: 12px;
    line-height: 1;
    letter-spacing: -0.035em;
    font-weight: 560;
    color: rgba(17, 17, 17, 0.46);
  }

  .register-form {
    width: min(100%, 850px);
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    column-gap: 42px;
    row-gap: 30px;
    padding-top: 58px;
    box-sizing: border-box;
  }

  .register-field {
    position: relative;
    min-height: 0;
    display: grid;
    grid-template-columns: 128px minmax(0, 1fr);
    gap: 24px;
    align-items: start;
    padding: 0 0 8px;
    box-sizing: border-box;
    border-bottom: 0;
    font-family: var(--font-ko);
    color: #111111;
  }

  .register-field::before,
  .register-field::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    display: block;
    pointer-events: none;
  }

  .register-field::before {
    height: 1px;
    background: rgba(17, 17, 17, 0.1);
    transition: background 0.2s ease;
  }

  .register-field::after {
    height: 1px;
    background: #111111;
    opacity: 0;
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 0.24s ease, opacity 0.2s ease, height 0.2s ease;
  }

  .register-field:hover::before {
    background: rgba(17, 17, 17, 0.2);
  }

  .register-field:has(input:not(:placeholder-shown))::after {
    opacity: 0.28;
    transform: scaleX(1);
  }

  .register-field:focus-within::after {
    height: 1.5px;
    opacity: 1;
    transform: scaleX(1);
  }

  .register-field-name,
  .register-field-email,
  .register-field-phone {
    grid-column: 1 / -1;
  }

  .register-field > span {
    padding-top: 8px;
    font-size: 12px;
    line-height: 1;
    font-weight: 620;
    letter-spacing: -0.035em;
    color: rgba(17, 17, 17, 0.72);
  }

  .register-field input {
    width: 100%;
    height: 34px;
    border: 0;
    border-radius: 0;
    background: transparent;
    padding: 0;
    box-sizing: border-box;
    font-family: var(--font-ko);
    font-size: 18px;
    line-height: 1.18;
    font-weight: 520;
    letter-spacing: -0.055em;
    color: #111111;
    outline: none;
    transition: color 0.2s ease;
  }

  .register-field input::placeholder {
    color: rgba(17, 17, 17, 0.28);
  }

  .register-field:focus-within > span {
    color: #111111;
  }

  .register-password-grid {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 42px;
    margin-top: 2px;
  }

  .register-password-grid .register-field {
    min-height: 0;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .register-password-grid .register-field > span {
    padding-top: 0;
  }

  .register-password-wrap {
    position: relative;
  }

  .register-password-wrap input {
    padding-right: 42px;
  }

  .register-password-toggle {
    position: absolute;
    right: 0;
    top: 50%;
    width: 28px;
    height: 28px;
    transform: translateY(-50%);
    border: 0;
    border-radius: 999px;
    background: transparent;
    padding: 0;
    cursor: pointer;
    opacity: 0.56;
    transition: opacity 0.18s ease, transform 0.18s ease;
  }

  .register-password-toggle:hover {
    opacity: 1;
    transform: translateY(-50%) scale(1.04);
  }

  .register-password-toggle span {
    position: absolute;
    left: 5px;
    top: 8px;
    width: 18px;
    height: 11px;
    border: 1.5px solid #111111;
    border-radius: 999px / 70%;
    box-sizing: border-box;
  }

  .register-password-toggle span::before {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 4px;
    height: 4px;
    border-radius: 999px;
    background: #111111;
    transform: translate(-50%, -50%);
  }

  .register-password-toggle.is-visible span::after {
    content: "";
    position: absolute;
    left: -2px;
    top: 4px;
    width: 22px;
    height: 1.5px;
    background: #111111;
    transform: rotate(-35deg);
    transform-origin: center;
  }

  .register-captcha {
    grid-column: 1 / -1;
    margin-top: 8px;
    padding: 30px 0 0;
    border-top: 1px solid rgba(17, 17, 17, 0.22);
    box-sizing: border-box;
  }

  .register-captcha-head {
    display: grid;
    grid-template-columns: 128px 1fr;
    gap: 24px;
    align-items: start;
    margin-bottom: 20px;
  }

  .register-captcha-head span {
    font-family: var(--font-ko);
    font-size: 12px;
    line-height: 1;
    font-weight: 620;
    letter-spacing: -0.035em;
    color: rgba(17, 17, 17, 0.72);
  }

  .register-captcha-head p {
    margin: 0;
    font-family: var(--font-ko);
    font-size: 12px;
    line-height: 1.62;
    letter-spacing: -0.04em;
    font-weight: 500;
    color: rgba(17, 17, 17, 0.48);
    word-break: keep-all;
  }

  .register-captcha-body {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 24px;
    align-items: center;
    margin-bottom: 20px;
  }

  .register-captcha-image-wrap {
    min-width: 226px;
    height: 58px;
    border: 1px solid rgba(17, 17, 17, 0.12);
    background:
      linear-gradient(135deg, rgba(17, 17, 17, 0.018), rgba(17, 17, 17, 0.04));
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    overflow: hidden;
  }

  .register-captcha-image {
    display: block;
    width: auto;
    max-width: 226px;
    height: 58px;
    object-fit: contain;
  }

  .register-captcha-image-wrap.is-fallback {
    background:
      linear-gradient(135deg, rgba(17, 17, 17, 0.018), rgba(17, 17, 17, 0.052));
  }

  .register-captcha-fallback {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 22px;
    padding: 0 18px;
    box-sizing: border-box;
    font-family: var(--font-en);
    color: rgba(17, 17, 17, 0.58);
  }

  .register-captcha-fallback span {
    font-size: 10px;
    line-height: 1;
    letter-spacing: 0.24em;
    font-weight: 760;
    color: rgba(17, 17, 17, 0.34);
  }

  .register-captcha-fallback strong {
    font-size: 13px;
    line-height: 1;
    letter-spacing: 0.18em;
    font-weight: 760;
    color: rgba(17, 17, 17, 0.72);
  }

  .register-captcha-tools {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .register-captcha-tools button {
    border: 0;
    background: transparent;
    padding: 0;
    cursor: pointer;
    font-family: var(--font-ko);
    font-size: 12px;
    line-height: 1;
    font-weight: 620;
    letter-spacing: -0.035em;
    color: rgba(17, 17, 17, 0.58);
    transition: color 0.2s ease, transform 0.2s ease;
  }

  .register-captcha-tools button:hover {
    color: #111111;
    transform: translateY(-1px);
  }

  .register-captcha-field {
    grid-template-columns: 128px 1fr;
    min-height: 76px;
  }

  .register-captcha-field input:disabled {
    cursor: not-allowed;
    color: rgba(17, 17, 17, 0.36);
  }

  .register-captcha-preview-note {
    margin: -6px 0 0 152px;
    font-family: var(--font-ko);
    font-size: 11px;
    line-height: 1.64;
    letter-spacing: -0.04em;
    font-weight: 500;
    color: rgba(17, 17, 17, 0.42);
    word-break: keep-all;
  }

  .register-form-notice {
    position: relative;
    grid-column: 1 / -1;
    margin: 4px 0 0;
    min-height: 42px;
    border: 1px solid rgba(17, 17, 17, 0.13);
    background: rgba(17, 17, 17, 0.032);
    padding: 13px 14px 13px 42px;
    box-sizing: border-box;
    font-family: var(--font-ko);
    font-size: 12px;
    line-height: 1.45;
    font-weight: 560;
    letter-spacing: -0.035em;
    color: rgba(17, 17, 17, 0.72);
    animation: registerFormNoticeIn 0.24s ease both;
  }

  .register-form-notice span {
    position: absolute;
    left: 14px;
    top: 50%;
    width: 16px;
    height: 16px;
    transform: translateY(-50%);
    border-radius: 999px;
    background: #111111;
  }

  .register-form-notice span::before,
  .register-form-notice span::after {
    content: "";
    position: absolute;
    left: 50%;
    background: #ffffff;
    transform: translateX(-50%);
  }

  .register-form-notice span::before {
    top: 3px;
    width: 1px;
    height: 6px;
  }

  .register-form-notice span::after {
    bottom: 3px;
    width: 2px;
    height: 2px;
    border-radius: 999px;
  }

  .register-form-actions {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 160px minmax(0, 1fr);
    gap: 12px;
    margin-top: 8px;
  }

  .register-form-back,
  .register-form-submit {
    height: 56px;
    cursor: pointer;
    box-sizing: border-box;
    font-family: var(--font-ko);
    font-size: 14px;
    font-weight: 650;
    letter-spacing: -0.025em;
    transition:
      transform 0.22s ease,
      background 0.22s ease,
      color 0.22s ease,
      border-color 0.22s ease;
  }

  .register-form-back {
    border: 1px solid rgba(17, 17, 17, 0.16);
    background: #ffffff;
    color: rgba(17, 17, 17, 0.68);
  }

  .register-form-back:hover {
    border-color: rgba(17, 17, 17, 0.38);
    color: #111111;
    transform: translateY(-1px);
  }

  .register-form-submit {
    border: 0;
    border-radius: 2px;
    background: #111111;
    color: #ffffff;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    padding: 0 22px;
  }

  .register-form-submit:hover {
    background: #fcc800;
    color: #111111;
    transform: translateY(-1px);
  }

  .register-form-submit:not(.is-ready) {
    background: rgba(17, 17, 17, 0.18);
    color: rgba(255, 255, 255, 0.82);
  }

  .register-form-submit:not(.is-ready):hover {
    background: #111111;
    color: #ffffff;
  }

  @keyframes registerFormNoticeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 1180px) {
    .register-form-inner {
      grid-template-columns: minmax(330px, 34vw) minmax(620px, 1fr);
    }

    .register-form-aside {
      padding-left: 34px;
      padding-right: 34px;
    }

    .register-form-content {
      padding-left: 38px;
      padding-right: 38px;
    }

    .register-form {
      column-gap: 32px;
    }

    .register-password-grid {
      gap: 32px;
    }

    .register-captcha-body {
      grid-template-columns: max-content 1fr;
    }
  }
`;
