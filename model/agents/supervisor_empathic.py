# supervisor_empathic.py
import json, logging
from pathlib import Path
from .utils.util import call_llm, load_prompt, clean_json_response
from .utils.args import parse_args

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler("run_model.log", encoding="utf-8")]
)

class SupervisorEmpathic:
    """
    Empathy-centric counseling supervisor (1-to-1)
    """

    LOG_FILE = Path("agents/data/empathic_log.json")
    EMOTIONS = ["Anger","Anxiety","Hopelessness","Shame",
                "Upset","Distress","Guilty","Boredom","Indifference"]
    ISSUES   = ["Studies","Family","Relationship","Finance","Work","Health"]

    # --------------------------- INIT --------------------------- #
    def __init__(self, args, llm, model="gpt-4o-mini", temperature=0.7):
        self.args, self.llm, self.model, self.temperature = args, llm, model, temperature

        # 분류용 프롬프트
        self.emotion_cls_tmpl = load_prompt("prompts/empathic/emotion_classifier.txt")
        self.issue_cls_tmpl   = load_prompt("prompts/empathic/issue_classifier.txt")
        self.level_cls_tmpl   = load_prompt("prompts/empathic/level_classifier.txt")

        # 응답용 프롬프트
        self.guidance_tmpl    = load_prompt("prompts/empathic/empathy_guidance.txt")

        # Rogers 단계별 핵심 전략 (논문 3.2.1절 요약)
        self.empathy_strategies = {
            1: [
                "Restate the client’s explicit words almost verbatim to show basic understanding.",
                "Ask an open question inviting the client to elaborate."
            ],
            2: [
                "Name the implied feeling to validate it.",
                "Ask when or how that feeling becomes stronger."
            ],
            3: [
                "Reflect the mix of feelings into one coherent core emotion.",
                "Check with the client if this reflection feels accurate.",
                "Plan one small experiment that might ease the tension."
            ],
            4: [
                "Offer a tentative interpretation of an unspoken need beneath the feeling.",
                "Invite the client to imagine what meeting that need would look like.",
                "Co-design the first realistic step toward that need."
            ],
        }

        self.session_log = self._load_log()

    # ------------------------ LOG I/O --------------------------- #
    def _load_log(self):
        if self.LOG_FILE.exists():
            try:
                return json.loads(self.LOG_FILE.read_text(encoding="utf-8"))
            except Exception as e:
                logging.warning(f"Fail load log → new: {e}")
        return []

    def _save_log(self):
        self.LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
        self.LOG_FILE.write_text(json.dumps(self.session_log, ensure_ascii=False, indent=2))

    def _log_header(self):
        if not self.session_log:
            return ""
        return "Previous decisions:\n" + "\n".join(
            f"- Emotion: {e}, Issue: {i}, Level: {l}" for e,i,l in self.session_log
        ) + "\n\n"

    # ------------------------ 1. Emotion ------------------------ #
    def classify_emotion(self, dialogue:str)->str:
        prompt = (self._log_header() + self.emotion_cls_tmpl).replace("[Dialogue]", dialogue)
        res = clean_json_response(call_llm(prompt, llm=self.llm, model=self.model, temperature=0))
        try:
            emo = json.loads(res)["emotion"]
            return emo if emo in self.EMOTIONS else "Distress"
        except Exception as e:
            logging.error(f"emotion cls fail → Distress: {e}")
            return "Distress"

    # ------------------------ 2. Issue -------------------------- #
    def classify_issue(self, dialogue:str)->str:
        prompt = (self._log_header() + self.issue_cls_tmpl).replace("[Dialogue]", dialogue)
        res = clean_json_response(call_llm(prompt, llm=self.llm, model=self.model, temperature=0))
        try:
            issue = json.loads(res)["issue"]
            return issue if issue in self.ISSUES else "Relationship"
        except Exception as e:
            logging.error(f"issue cls fail → Relationship: {e}")
            return "Relationship"

    # ------------------------ 3. Level -------------------------- #
    def classify_level(self, dialogue:str)->int:
        prompt = (self._log_header() + self.level_cls_tmpl).replace("[Dialogue]", dialogue)
        res = clean_json_response(call_llm(prompt, llm=self.llm, model=self.model, temperature=0))
        try:
            lvl = int(json.loads(res)["level"])
            return lvl if lvl in {1,2,3,4} else 1
        except Exception:
            return None   # 실패 시 None 리턴

    def _fallback_level(self, emotion:str)->int:
        if emotion in {"Anger","Anxiety","Hopelessness"}:   return 4
        if emotion in {"Distress","Upset","Shame"}:         return 3
        if emotion in {"Guilty","Boredom"}:                 return 2
        return 1  # Indifference 또는 기타

    def _choose_level(self, dialogue:str, emotion:str)->int:
        lvl = self.classify_level(dialogue)
        if lvl:  # 정상 분류
            return lvl
        # 분류 실패 → 휴리스틱
        return self._fallback_level(emotion)

    # -------------------- 4. Guidance --------------------------- #
    def generate_guidance(self, dialogue:str, forced_level:int|None=None)->str:
        emotion = self.classify_emotion(dialogue)
        issue   = self.classify_issue(dialogue)
        level   = forced_level if forced_level else self._choose_level(dialogue, emotion)

        # 로그 기록
        self.session_log.append((emotion, issue, level))
        self._save_log()

        strategies = "\n- ".join(self.empathy_strategies[level])
        prompt = (
            self.guidance_tmpl
              .replace("[LEVEL]", f"Level {level}")
              .replace("[EMOTION]", emotion)
              .replace("[ISSUE]", issue)
              .replace("[DIALOGUE]", dialogue)
              .replace("[Recommended strategies]", f"- {strategies}")
        )
        return prompt

# -------------------------- MAIN TEST -------------------------- #
if __name__ == "__main__":
    """
    quick test : 두 턴 연속 호출 후 log 확인
    """
    import dotenv, os, time
    from openai import OpenAI

    dotenv.load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise EnvironmentError("OPENAI_API_KEY not set")

    llm  = OpenAI(api_key=api_key)
    args = parse_args()
    sup  = SupervisorEmpathic(args, llm)

    history = (
        "Counselor: Welcome back. How have things been since our last talk?\n"
        "Client: I actually spoke with my sister like we planned, but it turned into another argument.\n"
        "Counselor: What triggered the argument?\n"
        "Client: She kept saying I should just 'get over it' after mom died. I snapped.\n"
    )


    print(sup.generate_guidance(history))