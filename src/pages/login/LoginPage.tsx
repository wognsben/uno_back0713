import { useState } from "react";

import googleLogo from "./snsloginlogo.tsx/google_logo.png";
import kakaoLogo from "./snsloginlogo.tsx/kakao_logo.png";
import naverLogo from "./snsloginlogo.tsx/naver_login.png";
import loginVideo from "./snsloginlogo.tsx/login_video.mp4";

/* ==========================================================
   LoginPage.tsx

   UNOTRAVEL Login Page

   사용 페이지
   - /login

   백엔드 연동
   ------------------------------------------
   email/password login  ← 기존 회원 로그인
   social login          ← Google / Kakao / Naver OAuth 연결 예정
   register              ← 회원가입 페이지 이동 예정
   find password          ← 비밀번호 찾기 페이지 이동 예정

   Header / Footer는 App.tsx 공통 컴포넌트 사용
========================================================== */

type SocialProvider = "google" | "kakao" | "naver";

function navigateTo(path: string) {
  if (typeof window === "undefined") return;

  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event("unotravel:navigate"));
}

const SOCIAL_PROVIDER_LABEL: Record<SocialProvider, string> = {
  google: "Google",
  kakao: "Kakao",
  naver: "Naver",
};

const SOCIAL_PROVIDER_LOGO: Record<SocialProvider, string> = {
  google: googleLogo,
  kakao: kakaoLogo,
  naver: naverLogo,
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [socialNotice, setSocialNotice] = useState("");

  function handleSocialLogin(provider: SocialProvider) {
    /*
      Social Login Backend Hook
      ------------------------------------------
      실제 백엔드 연동 시 provider별 OAuth endpoint로 교체한다.

      예)
      - /auth/google
      - /auth/kakao
      - /auth/naver

      현재는 프론트 UI/동선 확인용 placeholder다.
    */
    console.log(`[UNOTRAVEL] social login requested: ${provider}`);
    setSocialNotice(`${SOCIAL_PROVIDER_LABEL[provider]} 로그인은 현재 준비 중입니다.`);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    /*
      Email Login Backend Hook
      ------------------------------------------
      실제 백엔드 연동 시 이 위치에서 로그인 API를 호출한다.
      현재는 UI/동선 확인용 placeholder다.
    */
    console.log("[UNOTRAVEL] login requested", {
      email,
    });

    /*
      Temporary Front Auth
      ------------------------------------------
      실제 세션 로그인 연동 전까지 프론트 동선 확인용으로만 사용한다.
      localStorage가 아닌 sessionStorage를 사용해 브라우저 세션 종료 시 초기화된다.
    */
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("unotravel:auth", "true");
      window.dispatchEvent(new Event("unotravel:auth-change"));
    }

    navigateTo("/");
  }

  return (
    <main className="login-page-shell">
      <style>{STYLE}</style>

      <section className="login-page-inner" aria-label="우노트래블 로그인">
        <div className="login-content">
          <button
            type="button"
            className="login-back-button"
            aria-label="이전 페이지로 이동"
            onClick={() => navigateTo("/")}
          >
            ←
          </button>

          <div className="login-form-center">
            <div className="login-kicker">UNOTRAVEL ACCOUNT</div>

            <h1 className="login-title">로그인</h1>
            <p className="login-description">
              예약 내역과 문의 내역을 확인하려면 로그인해 주세요.
            </p>

            <form className="login-form" onSubmit={handleSubmit}>
              <label className="login-field">
                <span>이메일 주소</span>
                <input
                  type="email"
                  value={email}
                  placeholder="이메일"
                  autoComplete="email"
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>

              <label className="login-field">
                <span>비밀번호</span>
                <div className="login-password-wrap">
                  <input
                    type={isPasswordVisible ? "text" : "password"}
                    value={password}
                    placeholder="비밀번호"
                    autoComplete="current-password"
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className={`login-password-toggle ${isPasswordVisible ? "is-visible" : ""}`}
                    aria-label={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
                    onClick={() => setIsPasswordVisible((prev) => !prev)}
                  >
                    {isPasswordVisible ? "HIDE" : "VIEW"}
                  </button>
                </div>
              </label>

              <button type="submit" className="login-submit">
                <span>LOGIN</span>
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <div className="login-divider">
              <span />
              <strong>OR</strong>
              <span />
            </div>

            <div className="login-social-list" aria-label="SNS 로그인">
              {(Object.keys(SOCIAL_PROVIDER_LOGO) as SocialProvider[]).map((provider) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => handleSocialLogin(provider)}
                >
                  <span className="login-social-icon" aria-hidden="true">
                    <img src={SOCIAL_PROVIDER_LOGO[provider]} alt="" />
                  </span>
                  <span>{SOCIAL_PROVIDER_LABEL[provider]}로 로그인</span>
                  <span aria-hidden="true">→</span>
                </button>
              ))}
            </div>

            {socialNotice && (
              <p className="login-social-notice" role="status" aria-live="polite">
                {socialNotice}
              </p>
            )}

            <nav className="login-link-row" aria-label="로그인 보조 링크">
              <button type="button" onClick={() => navigateTo("/find-password")}>
                비밀번호 찾기
              </button>
              <span aria-hidden="true" />
              <button type="button" onClick={() => navigateTo("/register")}>
                회원가입
              </button>
            </nav>
          </div>

          <div className="login-brand-mark" aria-label="UNO TRAVEL">
            UNO<br />TRAVEL
          </div>
        </div>

        <aside className="login-visual" aria-label="우노트래블 로그인 비주얼">
          <video
            className="login-visual-video"
            src={loginVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
          <div className="login-visual-scrim" aria-hidden="true" />

          <div className="login-visual-small-copy">
            <span>The journey begins before departure.</span>
            <strong>Curated by UNOTRAVEL</strong>
          </div>
        </aside>
      </section>
    </main>
  );
}

