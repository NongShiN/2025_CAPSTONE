import argparse

################################################################################
# TODO : 각 에이전트에 대한 프롬프트가 폴더로 묶임. 이에 맞춰 args 수정 및 코드 수정.
################################################################################

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--cd_prompt_name', type=str, default='prompts/cbt/detect_cognitive_distortion.txt')
    parser.add_argument('--insight_prompt_name', type=str, default='prompts/cbt/extract_insight.txt')
    parser.add_argument('--dynamic_prompt_name', type=str, default='prompts/cbt/dynamic_prompt.txt')
    parser.add_argument('--model', type=str, default='gpt-4o-mini')
    parser.add_argument('--temperature', type=float, default=0.7)
    parser.add_argument('--basic_memory_path', type=str, default='memory/basic_memory.json')
    parser.add_argument('--cd_memory_path', type=str, default='memory/cd_memory.json')
    parser.add_argument('--cbt_log_path', type=str, default='data/cbt_log.json')
    parser.add_argument('--cbt_info_path', type=str, default='data/cbt_info.json')
    parser.add_argument('--top_k', type=int, default=5)
    return parser.parse_args()