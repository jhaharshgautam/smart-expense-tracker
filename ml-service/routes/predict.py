from fastapi import APIRouter
import psycopg2
import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

def get_db():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD") or None
    )

@router.get("/{user_id}")
def predict_next_month(user_id: int):
    try:
        conn = get_db()
        query = """
            SELECT DATE_TRUNC('month', date) as month,
                   SUM(amount) as total
            FROM expenses
            WHERE user_id = %s
            GROUP BY month
            ORDER BY month
        """
        df = pd.read_sql(query, conn, params=(user_id,))
        conn.close()

        if len(df) < 2:
            return {
                "predicted": None,
                "confidence": 0,
                "trend": "neutral",
                "message": "Need at least 2 months of data for prediction"
            }

        X = np.arange(len(df)).reshape(-1, 1)
        y = df['total'].values.astype(float)

        model = LinearRegression()
        model.fit(X, y)

        next_index = np.array([[len(df)]])
        prediction = model.predict(next_index)[0]

        r2 = model.score(X, y)
        confidence = round(max(0, min(r2 * 100, 100)), 1)
        trend = "increasing" if model.coef_[0] > 0 else "decreasing"

        return {
            "predicted": round(float(prediction), 2),
            "confidence": confidence,
            "trend": trend,
            "months_used": len(df),
            "message": "Prediction successful"
        }
    except Exception as e:
        return {"predicted": None, "confidence": 0, "trend": "neutral", "message": str(e)}