const STYLE = `
  .login-page-shell {
    width: 100%;
    min-width: 1024px;
    min-height: calc(100vh - 110px);
    background: #ffffff;
    color: #111111;
    overflow-x: hidden;
  }

  .login-page-inner {
    width: 100%;
    min-height: calc(100vh - 110px);
    display: grid;
    grid-template-columns: minmax(460px, 49.8vw) minmax(520px, 1fr);
    background: #ffffff;
  }

  .login-content {
    position: relative;
    min-height: calc(100vh - 110px);
    padding: 44px 44px 48px;
    box-sizing: border-box;
    display: grid;
    grid-template-rows: auto 1fr auto;
    background: #ffffff;
  }

  .login-back-button {
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
    font-size: 25px;
    line-height: 1;
    transition: color 0.2s ease, transform 0.2s ease;
  }

  .login-back-button:hover {
    color: #111111;
    transform: translateX(-2px);
  }

  .login-form-center {
    width: min(360px, 100%);
    align-self: center;
    justify-self: center;
    margin-top: 12px;
  }

  .login-kicker {
    margin: 0 0 18px;
    font-family: var(--font-en);
    font-size: 10px;
    line-height: 1;
    letter-spacing: 0.28em;
    font-weight: 760;
    color: rgba(17, 17, 17, 0.38);
    text-align: center;
  }

  .login-title {
    margin: 0;
    font-family: var(--font-ko);
    font-size: 20px;
    line-height: 1.2;
    letter-spacing: -0.055em;
    font-weight: 760;
    text-align: center;
    color: #111111;
  }

  .login-description {
    margin: 8px 0 28px;
    font-family: var(--font-ko);
    font-size: 13px;
    line-height: 1.55;
    letter-spacing: -0.04em;
    font-weight: 560;
    color: rgba(17, 17, 17, 0.46);
    text-align: center;
    word-break: keep-all;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .login-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-family: var(--font-ko);
    font-size: 12px;
    font-weight: 680;
    letter-spacing: -0.035em;
    color: rgba(17, 17, 17, 0.6);
  }

  .login-field > span {
    display: none;
  }

  .login-field input {
    width: 100%;
    height: 48px;
    border: 1px solid rgba(17, 17, 17, 0.16);
    border-radius: 16px;
    background: #ffffff;
    padding: 0 15px;
    box-sizing: border-box;
    font-family: var(--font-ko);
    font-size: 14px;
    font-weight: 560;
    color: #111111;
    outline: none;
    transition: border-color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
  }

  .login-field input::placeholder {
    color: rgba(17, 17, 17, 0.36);
  }

  .login-field input:focus {
    border-color: rgba(17, 17, 17, 0.52);
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(17, 17, 17, 0.035);
  }

  .login-password-wrap {
    position: relative;
  }

  .login-password-toggle {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    border: 0;
    background: transparent;
    padding: 0;
    cursor: pointer;
    font-family: var(--font-en);
    font-size: 9px;
    font-weight: 760;
    line-height: 1;
    letter-spacing: 0.16em;
    color: rgba(17, 17, 17, 0.42);
    transition: color 0.2s ease;
  }

  .login-password-toggle:hover {
    color: #111111;
  }

  .login-submit {
    width: 100%;
    height: 52px;
    margin-top: 2px;
    border: 0;
    border-radius: 18px;
    background: #111111;
    color: #ffffff;
    cursor: pointer;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    padding: 0 18px;
    box-sizing: border-box;
    font-family: var(--font-en);
    font-size: 12px;
    font-weight: 760;
    letter-spacing: 0.12em;
    transition: background 0.22s ease, color 0.22s ease, transform 0.22s ease;
  }

  .login-submit:hover:not(:disabled) {
    background: #fcc800;
    color: #111111;
    transform: translateY(-1px);
  }

  .login-divider {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 18px;
    margin: 28px 0 18px;
    font-family: var(--font-en);
    font-size: 9px;
    font-weight: 760;
    letter-spacing: 0.18em;
    color: rgba(17, 17, 17, 0.44);
  }

  .login-divider span {
    height: 1px;
    background: rgba(17, 17, 17, 0.14);
  }

  .login-social-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .login-social-list button {
    width: 100%;
    height: 52px;
    border: 1px solid rgba(17, 17, 17, 0.13);
    border-radius: 16px;
    background: #ffffff;
    cursor: pointer;
    display: grid;
    grid-template-columns: 34px 1fr auto;
    align-items: center;
    padding: 0 17px;
    box-sizing: border-box;
    font-family: var(--font-ko);
    font-size: 14px;
    font-weight: 690;
    letter-spacing: -0.035em;
    color: #111111;
    transition: background 0.22s ease, border-color 0.22s ease, transform 0.22s ease;
  }

  .login-social-list button:hover {
    background: #f7f7f5;
    border-color: rgba(17, 17, 17, 0.28);
    transform: translateY(-1px);
  }

  .login-social-icon {
    width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .login-social-icon img {
    width: 22px;
    height: 22px;
    display: block;
    object-fit: contain;
  }

  .login-social-notice {
    margin: 13px 0 0;
    border: 1px solid rgba(17, 17, 17, 0.1);
    border-radius: 14px;
    background: rgba(252, 200, 0, 0.08);
    padding: 12px 14px;
    box-sizing: border-box;
    font-family: var(--font-ko);
    font-size: 12px;
    font-weight: 650;
    line-height: 1.48;
    letter-spacing: -0.04em;
    color: rgba(17, 17, 17, 0.66);
  }

  .login-link-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    margin: 28px 0 0;
  }

  .login-link-row button {
    border: 0;
    background: transparent;
    padding: 0;
    cursor: pointer;
    font-family: var(--font-ko);
    font-size: 13px;
    font-weight: 680;
    letter-spacing: -0.035em;
    color: rgba(17, 17, 17, 0.68);
    transition: color 0.2s ease;
  }

  .login-link-row button:hover {
    color: #111111;
  }

  .login-link-row span {
    width: 1px;
    height: 15px;
    background: rgba(17, 17, 17, 0.22);
  }

  .login-brand-mark {
    align-self: end;
    justify-self: center;
    font-family: var(--font-en);
    font-size: 19px;
    line-height: 0.92;
    letter-spacing: -0.055em;
    font-weight: 820;
    text-align: center;
    color: #111111;
  }

  .login-visual {
    position: relative;
    min-height: calc(100vh - 110px);
    overflow: hidden;
    background: #f4f3f0;
    isolation: isolate;
  }

  .login-visual-video {
    position: absolute;
    left: 50%;
    top: 50%;
    width: min(68vw, 860px);
    height: min(62vh, 620px);
    object-fit: cover;
    transform: translate(-50%, -50%);
    filter: saturate(0.86) contrast(1.02) brightness(0.96);
  }

  .login-visual-scrim {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 52% 48%, rgba(255,255,255,0) 0%, rgba(244,243,240,0) 42%, rgba(244,243,240,0.48) 100%),
      linear-gradient(180deg, rgba(244,243,240,0.12), rgba(244,243,240,0.3));
    pointer-events: none;
  }

  .login-visual-small-copy {
    position: absolute;
    left: 28px;
    bottom: 28px;
    max-width: 320px;
    display: grid;
    gap: 5px;
    color: #111111;
  }

  .login-visual-small-copy span,
  .login-visual-small-copy strong {
    font-family: var(--font-en);
    font-size: 10px;
    line-height: 1.05;
    letter-spacing: -0.02em;
    font-weight: 760;
  }

  .login-visual-small-copy strong {
    color: rgba(17, 17, 17, 0.52);
  }

  @media (max-width: 1180px) {
    .login-page-inner {
      grid-template-columns: minmax(430px, 48vw) minmax(520px, 1fr);
    }

    .login-content {
      padding-left: 34px;
      padding-right: 34px;
    }

    .login-visual-video {
      width: 74vw;
      height: 58vh;
    }
  }
`;
