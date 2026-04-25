from fastapi import APIRouter
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

router = APIRouter()

TRAINING_DATA = [
    ("zomato", "Food"), ("swiggy", "Food"), ("dominos", "Food"),
    ("mcdonalds", "Food"), ("kfc", "Food"), ("burger", "Food"),
    ("pizza", "Food"), ("biryani", "Food"), ("lunch", "Food"),
    ("dinner", "Food"), ("breakfast", "Food"), ("cafe", "Food"),
    ("restaurant", "Food"), ("food", "Food"), ("chai", "Food"),
    ("ola", "Travel"), ("uber", "Travel"), ("rapido", "Travel"),
    ("bus ticket", "Travel"), ("metro", "Travel"), ("petrol", "Travel"),
    ("auto", "Travel"), ("cab", "Travel"), ("flight", "Travel"),
    ("train ticket", "Travel"), ("fuel", "Travel"),
    ("amazon", "Shopping"), ("flipkart", "Shopping"), ("myntra", "Shopping"),
    ("clothes", "Shopping"), ("shoes", "Shopping"), ("dress", "Shopping"),
    ("shirt", "Shopping"), ("shopping", "Shopping"),
    ("netflix", "Subscriptions"), ("spotify", "Subscriptions"),
    ("hotstar", "Subscriptions"), ("prime", "Subscriptions"),
    ("youtube premium", "Subscriptions"), ("subscription", "Subscriptions"),
    ("rent", "Rent"), ("house rent", "Rent"), ("pg", "Rent"),
    ("hostel", "Rent"), ("room rent", "Rent"),
    ("doctor", "Health"), ("medicine", "Health"), ("pharmacy", "Health"),
    ("hospital", "Health"), ("gym", "Health"), ("medical", "Health"),
    ("movie", "Entertainment"), ("concert", "Entertainment"),
    ("game", "Entertainment"), ("bowling", "Entertainment"),
    ("outing", "Entertainment"), ("party", "Entertainment"),
]

texts = [t[0] for t in TRAINING_DATA]
labels = [t[1] for t in TRAINING_DATA]

vectorizer = TfidfVectorizer(ngram_range=(1, 2))
X = vectorizer.fit_transform(texts)
model = LogisticRegression(max_iter=500)
model.fit(X, labels)

class TextInput(BaseModel):
    text: str

@router.post("/")
def categorize(input: TextInput):
    X_new = vectorizer.transform([input.text.lower()])
    prediction = model.predict(X_new)[0]
    proba = model.predict_proba(X_new).max()
    return {
        "category": prediction,
        "confidence": round(float(proba) * 100, 1)
    }
