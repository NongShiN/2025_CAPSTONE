import os
import json
import logging
from model import parse_args, load_memory, save_memory, extract_memory_from_utterance, compose_prompt, call_llm, load_prompt

from dotenv import load_dotenv

load_dotenv()

# === Logging Configuration ===
logging.basicConfig(
    filename="chat_history.log",
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)

def main():
    args = parse_args()

    print("🤖 Welcome to CoCoA – Your Cognitive Therapy Chatbot!")
    print("Type 'exit' to quit.\n")

    basic_memory = load_memory(args.basic_memory_path)
    cd_memory = load_memory(args.cd_memory_path)

    static_prompt_template = load_prompt(args.static_prompt_name)
    cd_prompt_template = load_prompt(args.cd_prompt_name)
    insight_prompt_template = load_prompt(args.insight_prompt_name)

    last_counselor = "Hello, I'm here to support you. What's on your mind?"

    while True:
        try:
            client_input = input("🙋 You: ").strip()
            if client_input.lower() in ["quit", "exit"]:
                print("👋 Goodbye. Take care!")
                break

            # Memory extraction
            basic_entry, cd_entry = extract_memory_from_utterance(
                client_input,
                call_llm,
                args.model,
                args.temperature,
                cd_prompt_template,
                insight_prompt_template
            )
            basic_memory.append(basic_entry)
            if cd_entry:
                cd_memory.append(cd_entry)

            save_memory(basic_memory, args.basic_memory_path)
            save_memory(cd_memory, args.cd_memory_path)

            # Compose prompt and get response
            prompt = compose_prompt(
                args,
                counselor_utterance=last_counselor,
                client_utterance=client_input,
                task="Help the client reframe their thoughts. Respond as the counselor in only ONE reply.",
                esc="Use empathy, reflection, and cognitive restructuring techniques.",
                basic_memory=basic_memory,
                cd_memory=cd_memory,
                f_llm=call_llm,
                model=args.model,
                temperature=args.temperature,
                static_template=static_prompt_template
            )

            response = call_llm(prompt, model=args.model, temperature=args.temperature)
            last_counselor = response

            print(f"\n🧠 CoCoA: {response}")

            # Log the full conversation
            logging.info("User: %s", client_input)
            logging.info("CoCoA: %s", response)

        except KeyboardInterrupt:
            print("\n👋 Interrupted. Take care!")
            break
        except Exception as e:
            logging.error("Error during chat: %s", str(e))
            print("⚠️ An error occurred. Check logs for details.")

if __name__ == "__main__":
    main()
