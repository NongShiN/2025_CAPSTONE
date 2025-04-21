import os
import json
import logging
import datetime
from model.model import (
    load_memory,
    save_memory,
    extract_memory_from_utterance,
    compose_prompt,
    call_llm,
    load_prompt
)
from dotenv import load_dotenv

load_dotenv()

# === Logging Configuration ===
logging.basicConfig(
    filename="chat_history.log",
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)

# ✅ 기본값을 반환하는 클래스
class DefaultArgs:
    final_prompt_name = 'final_prompt.txt'
    cd_prompt_name = 'detect_cognitive_distortion.txt'
    insight_prompt_name = 'extract_insight.txt'
    model = 'gpt-4o-mini'
    temperature = 0.7
    basic_memory_path = 'basic_memory.json'
    cd_memory_path = 'cd_memory.json'
    cbt_log_name = 'cbt_log.json'
    top_k = 5
    cbt_info_name = 'cbt_info.json'

# ✅ 메모리 파일 없으면 자동 생성
def ensure_memory_file(path):
    if not os.path.exists(path):
        with open(path, 'w', encoding='utf-8') as f:
            json.dump([], f)

# ✅ FastAPI용 함수
def chat_with_model(user_input: str, last_counselor: str = "Hello, how can I help you?") -> str:
    args = DefaultArgs()

    ensure_memory_file(args.basic_memory_path)
    ensure_memory_file(args.cd_memory_path)

    timestamp = datetime.datetime.now().isoformat()

    basic_memory = load_memory(args.basic_memory_path)
    cd_memory = load_memory(args.cd_memory_path)

    cd_prompt_template = load_prompt(args.cd_prompt_name)
    insight_prompt_template = load_prompt(args.insight_prompt_name)

    basic_entry, cd_entry = extract_memory_from_utterance(
        user_input,
        call_llm,
        args.model,
        args.temperature,
        cd_prompt_template,
        insight_prompt_template,
        timestamp
    )
    basic_memory.append(basic_entry)
    if cd_entry:
        cd_memory.append(cd_entry)

    save_memory(basic_memory, args.basic_memory_path)
    save_memory(cd_memory, args.cd_memory_path)

    prompt = compose_prompt(
        args,
        counselor_utterance=last_counselor,
        client_utterance=user_input,
        basic_memory=basic_memory,
        cd_memory=cd_memory,
        f_llm=call_llm,
        model=args.model,
        temperature=args.temperature
    )

    response = call_llm(prompt, model=args.model, temperature=args.temperature)
    return response
