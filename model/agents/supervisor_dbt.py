# supervisor_dbt.py
# Path: model/agents/supervisor_dbt.py
import json, os, sys, logging
from .utils.util import call_llm, load_prompt, clean_json_response
from .utils.args import parse_args

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler("run_model.log", encoding="utf-8")]
)

class SupervisorDBT:
    """
    One-to-one Dialectical Behavior Therapy (DBT) supervisor.

    Pipeline
    --------
    1.  DBT module classification
        (Mindfulness / Distress Tolerance / Emotion Regulation / Interpersonal Effectiveness)
    2.  Return an English guidance prompt that embeds skill suggestions
        drawn from Linehan skills manual.
    """

    # ------------------------------------------------------------------ #
    # INITIALISE
    # ------------------------------------------------------------------ #
    def __init__(self, args, llm, model: str = "gpt-4o-mini", temperature: float = 0.7):
        self.args        = args
        self.llm         = llm
        self.model       = model
        self.temperature = temperature

        # 템플릿 로드
        self.module_cls_tmpl = load_prompt("prompts/dbt/dbt_module_classifier.txt")
        self.guidance_tmpl   = load_prompt("prompts/dbt/dbt_guidance.txt")

        # 핵심 스킬 사전 (Linehan 2e handouts 참조)
        self.dbt_skills = {
            "Mindfulness": [
                "Observe your breath or body sensations without judging them.",
                "Describe what you notice in simple words, e.g., 'I am feeling tension in my jaw.'",
                "Participate fully in one activity (listening to music, washing dishes) one-mindfully."
            ],
            "Distress Tolerance": [
                "Wise-Mind ACCEPTS – distract yourself briefly with an activity or strong sensation.",
                "Self-soothe through the five senses (warm tea, calming music, soft fabric).",
                "IMPROVE the moment: use imagery or muscle relaxation to ride out the crisis.",
                "Radical acceptance: acknowledge painful reality exactly as it is to reduce suffering."
            ],
            "Emotion Regulation": [
                "Check the facts: is the emotion proportional to the actual situation?",
                "Opposite action: do the behaviour opposite to your urge when emotions don’t fit facts.",
                "PLEASE skills – fix physical illness, balanced eating, adequate sleep & exercise.",
                "Build mastery and small positive events each day to lower emotional vulnerability."
            ],
            "Interpersonal Effectiveness": [
                "DEAR MAN: Describe, Express, Assert, Reinforce – state your need clearly & fairly.",
                "GIVE: Gentle tone, show Interest, Validate other person, adopt an Easy manner.",
                "FAST: Be Fair, skip unnecessary Apologies, Stick to values, be Truthful to keep self-respect."
            ]
        }

    # ------------------------------------------------------------------ #
    # 1. Module classification
    # ------------------------------------------------------------------ #
    def classify_module(self, dialogue_history: str) -> str:
        prompt = self.module_cls_tmpl.replace("[Dialogue history]", dialogue_history)
        response = call_llm(prompt,
                            llm=self.llm,
                            model=self.model,
                            temperature=0)
        response = clean_json_response(response)
        try:
            module = json.loads(response)["module"]
            if module in self.dbt_skills:
                return module
        except Exception as e:
            logging.error(f"DBT module classification failed, defaulting to Mindfulness: {e}\n{response}")
        return "Mindfulness"

    # ------------------------------------------------------------------ #
    # 2. Guidance generation
    # ------------------------------------------------------------------ #
    def generate_guidance(self,
                          dialogue_history: str,
                          forced_module: str | None = None) -> str:
        module = forced_module or self.classify_module(dialogue_history)
        skills  = "\n- ".join(self.dbt_skills[module])
        prompt  = (
            self.guidance_tmpl
                .replace("[DBT Module]", module)
                .replace("[Dialogue history]", dialogue_history)
                .replace("[Skill suggestions]", f"- {skills}")
        )
        return prompt

# ---------------------------------------------------------------------- #
if __name__ == "__main__":
    import dotenv
    from openai import OpenAI
    dotenv.load_dotenv()

    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    if not OPENAI_API_KEY:
        raise EnvironmentError("OPENAI_API_KEY not found.")

    logging.info("Starting DBT supervisor agent...")
    args = parse_args()
    llm  = OpenAI(api_key=OPENAI_API_KEY)

    sup = SupervisorDBT(args, llm)

    # 예시 대화
    history = (
        "Counselor: How was your evening after work?\n"
        "Client: I felt so anxious I wanted to quit on the spot. My chest was tight and "
        "my mind kept racing about how useless I am.\n"
        "Counselor: That sounds overwhelming. What did you do then?\n"
        "Client: Honestly, I just scrolled on my phone and tried to ignore everything."
    )

    guidance = sup.generate_guidance(history)
    print("\n—— DBT GUIDANCE PROMPT ——\n")
    print(guidance)
