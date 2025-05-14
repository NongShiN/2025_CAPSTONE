import os
import json

def load_dialogues(dialogue_history_path="memory/dialogue_history.json"):
    path = os.path.abspath(os.path.join(os.path.dirname(__file__), dialogue_history_path))
    
    with open(path, 'r', encoding='utf-8') as f:
        data = f.read().strip()
    
    return str_to_json_data(data)

def update_dialogue_history(dialogue_history, speaker, utterance, timestamp):
    dialogue_history.append({
        "speaker": speaker,
        "utterance": utterance,
        "timestamp": timestamp
    })


dialogue_history = """[
  {
    "id": 1,
    "user_id": 1,
    "message": "Hi",
    "response": "Hello",
    "timestamp": "2025-04-20T10:00:00.000000",
    "cognitive_distortion": "",
    "insight": "",
    "session_id": "dlg001",
    "severity": 0
  },
  {
    "id": 2,
    "user_id": 1,
    "message": "I've been really anxious lately.",
    "response": "Would you like to talk about what’s making you anxious?",
    "timestamp": "2025-04-20T10:01:10.000000",
    "cognitive_distortion": "",
    "insight": "",
    "session_id": "dlg001",
    "severity": 0
  }
]
"""

dialogue_history = json.loads(dialogue_history)
transfromed_dialogue_history = []
for entry in dialogue_history:
    transfromed_dialogue_history.append({
        "speaker": "Client",
        "utterance": entry["message"]
    })
    transfromed_dialogue_history.append({
        "speaker": "Counselor",
        "utterance": entry["response"]
    })
print(transfromed_dialogue_history)