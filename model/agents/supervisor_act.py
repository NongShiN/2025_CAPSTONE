import json
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
from utils.util import call_llm, load_prompt, clean_json_response
from utils.args import parse_args
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("run_model.log", encoding='utf-8')
    ]
)

class SupervisorACT:
    def __init__(self, args, llm, model="gpt-4o-mini", temperature=0.7):
        self.args = args
        self.llm = llm
        self.model = model
        self.temperature = temperature

        self.guidance_prompt_template = load_prompt("prompts/act/act_guidance.txt")
        self.rating_prompt_template = load_prompt("prompts/act/pf_rating.txt")

        self.pf_rating = {}
        # desrciption of positive psychological processes
        self.ppp = {
            "Acceptance": [
                "Let yourself feel tough emotions instead of fighting them",
                "Stay with discomfort instead of trying to fix it right away",
                "Try saying yes to feelings instead of pushing them away"
            ],
            "Defusion": [
                "Step back and observe your negative or uncomfortable thoughts from a distance",
                "Repeat the thought out loud until it sounds like just a sound",
                "Give the thought a color, shape, speed, or form to treat it like an external event",
                "Express it as 'I am having the thought that I am ~' instead of saying 'I am ~'"
            ],
            "Present Moment": [
                "Focus on your breath or surroundings when feeling overwhelmed",
                "Notice what's happening right now without judging it",
                "Try to use language not as a tool for judging or predicting",
                "but as a way to notice and describe your experience. Describe your inner experience just as it is."
            ],
            "Self": [
                "Notice that you are the one observing your thoughts and feelings, not the thoughts or feelings themselves",
                "See yourself from a broader perspective, like through someone else's eyes",
                "Say to yourself: 'I am the one noticing this experience, not the experience itself'"
            ],
            "Values": [
                "Think about what really matters to you in life",
                "Ask yourself why you care about certain things, not just what you 'should' do",
                "Know the difference between goals you check off and directions you want to live by"
            ],
            "Committed Action": [
                "Take small steps that reflect your values, even if it’s uncomfortable",
                "Set meaningful short- and long-term goals, not just tasks to complete",
                "Make realistic plans to act on your values even when obstacles arise",
                "Notice if you're avoiding action due to fear or discomfort—and gently return to your chosen direction"
            ]
        }

    def evaluate_pf_processes(self, dialogue_history):
        prompt = self.rating_prompt_template.replace("[Dialogue history]", dialogue_history)
        response = call_llm(prompt, llm=self.llm, model=self.model, temperature=0)
        response = clean_json_response(response)
        try:
            pf_scores = json.loads(response)
        except json.JSONDecodeError as e:
            logging.error(f"JSON decoding failed: {e}")
            logging.error(f"Response received: {response}")
            raise ValueError("LLM response was not valid JSON.")

        self.pf_rating = {}
        for process, scores in pf_scores.items():
            if isinstance(scores, list) and scores:
                self.pf_rating[process] = sum(scores) / len(scores)
    
    def decide_intervention_point(self, pf_rating, threshold=4):
        intervention_points = {}
        for pf, avg_score in pf_rating.items():
            if avg_score < threshold:
                intervention_points[pf] = self.ppp.get(pf, [])
        return intervention_points

    def generate_intervention_guidance(self, dialogue_history, pf_rating, intervention_points):
        ppp_to_apply = []
        for process, techniques in intervention_points.items():
            joined = "\n- ".join(techniques)
            ppp_to_apply.append(f"{process} techniques:\n- {joined}")
        techniques_str = "\n\n".join(ppp_to_apply)

        prompt = self.guidance_prompt_template.replace("[Psychological flexibility rating]", str(pf_rating))
        prompt = prompt.replace("[Dialogue history]", dialogue_history)
        prompt = prompt.replace("Intervention techniques", techniques_str)
        return prompt
    
if __name__ == "__main__":
    import dotenv
    dotenv.load_dotenv()
    
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    if not OPENAI_API_KEY:
        raise EnvironmentError("OPENAI_API_KEY not found. Check your .env file.")
    
    logging.info("Starting ACT supervisor agent...")
    
    args = parse_args()

    from openai import OpenAI
    llm = OpenAI(api_key=OPENAI_API_KEY)

    supervisor = SupervisorACT(args, llm)

    dialogue_history = "Counselor: Can you tell me what brought you in today?\n" \
                       "Client: I just feel stuck. I know I want to do something meaningful, but I always end up doing nothing.\n" \
                       "Counselor: What stops you from doing the things that feel meaningful?\n" \
                       "Client: It's like this voice in my head tells me I'll just mess it up, so what's the point.\n" \
                       "Counselor: That sounds hard. When does that voice usually show up?\n" \
                       "Client: Usually when I start planning something important. Like last week, I wanted to reach out to an old friend, but then I thought, 'They probably don’t want to hear from me anyway.'\n" \
                       "Counselor: And then what happened?\n" \
                       "Client: I just gave up and scrolled on my phone instead. It's safer not to try, I guess.\n" \
                       "Counselor: Do you think this keeps you away from things that really matter to you?\n" \
                       "Client: Yeah, I really value connection... but I don’t act like it."

    supervisor.evaluate_pf_processes(dialogue_history)
    intervention_points = supervisor.decide_intervention_point(supervisor.pf_rating)
    result = supervisor.generate_intervention_guidance(dialogue_history, supervisor.pf_rating, intervention_points)
    print("\n=== Intervention Guidance Output ===\n")
    print(result)

    #print("\n=== Psychological Flexibility Ratings ===\n")
    #for k, v in supervisor.pf_rating.items():
    #    print(f"{k}: {v:.2f}")
