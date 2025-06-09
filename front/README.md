# 🖥️ Frontend - 마음의 소리

본 디렉토리는 **GPT 기반 심리상담 멀티에이전트 플랫폼**의 프론트엔드 코드가 포함된 폴더입니다.  
React 기반의 SPA(Single Page Application)로 설계되었으며, Node.js 환경에서 실행됩니다.

---

## 📌 주요 기술 스택

| 영역       | 기술                             |
|------------|----------------------------------|
| 프레임워크 | React (CRA 기반)                 |
| 라우팅     | React Router v6                  |
| 디자인     | Tailwind CSS, CSS Modules        |
| 인증       | NextAuth.js + JWT (Google OAuth) |
| 통신       | Axios                             |
| 배포       | Google Cloud Run       |

---

## 🧩 주요 기능

- ✅ 사용자 로그인 / 회원가입 / 소셜 인증 (Google,Github)
- 💬 ChatGPT 스타일의 실시간 심리 상담 UI
- 🎭 심리 이론(ACT, CBT, DBT) 기반 멀티 상담 스타일 적용
- 💾 지속성 있는 세션 관리 (이전 대화 불러오기,제목 저장 등)
- 🌐 커뮤니티 기능 (상담글 요약, 댓글, 좋아요, 조회수)
- 🧑 마이페이지 (상담 기록 열람, 사용자 설정)
- 🌙 3종의 테마 지원

---

## ▶️ 실행 방법

### 1. 환경 변수 설정

루트 디렉토리에 `.env.local` 파일을 생성하고 아래 내용을 참고하여 설정합니다:

<pre><code>
REACT_APP_API_URL='여기에 api url을 입력하세요'
REACT_APP_MODEL_SERVER_URL='여기에 model server url을 입력하세요'
REACT_APP_GOOGLE_CLIENT_ID='여기에 google-client-id를 입력하세요'
</code></pre>

### 2. 패키지 설치

<pre><code>bash
cd front
npm install
</code></pre>

### 3. 개발 서버 실행

<pre><code>bash
npm run dev
</code></pre>

> 기본 실행 주소: http://localhost:3000

---

## 📁 디렉토리 구조

```
📂front
├─ 📂public
│  └─ index.html
├─ 📂src
│  ├─ 📂public          # 이미지, 아이콘 등 정적 리소스
│  ├─ 📂components      # 공통 UI 컴포넌트
│  ├─ 📂pages           # 라우팅되는 페이지 컴포넌트
│  ├─ 📂styles          # Tailwind 설정 및 css 파일들
├─ 📜.env.local         # 환경 변수 파일
├─ 📜package.json
├─ 📜config.js
├─ 📜jsconfig.js
├─ 📜next.config.mjs
├─ 📜tailwind.config.js
└─ 📜README.md
```

---

## 🔗 서비스 링크

- ▶️ **배포된 서비스 접속:** [https://web-server-281506025529.asia-northeast3.run.app/login](https://web-server-281506025529.asia-northeast3.run.app/login)
- 🧠 백엔드 코드 위치: `/back`
- 🧠 모델 서버 코드 위치: `/back/model_server`

---

## 🧑‍💻 팀원 및 역할

| 이름 | 역할 | GitHub |
|------|------|--------|
| 김민재 | 프론트엔드 / PM | [@minzai0116](https://github.com/minzai0116) |
| 황찬웅 | 프론트엔드 / 서비스 배포 | [@NongShiN](https://github.com/NongShiN) |

---

## 📄 라이선스

본 프로젝트는 팀 졸업작품 목적의 비상업적 프로젝트로, 라이선스는 별도로 지정되어 있지 않습니다.

---

## 🙋 기타 안내

- 서비스 기획, 전체 시스템 구조, ERD 등은 루트 `README.md` 참조
- 백엔드 및 모델 서버 실행 방법은 각각 `back/README.md`, `model_server/README.md`에서 확인
