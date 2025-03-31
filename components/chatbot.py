import streamlit as st
import google.generativeai as genai
from components.style_selector import render_style_selector
from config.settings import GEMINI_MODEL
from components.conversation import (
    save_conversation_direct,
    render_conversation_history,
    add_current_message,
)
from components.layout import render_sidebar_top_buttons
from components.conversation import render_conversation_history

# ✅ API 키 불러오기
gemini_api_key = st.secrets["general"]["GEMINI_API_KEY"]
genai.configure(api_key=gemini_api_key)

def show_chatbot():

    render_sidebar_top_buttons()
    render_conversation_history()

    # ✅ guest 유저에게 경고 메시지 출력
    if st.session_state.get("username") == "guest":
        st.warning("⚠️ 로그인 없이 시작하신 경우, 대화 기록은 저장되지 않습니다.")

    # 상담 스타일 선택 드롭다운
    render_style_selector()

    # 현재 대화 메시지 출력
    for message in st.session_state.current_conversation:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    # 사용자 입력 받기
    if prompt := st.chat_input("오늘 당신의 마음의 소리는 무엇인가요?"):
        # 사용자 메시지 추가 및 표시
        add_current_message("user", prompt)
        with st.chat_message("user"):
            st.markdown(prompt)

        # Gemini 응답 생성
        with st.chat_message("assistant"):
            try:
                full_prompt = f"{st.session_state.personality_prompt} 사용자 메시지: {prompt}"
                model = genai.GenerativeModel(GEMINI_MODEL)
                response = model.generate_content(full_prompt)
                st.markdown(response.text)
                add_current_message("assistant", response.text)
            except Exception as e:
                st.error(f"응답 생성 중 오류 발생: {e}")
