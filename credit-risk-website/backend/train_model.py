import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pickle
import os

def main():
    print("Generating synthetic dataset...")
    # Generate synthetic dataset with 1000 rows
    np.random.seed(42)

    n_samples = 1000

    # Features: age, income, loan_amount, credit_score, employment_years, existing_loans
    age = np.random.randint(18, 71, n_samples)
    income = np.random.randint(20000, 2000000, n_samples)
    loan_amount = np.random.randint(10000, 1000000, n_samples)
    credit_score = np.random.randint(300, 851, n_samples)
    employment_years = np.random.randint(0, 41, n_samples)
    existing_loans = np.random.randint(0, 11, n_samples)

    # Creating a DataFrame
    df = pd.DataFrame({
        'age': age,
        'income': income,
        'loan_amount': loan_amount,
        'credit_score': credit_score,
        'employment_years': employment_years,
        'existing_loans': existing_loans
    })

    print("Evaluating Risk Target logic...")
    # Define a logic for Risk Target
    # High Risk conditions: Low credit score, high loan-to-income ratio, low employment years
    risk_score = (
        (df['loan_amount'] / df['income'] > 0.6).astype(int) * 3 +
        (df['credit_score'] < 600).astype(int) * 3 +
        (df['existing_loans'] > 4).astype(int) * 2 +
        (df['employment_years'] < 2).astype(int) * 2
    )

    # Convert to 0 = Low Risk, 1 = High Risk
    df['risk_label'] = np.where(risk_score >= 4, 1, 0)

    print(f"Dataset summary:\n{df['risk_label'].value_counts()}")

    X = df[['age', 'income', 'loan_amount', 'credit_score', 'employment_years', 'existing_loans']]
    y = df['risk_label']

    # Split: 80% train, 20% test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training RandomForestClassifier...")
    # Model : RandomForestClassifier (sklearn)
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model trained successfully. Accuracy: {accuracy * 100:.2f}%")

    # Save model using pickle
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, 'model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)

    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    main()
