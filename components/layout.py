import streamlit as st
from components.conversation import save_conversation_direct, reset_conversation

def render_sidebar_top_buttons():
    col1, col2 = st.sidebar.columns(2)

    # ✅ 저장 버튼
    with col1:
        save_conversation_direct()

    # ✅ 로그아웃 or 처음화면으로
    with col2:
        # 👉 로그인 여부에 따라 버튼 텍스트 결정
        logout_label = "🔙 처음으로" if st.session_state.get("username") == "guest" else "🔒 로그아웃"

        if st.button(logout_label):
            st.session_state.page = "login"
            st.session_state.username = None
            st.rerun()

    st.sidebar.divider()

    # ✅ 새 대화 버튼
    if st.sidebar.button("💬 새 대화"):
        reset_conversation()
