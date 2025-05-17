import os
import json

info = """{
  "session_insight": {
    "Presenting Issues": "Anxiety and depression, with expressions of suicidal thoughts.",
    "Emotional State": "Feeling overwhelmed, hopeless, and in a dark place.",
    "Cognitive Patterns": "Negative thought patterns related to self-worth and existence.",
    "Behavioral Patterns": "Withdrawal from activities or social interactions may be implied.",
    "Interpersonal Context": "Potential isolation or lack of support in dealing with these feelings.",
    "Trauma or Stressors": "None identified yet, but there may be underlying issues contributing to current feelings.",
    "Values or Goals": "Desire for relief from emotional pain and a search for hope."
  },
  "user_insight": {
    "Presenting Issues": "None",
    "Emotional State": "None",
    "Cognitive Patterns": "None",
    "Behavioral Patterns": "None",
    "Interpersonal Context": "None",
    "Trauma or Stressors": "None",
    "Values or Goals": "None"
  }
}
"""

print(json.loads(info))