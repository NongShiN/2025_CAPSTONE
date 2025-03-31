import streamlit as st
from config.settings import USER_CREDENTIALS

def is_authenticated():
    return st.session_state.get("page") == "chatbot"

def show_login():
    st.markdown("<br><br>", unsafe_allow_html=True)

    # 로고 중앙 정렬
    col_logo1, col_logo2, col_logo3 = st.columns([1, 2, 1])
    with col_logo2:
        st.image("assets/logo(example).png", width=700)

    username = st.text_input("아이디")
    password = st.text_input("비밀번호", type="password")

    # ✅ [로그인] - 가로 전체 버튼
    if st.button("🔐 로그인", use_container_width=True):
        if USER_CREDENTIALS.get(username) == password:
            st.session_state.page = "chatbot"
            st.session_state.username = username
            st.rerun()
        else:
            st.error("아이디 또는 비밀번호가 올바르지 않습니다.")

    # ✅ [회원가입] [로그인 없이 시작] - 나란히
    col1, col2 = st.columns(2)
    with col1:
        if st.button("📝 회원가입", use_container_width=True):
            st.session_state.page = "signup"

    with col2:
        if st.button("🤖 게스트", use_container_width=True):
            st.session_state.page = "chatbot"
            st.session_state.username = "guest"
            st.rerun()
