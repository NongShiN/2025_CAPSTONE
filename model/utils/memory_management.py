import os
import json
import logging

########################
# To Do : logging config
########################

def load_memory(file_path):
    if not os.path.exists(file_path):
        return []
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read().strip()
        if not content:
            logging.warning("Memory file '%s' is empty. Initializing with empty list.", file_path)
            return []
        return json.loads(content)

def save_memory(memory, file_path):
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(memory, f, indent=2, ensure_ascii=False, default=str)