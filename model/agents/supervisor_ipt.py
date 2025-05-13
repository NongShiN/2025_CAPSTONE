import json, os, sys, logging
from pathlib import Path
from .utils.util import call_llm, load_prompt, clean_json_response
from .utils.args import parse_args

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler("run_model.log", encoding="utf-8")]
)

class SupervisorIPT:
    """
    One‑to‑one Interpersonal Therapy supervisor.

    Pipeline
    --------
    1.  Stage detection  (initial / middle / termination)
    2.  IPT problem‑area classification (Grief / Disputes / Role Transition / Loneliness‑Isolation)
    3.  Return an English guidance prompt that embeds WHO‑recommended strategies.
    Every turn, (stage, area) is appended to data/ipt_log.json and fed back into the next
    classification prompts so the model can reference prior decisions.
    """

    LOG_FILE = Path("data/ipt_log.json")
    _ALLOWED_STAGES = {"initial", "middle", "termination"}

    # ------------------------------------------------------------------ #
    # INITIALISE
    # ------------------------------------------------------------------ #
    def __init__(self, args, llm, model: str = "gpt-4o-mini", temperature: float = 0.7):
        self.args         = args
        self.llm          = llm
        self.model        = model
        self.temperature  = temperature

        # 템플릿 로드
        self.stage_cls_tmpl = load_prompt("prompts/ipt/ipt_stage_classifier.txt")
        self.area_cls_tmpl  = load_prompt("prompts/ipt/ipt_area_classifier.txt")
        self.guidance_tmpl  = {
            "initial":     load_prompt("prompts/ipt/ipt_guidance_initial.txt"),
            "middle":      load_prompt("prompts/ipt/ipt_guidance_middle.txt"),
            "termination": load_prompt("prompts/ipt/ipt_guidance_termination.txt"),
        }

        # WHO Chapter 5 전략 – 간략·일상어 버전
        self.ipt_strategies = {
            "Grief": [
                "Explain that intense waves of sadness, anger, or guilt are normal and may flare on anniversaries.",
                "Invite the client to tell the story of the loss at their own pace so hidden feelings can surface safely.",
                "Reassure that letting pain soften does not erase the bond; instead carry the memory with more strength.",
                "Help the client lean on family, friends, or faith rituals for practical and emotional support.",
                "Agree on a short daily or weekly ‘memory time’ so intrusive thoughts don’t take over the whole day.",
                "Plan new activities or roles that honour the loved one while gradually rebuilding everyday life."
            ],
            "Disputes": [
                "Work together to state exactly what each side wants and where expectations clash.",
                "Check whether the conflict is still open, feels hopelessly stuck, or is heading toward a split; choose tactics to match.",
                "Teach and rehearse clear, respectful talk: good timing, ‘I‑messages’, listening, showing appreciation.",
                "Brainstorm many possible actions without judging, then weigh pros and cons to pick one to try first.",
                "If direct talk seems risky or impossible, help the client find a trusted mediator or ally.",
                "Set a small homework step (e.g., one conversation); next session review what happened and how mood shifted."
            ],
            "Role Transition": [
                "Name the old role that ended and allow space for mixed feelings—loss, relief, fear, excitement.",
                "List both gains and losses in the new situation to uncover hidden opportunities as well as challenges.",
                "Identify skills, information, or helpers the client needs to feel competent in the new role.",
                "Break the change into bite‑sized steps, starting with the easiest and building up.",
                "Practise upcoming tasks or conversations through role‑play or mental rehearsal to reduce anxiety.",
                "Map a support team (family, peers, services) to check in with during the transition and guard against relapse."
            ],
            "Loneliness/Isolation": [
                "Show how staying withdrawn deepens depression and how small connections can lift mood.",
                "Draw a simple map of current, lost, and possible social contacts; choose one or two to focus on first.",
                "Set graded social goals—from saying hello, to short visits, to joining group activities.",
                "Role‑play conversation openers, sharing about oneself, and listening skills; gather feedback.",
                "After each social attempt, discuss what went well and what could be tweaked next time.",
                "Encourage joining regular community, hobby, or faith groups to build ongoing contact and routine."
            ],
        }

        self.session_log = self._load_log()

    # ------------------------------------------------------------------ #
    # LOG I/O
    # ------------------------------------------------------------------ #
    def _load_log(self):
        if self.LOG_FILE.exists():
            try:
                with open(self.LOG_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logging.warning(f"Failed to load IPT log: {e}")
        return []  # 파일이 없거나 오류 시

    def _save_log(self):
        self.LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(self.LOG_FILE, "w", encoding="utf-8") as f:
            json.dump(self.session_log, f, ensure_ascii=False, indent=2)

    def _log_header(self) -> str:
        """전체 로그를 문자열로 변환해 분류 프롬프트 앞에 붙인다."""
        if not self.session_log:
            return ""
        pretty = "\n".join(
            f"- Stage: {s}, Area: {a}" for s, a in self.session_log
        )
        return f"Previous stage/area decisions:\n{pretty}\n\n"

    # ------------------------------------------------------------------ #
    # 1. Stage classification
    # ------------------------------------------------------------------ #
    def classify_stage(self, dialogue_history: str) -> str:
        prompt = (
            self._log_header() + self.stage_cls_tmpl
        ).replace("[Dialogue history]", dialogue_history)
        response  = call_llm(prompt, llm=self.llm, model=self.model, temperature=0)
        response  = clean_json_response(response)
        try:
            stage = json.loads(response)["stage"].lower()
            return stage if stage in self._ALLOWED_STAGES else "initial"
        except Exception as err:
            logging.error(f"Stage classification failed → default 'initial': {err}\n{response}")
            return "initial"

    # ------------------------------------------------------------------ #
    # 2. Problem‑area classification
    # ------------------------------------------------------------------ #
    def classify_problem_area(self, dialogue_history: str) -> str:
        prompt = (
            self._log_header() + self.area_cls_tmpl
        ).replace("[Dialogue history]", dialogue_history)
        response = call_llm(prompt, llm=self.llm, model=self.model, temperature=0)
        response = clean_json_response(response)
        try:
            area = json.loads(response)["problem_area"]
            return area if area in self.ipt_strategies else "Role Transition"
        except Exception as err:
            logging.error(f"Area classification failed → default 'Role Transition': {err}\n{response}")
            return "Role Transition"

    # ------------------------------------------------------------------ #
    # 3. Guidance generation
    # ------------------------------------------------------------------ #
    def generate_guidance(self,
                          dialogue_history: str,
                          stage: str | None = None,
                          forced_area: str | None = None) -> str:
        # ① determine stage / area
        stage = stage.lower() if stage else self.classify_stage(dialogue_history)
        problem_area = forced_area or self.classify_problem_area(dialogue_history)

        # ② update log & 저장
        self.session_log.append((stage, problem_area))
        self._save_log()

        # ③ assemble prompt
        strategies = "\n- ".join(self.ipt_strategies[problem_area])
        template   = self.guidance_tmpl[stage]
        prompt     = (
            template
            .replace("[Problem area]",      problem_area)
            .replace("[Dialogue history]",  dialogue_history)
            .replace("[Recommended strategies]", f"- {strategies}")
        )
        return prompt

# ---------------------------------------------------------------------- #
if __name__ == "__main__":
    import dotenv, os, json
    from openai import OpenAI
    dotenv.load_dotenv()

    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    if not OPENAI_API_KEY:
        raise EnvironmentError("OPENAI_API_KEY not found.")

    args = parse_args()
    llm  = OpenAI(api_key=OPENAI_API_KEY)

    sup = SupervisorIPT(args, llm)

    sup.session_log = [("middle", "Disputes")]
    sup._save_log()

    history = (
        "Counselor: Welcome back. How have things been since our last talk?\n"
        "Client: I actually spoke with my sister like we planned, but it turned into another argument.\n"
        "Counselor: What triggered the argument?\n"
        "Client: She kept saying I should just 'get over it' after mom died. I snapped.\n"
    )

    guidance = sup.generate_guidance(history)
    print("\n—— GUIDANCE PROMPT ——\n")
    print(guidance)
