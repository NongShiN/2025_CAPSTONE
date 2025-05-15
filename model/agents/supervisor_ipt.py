import json, os, sys, logging
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
    Every turn, (stage, area) is appended to ipt_log and fed back into the next
    classification prompts so the model can reference prior decisions.
    """

    _ALLOWED_STAGES = {"initial", "middle", "termination"}

    # ------------------------------------------------------------------ #
    # INITIALISE
    # ------------------------------------------------------------------ #
    def __init__(self, args, llm, ipt_log: dict, model: str = "gpt-4o-mini", temperature: float = 0.7):
        self.args        = args
        self.llm         = llm
        self.model       = model
        self.temperature = temperature

        # ── 로그 객체 주입 ──
        # ipt_log는 {"history": [ {"stage": "...", "problem_area": "..."}, ... ] } 형태
        self.ipt_log = ipt_log
        if "history" not in self.ipt_log or not isinstance(self.ipt_log["history"], list):
            self.ipt_log["history"] = []

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
            ]
        }

        self.ipt_dialogues = {
            "Grief": [
                "Counselor: Aria, we spoke before about the sadness you’ve felt since your husband and daughter died. Could you tell me about your husband today?",
                "Client: I don’t know what to say.",
                "Counselor: Maybe start with his illness and what changed for you when he became sick.",
                "Client: This is so hard. I get sad whenever I think about it.",
                "Counselor: I hear how painful it is. Talking through the memories can help you carry the grief; I’ll listen and support you.",
                "Client: I’ll try. My husband died first. He lived with TB for about a year.…",
                "Counselor: How long has it been since he died?",
                "Client: Last year during the rainy season.…",
                "Counselor: I’m so sorry, Aria. I can see how much you loved him.",
                "Client: I cry every day. Nothing makes me happy.…",
                "Counselor: He was a good husband and you miss him deeply.",
                "Client: Yes.",
                "Counselor: How are you feeling right now?",
                "Client: Terrible. I don’t know what to do…",
                "Counselor: It feels overwhelming. Let’s explore what might help you feel less alone while you mourn.",
                "Client: Talking with you helps, but I still miss him.",
                "Counselor: I noticed you mentioned fewer depression symptoms this week—why do you think that is?",
                "Client: I’m not crying as much, and I’ve started going to the market with my neighbours. I’m just not as sad."
            ],

            "Disputes": [
                "Counselor: Jasmine, last time you said you’ve been unhappy with your husband and arguing for almost a year. Could you tell me more about the disagreements?",
                "Client: I go to care for my sick mother, and when I return he’s bought gifts for another woman.…",
                "Counselor: That sounds hurtful and frustrating. What have you already tried to let him know how this affects you?",
                "Client: I’ve told him I’m a good wife and he shouldn’t do it, but he says I ignore him.",
                "Counselor: So he feels neglected while you support your mother. Let’s look at options to communicate your needs without giving up your caregiving role. What ideas come to mind?",
                "Client: I don’t know. I don’t really want to leave him, but he isn’t being a good husband or father.",
                "Counselor: It is a tough situation. Perhaps we can practice wording that shows him how his actions impact the family and explore who else could help care for your mother.",
                "Client: Maybe asking my sister to visit more often could help.",
                "Counselor: That’s a concrete step. How would you bring this up with your sister and your husband?",
                "Client: I could explain that I’m exhausted and the children need stability.…",
                "Counselor: Good. Let’s role-play that conversation so you feel prepared.",
                "Client: All right, let’s try."
            ],

            "Role Transition": [
                "Counselor: Hass, you shared that since learning you have HIV you’ve felt hopeless. Can we talk about what changed for you after the diagnosis?",
                "Client: I’ve been sick a long time. When the clinic told me, I felt nothing matters—I’ll die soon.",
                "Counselor: HIV is serious, but some hopelessness comes from depression. What advice has the nurse given you?",
                "Client: She says to take care of my health and always use a condom, but I don’t.",
                "Counselor: Part of you feels, “Why bother?” yet another part cares about your family. How does thinking of your wife and children affect you?",
                "Client: When I imagine my daughter getting HIV, I feel angry and want to be careful.",
                "Counselor: That wish to protect her shows hope. What strengths could help you act on that?",
                "Client: I can still teach my children and be a good father even if I’m sick.",
                "Counselor: Those are meaningful roles. Let’s plan small steps—like using condoms and sharing time with your children—that reinforce that purpose.",
                "Client: I’ll try. Talking about it helps.",
                "Counselor: We’ll keep working on actions that make life feel worth living, even with HIV."
            ],

            "Loneliness/Isolation": [
                "Counselor: Barbara, how was your week?",
                "Client: The same. I stayed home; didn’t feel like going out.",
                "Counselor: I notice sadness in your eyes. Do you feel lonely?",
                "Client: Yes. Since my mother died, no one visits.",
                "Counselor: Earlier you mentioned relatives tried to visit but you couldn’t open the door then. Now you’d like more contact—this shows progress. Let’s think of ways to reconnect.",
                "Client: I’m not sure how. Could you give me an idea?",
                "Counselor: You enjoy cooking, right? There’s a community kitchen on Wednesdays that prepares meals for orphans. Volunteering there could help you meet others while doing something meaningful.",
                "Client: My cousin goes there and likes it. Maybe I could try.",
                "Counselor: Great. What would make it easier to go this Wednesday? Let’s plan the details together.",
                "Client: I could ask my cousin to walk with me.",
                "Counselor: Excellent idea. How do you feel about taking that step?",
                "Client: Better—hopeful, actually. Thank you."
            ]
        }

    # ------------------------------------------------------------------ #
    # HELPER: 로그를 헤더 문자열로 변환
    # ------------------------------------------------------------------ #
    def _log_header(self) -> str:
        """
        Convert previous (stage, area) pairs into a bullet list header that
        can be prepended to the classification prompts.
        """
        if not self.ipt_log["history"]:
            return ""

        pretty = "\n".join(
            f"- Stage: {item['stage']}, Area: {item['problem_area']}"
            for item in self.ipt_log["history"]
        )
        return f"Previous stage/area decisions:\n{pretty}\n\n"

    # ------------------------------------------------------------------ #
    # 1. Stage classification
    # ------------------------------------------------------------------ #
    def classify_stage(self, dialogue_history: str) -> str:
        prompt = (
            self._log_header() + self.stage_cls_tmpl
        ).replace("[Dialogue history]", dialogue_history)

        response = call_llm(prompt, llm=self.llm, model=self.model, temperature=0)
        response = clean_json_response(response)
        try:
            stage = json.loads(response)["stage"].lower()
            return stage if stage in self._ALLOWED_STAGES else "initial"
        except Exception as err:
            logging.error(f"Stage classification failed → default 'initial': {err}\n{response}")
            return "initial"

    # ------------------------------------------------------------------ #
    # 2. Problem-area classification
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
    # 3. Guidance generation
    # ------------------------------------------------------------------ #
    def generate_guidance(
        self,
        dialogue_history: str,
        stage: str,
        problem_area: str
    ) -> str:
        """결정된 stage·area를 받아 WHO 가이드 프롬프트를 조립한다."""
        strategies       = "\n- ".join(self.ipt_strategies[problem_area])
        reference_dialog = "\n- ".join(self.ipt_dialogues[problem_area])
        template         = self.guidance_tmpl[stage]

        prompt = (
            template
            .replace("[Problem area]",      problem_area)
            .replace("[Dialogue history]",  dialogue_history)
            .replace("[Recommended strategies]", f"- {strategies}")
            .replace("[ipt_dialogues]", f"- {reference_dialog}")
        )
        return prompt

# ---------------------------------------------------------------------- #
if __name__ == "__main__":
    import dotenv, os, json
    from openai import OpenAI

    dotenv.load_dotenv()
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    args = parse_args()
    llm  = OpenAI(api_key=OPENAI_API_KEY)

    # 1) 세션별 로그 객체
    # ipt_log = {"history": []}
    ipt_log = {
        "history": [
            {
                "stage": "middle",
                "problem_area": "Grief"
            },
            {
                "stage": "middle",
                "problem_area": "Grief"
            }
        ]
    }

    # 2) 대화 히스토리
    dialogue = (
        "Counselor: Welcome back. How have things been since our last talk?\n"
        "Client: I actually spoke with my sister like we planned, but it turned into another argument.\n"
        "Counselor: What triggered the argument?\n"
        "Client: She kept saying I should just 'get over it' after mom died. I snapped.\n"
    )

    # 3) 감독 클래스
    supervisor = SupervisorIPT(args, llm, ipt_log=ipt_log)

    # 4) 분류
    stage        = supervisor.classify_stage(dialogue)
    problem_area = supervisor.classify_problem_area(dialogue)

    # 5) 로그 갱신(메인에서 직접)
    ipt_log["history"].append({"stage": stage, "problem_area": problem_area})

    # 6) 가이드 생성
    guidance_prompt = supervisor.generate_guidance(
        dialogue_history=dialogue,
        stage=stage,
        problem_area=problem_area
    )

    print("\n—— GUIDANCE PROMPT ——\n")
    print(guidance_prompt)
    print("\n—— ipt_log 현재 상태 ——\n")
    print(json.dumps(ipt_log, indent=2, ensure_ascii=False))