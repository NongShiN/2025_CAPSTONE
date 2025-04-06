import streamlit as st

# 임시 사용자 저장소 (실제 구현 시 DB로 대체 가능)
@st.cache_resource
def get_user_store():
    return {}

def show_signup():
    st.markdown("## 📝 회원가입")

    user_store = get_user_store()

    new_id = st.text_input("아이디")
    new_pw = st.text_input("비밀번호", type="password")
    new_pw_confirm = st.text_input("비밀번호 확인", type="password")

    col1, col2 = st.columns(2)

    with col1:
        if st.button("가입하기", use_container_width=True):
            if not new_id or not new_pw or not new_pw_confirm:
                st.error("모든 항목을 입력해주세요.")
            elif new_id in user_store:
                st.error("이미 존재하는 아이디입니다.")
            elif new_pw != new_pw_confirm:
                st.error("비밀번호가 일치하지 않습니다.")
            else:
                user_store[new_id] = new_pw
                st.success("회원가입이 완료되었습니다. 로그인 화면으로 이동합니다.")
                st.session_state.page = "login"
                st.rerun()
                return  # rerun 이후 코드 실행 방지

    with col2:
        if st.button("뒤로가기", use_container_width=True):
            st.session_state.page = "login"
            st.rerun()
            return
