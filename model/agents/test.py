from .utils.util import str_to_json_data, format_dialogue_history
import os

def load_dialogues(dialogue_history_path="memory/dialogue_history.json"):
    path = os.path.abspath(os.path.join(os.path.dirname(__file__), dialogue_history_path))
    
    with open(path, 'r', encoding='utf-8') as f:
        data = f.read().strip()
    
    return str_to_json_data(data)

def update_dialogues(dialogue_history_id):
    dialogues[dialogue_history_id] = dialogue_history

def update_dialogue_history(dialogue_history, speaker, utterance, timestamp):
    dialogue_history.append({
        "speaker": speaker,
        "utterance": utterance,
        "timestamp": timestamp
    })
    
def update_dialogues(dialogues, dialogue_history, dialogue_history_id):
    dialogues[dialogue_history_id] = dialogue_history
        
dialogues = None
dialogue_history = None
    
dialogues = load_dialogues(dialogue_history_path="memory/dialogue_history.json")
print(dialogues)

print("====================================")

dialogue_history = dialogues["dlg001"]["dialogue_history"]
print(dialogue_history)

print("====================================")

update_dialogue_history(dialogue_history, "Client", "Hi", "2025-04-25T02:57:20.102793")
print(dialogue_history)

print("====================================")

update_dialogues(dialogues, dialogue_history, "dlg001")
print(dialogues)

print("====================================")

dh = format_dialogue_history(dialogue_history)
print(dh)