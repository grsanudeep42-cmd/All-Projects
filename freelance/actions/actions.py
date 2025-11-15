# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

# from typing import Any, Text, Dict, List
#
# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher
#
#
# class ActionHelloWorld(Action):
#
#     def name(self) -> Text:
#         return "action_hello_world"
#
#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#         dispatcher.utter_message(text="Hello World!")
#
#         return []
import joblib  # For loading your model
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import joblib

# Load model and vectorizer (file paths must match your files)
model = joblib.load("scam_detector.pkl")
vectorizer = joblib.load("scam_vectorizer.pkl")

class ActionDetectScam(Action):
    def name(self):
        return "action_detect_scam"

    def run(self, dispatcher, tracker, domain):
        user_message = tracker.latest_message.get('text')
        X_test = vectorizer.transform([user_message])
        prediction = model.predict(X_test)[0]
        if prediction == 1:
            result = "⚠️ This message appears to be a scam or spam."
        else:
            result = "✅ Your message looks safe."
        dispatcher.utter_message(text=result)
        return []
