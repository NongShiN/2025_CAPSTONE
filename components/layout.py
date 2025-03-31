import streamlit as st
from components.conversation import save_conversation_direct, reset_conversation

def render_sidebar_top_buttons():
    """
    사이드바 상단에 저장 + 로그아웃 버튼을 한 줄에 배치하고,
    그 아래 새 대화 버튼을 단독으로 배치
    """

    # 저장 + 로그아웃 버튼 나란히
    col1, col2 = st.sidebar.columns(2)

    with col1:
        save_conversation_direct()

    with col2:
        if st.button("🔒 로그아웃"):
            st.session_state.page = 'login'
            st.session_state.username = None
            st.rerun()

    st.sidebar.divider()  # 구분선

    # 새 대화 버튼은 단독
    if st.sidebar.button("💬 새 대화"):
        reset_conversation()