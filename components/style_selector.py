import streamlit as st
from config.settings import STYLE_OPTIONS, STYLE_PROMPTS

def render_style_selector():
    """
    상담 스타일 선택 드롭다운 UI를 출력하고,
    선택된 스타일에 따른 프롬프트를 세션에 저장한다.
    """
    selected = st.selectbox(
        "상담 스타일을 선택해주세요:",
        STYLE_OPTIONS,
        index=STYLE_OPTIONS.index(st.session_state.selected_style)
        if st.session_state.selected_style else 0
    )

    if selected != st.session_state.selected_style:
        st.session_state.selected_style = selected
        st.rerun()

    # 프롬프트 업데이트
    st.session_state.personality_prompt = STYLE_PROMPTS.get(
        st.session_state.selected_style,
        "당신은 일반적인 대화를 하는 사람입니다."
    )
