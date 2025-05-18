# Path: model/agents/supervisor_dbt.py
# -*- coding: utf-8 -*-
import json, logging, os
from .utils.util import call_llm, load_prompt, clean_json_response
from .utils.args import parse_args

# ── basic file logger ──
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler("run_model.log", encoding="utf-8")]
)

class SupervisorDBT:
    """Lightweight DBT supervisor: triage → one-skill coaching.

    SupervisorDBT – lightweight 1-to-1 DBT agent
    -------------------------------------------
    Pipeline
    1) Triage prompt → pick the most urgent DBT module.
       (Mindfulness / Distress Tolerance / Emotion Regulation / Interpersonal Effectiveness)
       · If suicidality / self-harm is detected, the prompt itself instructs the
         model to return **Distress Tolerance**.
    2) Skill selector prompt → choose ONE core skill inside that module.
    3) Build a guidance prompt that explains the chosen skill in plain English.

    """

    # ─────────────────── initialise ───────────────────
    def __init__(self, args, llm,
                 model: str = "gpt-4o-mini", temperature: float = 0.7):
        self.args, self.llm = args, llm
        self.model, self.temperature = model, temperature

        # prompt templates
        self.triage_tmpl   = load_prompt("prompts/dbt/dbt_module_classifier.txt")
        self.skill_tmpl    = load_prompt("prompts/dbt/dbt_skill_selector.txt")
        self.guidance_tmpl = load_prompt("prompts/dbt/dbt_guidance.txt")

        # core skills distilled from Linehan (2015) handouts
        self.dbt_skills = {
            "Mindfulness": [
                "Observe your breath or body sensations without judging them.",
                "Describe what you notice in simple words, e.g., 'I am feeling tension in my jaw.'",
                "Participate fully in one activity (listening to music, washing dishes) one-mindfully."
            ],
            "Distress Tolerance": [
                "Wise-Mind ACCEPTS – distract yourself briefly with an activity or strong sensation.",
                "Self-soothe through the five senses (warm tea, calming music, soft fabric).",
                "TIP skill – change body chemistry with cold water, intense exercise, paced breathing."
            ],
            "Emotion Regulation": [
                "Check the facts – is the emotion proportional to the actual situation?",
                "Opposite action – do the behaviour opposite to your urge when emotions don’t fit facts.",
                "PLEASE skills – balanced eating, adequate sleep and exercise."
            ],
            "Interpersonal Effectiveness": [
                "DEAR MAN: Describe, Express, Assert, Reinforce – state your need clearly and fairly.",
                "GIVE: Gentle tone, show Interest, Validate the other person, adopt an Easy manner.",
                "FAST: Be Fair, skip unnecessary Apologies, Stick to values, be Truthful."
            ]
        }

    # ─────────────────── 1. triage ────────────────────
    def classify_module(self, dialogue: str) -> str:
        """Return the single most urgent DBT module."""
        prompt = self.triage_tmpl.replace("[Dialogue history]", dialogue)
        raw = clean_json_response(
            call_llm(prompt, llm=self.llm, model=self.model, temperature=0)
        )
        try:
            module = json.loads(raw)["module"]
            if module in self.dbt_skills:
                return module
        except Exception as err:
            logging.error("Module classification failed – default Mindfulness: %s\n%s", err, raw)
        return "Mindfulness"

    # ─────────────────── 2. choose skill ───────────────
    def choose_skill(self, module: str, dialogue: str) -> str:
        """Ask the LLM to pick ONE skill string from the candidate list."""
        prompt = (self.skill_tmpl
                  .replace("[Module]", module)
                  .replace("[Candidate skills]", "\n".join(self.dbt_skills[module]))
                  .replace("[Dialogue history]", dialogue))
        raw = clean_json_response(
            call_llm(prompt, llm=self.llm, model=self.model, temperature=0)
        )
        try:
            skill = json.loads(raw)["skill"]
        except Exception:
            skill = self.dbt_skills[module][0]
        if skill not in self.dbt_skills[module]:
            skill = self.dbt_skills[module][0]
        return skill

    # ─────────────────── 3. build guidance ─────────────
    def generate_guidance(self, dialogue: str) -> str:
        module = self.classify_module(dialogue)
        skill  = self.choose_skill(module, dialogue)
        return (self.guidance_tmpl
                .replace("[DBT Module]", module)
                .replace("[Skill suggestion]", skill)
                .replace("[Dialogue history]", dialogue))

# ────────────────────────── CLI demo ─────────────────────────
if __name__ == "__main__":
    import dotenv
    from openai import OpenAI
    dotenv.load_dotenv()

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise EnvironmentError("OPENAI_API_KEY not found.")

    logging.info("Launching SupervisorDBT demo …")
    args = parse_args()
    agent = SupervisorDBT(args, OpenAI(api_key=api_key))

    sample = (
        "Counselor: How was your evening after work?\n"
        "Client: Honestly, I kept thinking life isn't worth it and cutting crossed my mind.\n"
        "Counselor: That sounds frightening and painful."
    )
    print("\\n—— DBT GUIDANCE PROMPT ——\\n")
    print(agent.generate_guidance(sample))