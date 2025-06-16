![프론트 배너](docs/readme_pictures/front_banner.png)

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
![login](https://github.com/user-attachments/assets/cbcb1cb2-615e-44ff-92a4-a3aa66d9496c)
로그인 페이지는 ‘마음의 소리’ 웹 서비스의 진입점 역할을 한다. 좌측은 서비스 브랜드 메시지를 전달하고, 우측은 이메일 로그인과 구글, 깃허브 로그인, 게스트 모드를 제공한다. 좌측 예시 메세지창은 2.5초 간격으로 랜덤한 메세지가 출력된다. 게스트모드에서는 대화가 저장되지 않는 단일 세션으로 상담을 체험해보고 커뮤니티 접속을 통해 어떠한 기능들이 있는지 파악할 수 있다.

- 💬 ChatGPT 스타일의 실시간 심리 상담 UI & 💾 지속성 있는 세션 관리 (이전 대화 불러오기,제목 저장)
![intro](https://github.com/user-attachments/assets/37a7682b-d6f5-448f-98d8-7e6ec7f39ba9)
채팅화면 중앙에 보이는 인트로 박스를 클릭하여 대화를 시작할 수 있다. 인트로 박스를 클릭하면 아침, 점심, 저녁 시간에 따라 랜덤한 인트로 메세지를 출력하며 밑에서 위로 올라오는 입력창을 통해 사용자는 대화를 입력하고 보낼 수 있다.

  ![chat](https://github.com/user-attachments/assets/ec73cb96-f730-498c-b8a3-c4819f2f0531)
채팅을 입력하면 “상담사가 입력 중입니다...”라는 메세지를 출력하며 상담사의 답장을 기다리고, 답장이 오면 한 문장 단위로 끊어 직접 말하는 효과를 받을 수 있게 한 글자씩 딜레이를 두어 메세지를 출력한다. 출력이 종료되면 마지막에 출력된 상담사의 메세지를 포함하여 전체 대화 내용을 요약하여 Chatgpt가 제목 생성을 수행하고, 대화 내역을 저장하여 대화 목록에 저장한다. 사용자가 원하면 대화 제목을 직접 수정하는 것도 가능하다.


- 🌐 커뮤니티 기능
![comu](https://github.com/user-attachments/assets/cb2a7d7a-c6bc-4c11-a4d9-823bb1da3f28)
상단 검색어를 입력하면 제목, 내용, 태그에 포함된 내용을 찾아 글 목록을 표시하고 옆의 글 작성하기 버튼을 통해 직접 글을 작성할 수 있다. 하단의 글에서는 제목과 태그를 확인할 수 있으며 이름과 작성 시간을 확인할 수 있다. 일반 사용자는 익명으로 표시되고 전문가의 경우 전문가 마크와 이름이 표기된다. 또한 BPM(추천)과 조회수, 댓글 수를 확인할 수 있다. 우측에서 일주일간 받은 BPM 순으로 3개의 주간 인기글을 게시하였고 밑에 상담가들을 소개하는 란을 통해 채팅에서 사용되는 상담 기법에 대해 확인하고 이해할 수 있다

![제목 없는 디자인](https://github.com/user-attachments/assets/f33239ef-ca75-4fc4-99e8-77f521b82fdb)
사용자는 대화 선택란에서 본인의 대화 목록을 확인하고, 원하는 대화를 클릭하면 아래와 같이 대화 미리보기란을 통해 대화를 확인할 수 있다. 우측의 요약하여 제목/본문 넣기 버튼을 클릭하면 LLM이 대화를 확인하여 제목/본문/태그(6가지 중 선택)를 자동으로 생성하여 입력한다.

![제목 없는 디자인-2](https://github.com/user-attachments/assets/1f0a3c3c-95f7-41e3-a2ca-9a891b6a39d6)
사용자는 원한다면 자신의 상담 내역을 공유하지 않을 수도 있고, 직접 제목/본문/태그를 입력하고 수정하는 것도 가능하다.

  ![post](https://github.com/user-attachments/assets/2a9ca75d-8491-4a53-8cd6-66952f604628)
포스트 페이지에서 BPM 버튼을 누를 수 있고, 작성자는 삭제하기, 수정하기 버튼을 통해 게시글을 삭제하거나 수정할 수 있다. 또한 익명(전문가의 경우에는 전문가 이름)으로 달리는 댓글을 통해 작성자 및 다른 사용자와 소통할 수 있다. 댓글 또한 삭제와 수정이 가능하다.
  
- 🧑 마이페이지
![profile](https://github.com/user-attachments/assets/62e4e192-13e4-430c-a431-98e2938cbaf8)
프로필 페이지에서 사용자는 테마를 blue/pink/purple중 고를 수 있으며 이 테마는 채팅 페이지와 커뮤니티 페이지에서 배경, 버튼 색에 적용되어 사용자가 원하는 무드를 표현할 수 있다. 하단 “activity”에서 현재의 대화 목록 수, 커뮤니티에서 작성한 포스트 글 개수와 받은 BPM(추천) 수를 표시한다. “My Posts”에서 작성한 포스트 제목을 볼 수 있고 클릭하면 포스트로 이동하여 자기가 작성한 포스트를 직접 확인할 수 있다. “Account Settings”에서 비밀번호를 변경하고 계정을 삭제할 수 있다.

- 🌙 3종의 테마 지원(Blue, Purple, Pink)
![ezgif com-animated-gif-maker](https://github.com/user-attachments/assets/ac081fda-f955-4ae2-89d9-a82de7e3fb31)

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

- ▶️ **배포된 서비스 접속:** [Click here](https://web-server-281506025529.asia-northeast3.run.app/login)
- 🧠 백엔드 코드 위치: `/back`
- 🧠 모델 서버 코드 위치: `/back/model_server`

---

## 🧑‍💻 팀원 및 역할

| 이름 | 역할 | GitHub |
|------|------|--------|
| 김민재 | 페이지 제작 / CSS 작성 | [@minzai0116](https://github.com/minzai0116) |
| 황찬웅 | 페이지 제작 / 서비스 배포 | [@NongShiN](https://github.com/NongShiN) |

---

## 📄 라이선스

본 프로젝트는 팀 졸업작품 목적의 비상업적 프로젝트로, 라이선스는 별도로 지정되어 있지 않습니다.

---

## 🙋 기타 안내

- 서비스 기획, 전체 시스템 구조, ERD 등은 루트 `README.md` 참조
- 백엔드 및 모델 서버 실행 방법은 각각 `back/README.md`, `model_server/README.md`에서 확인
