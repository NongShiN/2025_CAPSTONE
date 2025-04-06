import streamlit as st

def add_current_message(role, content):
    """
    현재 대화 세션에 메시지를 추가.
    """
    st.session_state.current_conversation.append({
        "role": role,
        "content": content
    })


def reset_conversation():
    """
    현재 대화를 저장하고 새 대화로 초기화.
    """
    if st.session_state.current_conversation:
        st.session_state.conversation_sections.append(
            st.session_state.current_conversation
        )
    st.session_state.current_conversation = []
    st.session_state.selected_style = None
    st.rerun()


def render_conversation_history():
    """
    이전 대화 목록을 사이드바에 표시하고,
    불러오기 및 삭제 기능 제공.
    """
    st.sidebar.title("Previous Conversations")

    for idx, conversation in enumerate(st.session_state.conversation_sections):
        col1, col2 = st.sidebar.columns([4, 1])

        with col1:
            if st.sidebar.button(f"Conversation {idx + 1}", key=f"load_{idx}"):
                st.session_state.current_conversation = conversation

        with col2:
            if st.sidebar.button("❌", key=f"delete_{idx}"):
                del st.session_state.conversation_sections[idx]
                st.session_state.current_conversation = []
                st.rerun()


def save_conversation_direct():
    """
    대화 저장 버튼 하나로 .txt 파일을 즉시 다운로드
    """
    conversation_text = "\n".join([
        f"{msg['role']}: {msg['content']}" for msg in st.session_state.current_conversation
    ])

    st.download_button(
        label="💾 내보내기",
        data=conversation_text,
        file_name="conversation.txt",
        mime="text/plain",
        key="download_now"
    )
