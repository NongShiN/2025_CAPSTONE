import os
import re
import json

def load_prompt(prompt_path):
    path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", prompt_path))
    
    with open(path, 'r', encoding='utf-8') as f:
        return f.read().strip()

#def load_dialogue_history(dialogue_history_path, dialoge_history_id):
#    path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", dialogue_history_path))
#    
#    with open(path, 'r', encoding='utf-8') as f:
#        dialogues = f.read().strip()


# TODO: json 형식의 텍스트를 client/counselor 멀티턴 대화 형식 str로 변환하는 함수 구현
# TODO: dialogue history를 window size에 맞게 추출하는 함수 구현

def str_to_json_data(json_string):
    try:
        data = json.loads(json_string)
        return data
    except json.JSONDecodeError as e:
        print(f"[ERROR] fail JSON parsing : {e}")
        return None

# TODO: API로 받아온 dialogues에서 뽑아오는 방식으로 변경 필요
def load_dialogues(dialogue_history_path, dialogue_history_id):
    path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", dialogue_history_path))
    
    with open(path, 'r', encoding='utf-8') as f:
        dialogues = f.read().strip()
    
    dialogues = str_to_json_data(dialogues)
    
    #print(type(dialogues))
    #print(dialogues[dialogue_history_id]["dialogue_history"])
    return dialogues
    
    
def normalize(value, max_value):
    return value / max_value if max_value else 0


def clean_json_response(text):
    return re.sub(r"```(?:json)?\s*|\s*```", "", text.strip())


def load_cbt_technique_info(cbt_info_path):
    path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", cbt_info_path))
    
    if not os.path.exists(path):
        raise FileNotFoundError(f"CBT technique info file not found: {path}")

    with open(path, 'r', encoding='utf-8') as f:
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


def format_dialogue_history(dialogue_history):
    lines = []
    for turn in dialogue_history:
        speaker = turn["speaker"]
        utterance = turn["utterance"].strip()
        lines.append(f"{speaker} : {utterance}")
    return "\n".join(lines)