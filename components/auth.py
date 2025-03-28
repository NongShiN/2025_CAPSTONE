# components/auth.py

import streamlit as st
from config.settings import USER_CREDENTIALS

def is_authenticated():
    return st.session_state.get("page") == "chatbot"


def show_login():

    st.markdown("<br><br>", unsafe_allow_html=True)

    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.image("assets/logo(example).png", width=500)

    #st.title("🔐 로그인")
    username = st.text_input("아이디")
    password = st.text_input("비밀번호", type="password")

    if st.button("로그인"):
        if USER_CREDENTIALS.get(username) == password:
            st.session_state.page = "chatbot"
            st.session_state.username = username
            st.rerun()
        else:
            st.error("아이디 또는 비밀번호가 올바르지 않습니다.")
