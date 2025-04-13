import os
import re
import json

def load_prompt(prompt_name):
    current_dir = os.path.dirname(os.path.dirname(__file__))
    prompt_path = os.path.join(current_dir, "prompts", prompt_name)
    
    with open(prompt_path, 'r', encoding='utf-8') as f:
        return f.read().strip()
    
def normalize(value, max_value):
    return value / max_value if max_value else 0

def clean_json_response(text):
    return re.sub(r"```(?:json)?\s*|\s*```", "", text.strip())

def load_cbt_technique_info(cbt_info_name):
    current_dir = os.path.dirname(os.path.dirname(__file__))
    cbt_info_path = os.path.join(current_dir, "data", cbt_info_name)
    
    if not os.path.exists(cbt_info_path):
        raise FileNotFoundError(f"CBT technique info file not found: {cbt_info_path}")
    with open(cbt_info_path, 'r', encoding='utf-8') as f:
        return json.load(f)
    
def call_llm(prompt, llm, model="gpt-4o-mini", temperature=0.7):
    messages = [{"role": "user", "content": prompt}]
    response = llm.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature
    )
    content = response.choices[0].message.content.strip()
    if content.lower().startswith("counselor:"):
        content = content[len("counselor:"):].strip()
    return content
