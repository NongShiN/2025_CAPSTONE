import argparse

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--cd_prompt_name', type=str, default='detect_cognitive_distortion.txt')
    parser.add_argument('--insight_prompt_name', type=str, default='extract_insight.txt')
    parser.add_argument('--dynamic_prompt_name', type=str, default='dynamic_prompt.txt')
    parser.add_argument('--model', type=str, default='gpt-4o-mini')
    parser.add_argument('--temperature', type=float, default=0.7)
    parser.add_argument('--basic_memory_path', type=str, default='memory/basic_memory.json')
    parser.add_argument('--cd_memory_path', type=str, default='memory/cd_memory.json')
    parser.add_argument('--cbt_log_name', type=str, default='cbt_log.json')
    parser.add_argument('--cbt_info_name', type=str, default='cbt_info.json')
    parser.add_argument('--top_k', type=int, default=5)
    return parser.parse_args()