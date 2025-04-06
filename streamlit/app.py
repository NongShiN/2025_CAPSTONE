import streamlit as st
from components.auth import is_authenticated, show_login
from components.chatbot import show_chatbot
from components.signup import show_signup

# 페이지 설정
st.set_page_config(layout="wide", initial_sidebar_state="expanded")

# CSS 적용
css_path = 'style.css'
with open(css_path, encoding='utf-8') as f:
    st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

# 세션 상태 초기화
if "page" not in st.session_state:
    st.session_state.page = "login"
if "conversation_sections" not in st.session_state:
    st.session_state.conversation_sections = []
if "current_conversation" not in st.session_state:
    st.session_state.current_conversation = []
if "selected_style" not in st.session_state:
    st.session_state.selected_style = None
    
# 페이지 라우팅
if "page" not in st.session_state:
    st.session_state.page = "login"

if st.session_state.page == "login":
    show_login()

elif st.session_state.page == "signup":
    show_signup()
elif st.session_state.page == "chatbot":
    show_chatbot()
