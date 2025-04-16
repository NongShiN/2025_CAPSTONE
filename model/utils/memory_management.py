import os
import json
import logging

########################
# To Do : logging config
########################

def load_memory(file_path):
    abs_path = os.path.join(os.path.dirname(__file__), "..", file_path)
    abs_path = os.path.abspath(abs_path)
    
    if not os.path.exists(abs_path):
        return []
    with open(abs_path, 'r', encoding='utf-8') as f:
        content = f.read().strip()
        if not content:
            logging.warning("Memory file '%s' is empty. Initializing with empty list.", abs_path)
            return []
        return json.loads(content)

def save_memory(memory, file_path):
    abs_path = os.path.join(os.path.dirname(__file__), "..", file_path)
    abs_path = os.path.abspath(abs_path)

    with open(abs_path, 'w', encoding='utf-8') as f:
        json.dump(memory, f, indent=2, ensure_ascii=False, default=str)