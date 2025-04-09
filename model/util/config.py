import os

def load_prompt(prompt_name: str) -> str:
    current_dir = os.path.dirname(os.path.dirname(__file__))  # 프로젝트 루트 기준
    prompt_path = os.path.join(current_dir, "prompts", prompt_name)
    
    with open(prompt_path, 'r', encoding='utf-8') as f:
        return f.read().strip()