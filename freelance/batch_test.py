import pandas as pd
import joblib

vectorizer = joblib.load("scam_vectorizer.pkl")
model = joblib.load("scam_detector.pkl")

# List of test messages
messages = [
    "wire money outside the platform",
    "thank you for your payment",
    "update your bank info",
    "I'm available for work",
    "Click this suspicious link!"
]

for msg in messages:
    pred = model.predict(vectorizer.transform([msg]))[0]
    print(f'"{msg}": {"SCAM/SPAM" if pred == 1 else "HAM/SAFE"}')
