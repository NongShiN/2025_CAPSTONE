import streamlit as st
from config.settings import USER_CREDENTIALS
from streamlit_oauth import OAuth2Component
import requests
import time
import base64

def is_authenticated():
    return st.session_state.get("page") == "chatbot"

def image_to_base64(image_path):
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode()

def show_login():
    st.markdown("""
    <style>
    html, body, [data-testid="stApp"] {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow-x: hidden;
    }
    .block-container {
        padding: 0 !important;
    }
    main {
        padding: 0 !important;
    }
    </style>
    """, unsafe_allow_html=True)

    base64_logo = image_to_base64("assets/logo(example).png")

    # ✅ 로고가 반드시 보이도록 height 충분히 주고 위치 고정
    st.components.v1.html(f"""
    <div style="position: relative; width: 100vw; height: 125vh; overflow: hidden;">
      <div id="logo-container" style="
          position: absolute;
          top: 55%;
          left: 50%;
          transform: translate(-50%, -50%) scale(2.02);
          transition: transform 1s ease;
          z-index: 999;
      ">
        <img id="logo" src="data:image/png;base64,{base64_logo}"
             style="
                 max-width: 80vw;
                 max-height: 60vh;
                 object-fit: contain;
             ">
      </div>
    </div>

    <script>
      setTimeout(() => {{
        const container = document.getElementById("logo-container");
        container.style.transform = "translate(-50%, -50%) scale(0.9)";
      }}, 1500);
    </script>
    """, height=450)

    time.sleep(2)

    # ✅ 로그인 UI
    with st.container():
        st.markdown("### 🙋 로그인", unsafe_allow_html=True)
        username = st.text_input("아이디", placeholder="아이디를 입력하세요")
        password = st.text_input("비밀번호", type="password", placeholder="비밀번호를 입력하세요")

        if st.button("🔐 로그인", use_container_width=True):
            if USER_CREDENTIALS.get(username) == password:
                st.session_state.page = "chatbot"
                st.session_state.username = username
                st.rerun()
            else:
                st.error("❗ 아이디 또는 비밀번호가 올바르지 않습니다.")

        col1, col2 = st.columns(2)
        with col1:
            if st.button("📝 회원가입", use_container_width=True):
                st.session_state.page = "signup"
        with col2:
            if st.button("🤖 로그인 없이 시작", use_container_width=True):
                st.session_state.page = "chatbot"
                st.session_state.username = "guest"
                st.rerun()

        st.markdown("#### 또는 Google 계정으로 로그인", unsafe_allow_html=True)

        oauth2 = OAuth2Component(
            client_id=st.secrets["google"]["client_id"],
            client_secret=st.secrets["google"]["client_secret"],
            authorize_endpoint="https://accounts.google.com/o/oauth2/auth",
            token_endpoint="https://oauth2.googleapis.com/token",
        )

        token = oauth2.authorize_button(
            name="Google 로그인",
            redirect_uri="https://chatfront-kmj.streamlit.app",
            scope="https://www.googleapis.com/auth/userinfo.email",
            key="google-login-button",
        )

        if token:
            if "token" in token and "access_token" in token["token"]:
                access_token = token["token"]["access_token"]
                user_info = requests.get(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"}
                ).json()

                st.session_state.username = user_info.get("email", "google_user")
                st.session_state.page = "chatbot"
                st.success(f"✅ Google 로그인 성공: {st.session_state.username}")
                st.rerun()
            else:
                st.error("Google 로그인 중 문제가 발생했습니다. 다시 시도해주세요.")
