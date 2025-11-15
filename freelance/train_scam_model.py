import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

df = pd.read_csv("spam_clean.csv", encoding='utf-8')
df['label'] = df['label'].map({'ham': 0, 'spam': 1})
X = df['message']
y = df['label']
vectorizer = TfidfVectorizer()
X_vec = vectorizer.fit_transform(X)
model = RandomForestClassifier()
model.fit(X_vec, y)

joblib.dump(model, "scam_detector.pkl")
joblib.dump(vectorizer, "scam_vectorizer.pkl")

print(model.predict(vectorizer.transform(["wire money outside the platform"]))) # Should be [1]
print(model.predict(vectorizer.transform(["thank you for your payment"])))      # Should be [0]
X_train, X_test, y_train, y_test = train_test_split(X_vec, y, test_size=0.2, random_state=42)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))

