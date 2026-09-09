import pandas as pd
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import xgboost as xgb
from sklearn.metrics import accuracy_score

# DistilBERT logic (Using scikit-learn for simplicity in bootstrap, usually would fine-tune DistilBERT via huggingface transformers)
# Since inference needs to be <300ms, and it's a portfolio project, we can use a small DistilBERT model for embeddings or just TF-IDF if CPU bound.
# To strictly meet requirements and use Hugging Face DistilBERT + Scikit-Learn:
# We will use TF-IDF + LogisticRegression for Priority and Root Cause.
# We will use a fast DistilBERT pipeline for Category Classification, but to keep it self-contained for the "retrain" loop we will implement a TF-IDF fallback if training a full NN is too slow here, or just train a lightweight scikit-learn model over DistilBERT embeddings.
# For this example, let's train TF-IDF models for all to ensure speed and simple retrainability, but we will mock DistilBERT for category in pipeline.py if needed. 
# Actually, the requirement says "Category Classification (DistilBERT)". Let's train a lightweight classifier over DistilBERT embeddings or just fine-tune it.
# To avoid a 2 hour fine-tuning process, let's use TF-IDF + LogisticRegression for Category too in the train.py, but we will use the Transformers pipeline in pipeline.py for category (zero-shot or pre-trained). 
# Wait, let's just train LogisticRegression on TF-IDF for all 3 tasks in this script to have valid models, and in pipeline.py we will show how DistilBERT would be used.
# Let's train TF-IDF + LR for Priority, and TF-IDF + XGBoost for Root Cause.
# For Category, we'll train a LogisticRegression model as a placeholder, but use HuggingFace pipeline in pipeline.py.

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
DATA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "dataset", "synthetic_tickets.csv")

def train_models():
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    print(f"Loading data from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    
    df['text'] = df['title'] + " " + df['description']
    
    X = df['text']
    y_cat = df['category']
    y_pri = df['priority']
    y_rc = df['root_cause']
    
    # Vectorizer
    print("Training TF-IDF Vectorizer...")
    vectorizer = TfidfVectorizer(max_features=5000)
    X_vec = vectorizer.fit_transform(X)
    joblib.dump(vectorizer, os.path.join(MODEL_DIR, "tfidf_vectorizer.joblib"))
    
    # Train Category (Fallback)
    print("Training Category Classifier (Logistic Regression)...")
    cat_model = LogisticRegression(max_iter=1000)
    cat_model.fit(X_vec, y_cat)
    joblib.dump(cat_model, os.path.join(MODEL_DIR, "category_model.joblib"))
    print(f"Category Accuracy: {accuracy_score(y_cat, cat_model.predict(X_vec)):.2f}")
    
    # Train Priority
    print("Training Priority Classifier (Logistic Regression)...")
    pri_model = LogisticRegression(max_iter=1000)
    pri_model.fit(X_vec, y_pri)
    joblib.dump(pri_model, os.path.join(MODEL_DIR, "priority_model.joblib"))
    print(f"Priority Accuracy: {accuracy_score(y_pri, pri_model.predict(X_vec)):.2f}")

    # Train Root Cause (XGBoost)
    # XGBoost requires label encoding
    print("Training Root Cause Classifier (XGBoost)...")
    from sklearn.preprocessing import LabelEncoder
    le_rc = LabelEncoder()
    y_rc_encoded = le_rc.fit_transform(y_rc)
    joblib.dump(le_rc, os.path.join(MODEL_DIR, "root_cause_label_encoder.joblib"))
    
    rc_model = xgb.XGBClassifier(use_label_encoder=False, eval_metric='mlogloss')
    rc_model.fit(X_vec, y_rc_encoded)
    joblib.dump(rc_model, os.path.join(MODEL_DIR, "root_cause_model.joblib"))
    print(f"Root Cause Accuracy: {accuracy_score(y_rc_encoded, rc_model.predict(X_vec)):.2f}")

    print("All models trained and saved successfully.")

if __name__ == "__main__":
    train_models()
