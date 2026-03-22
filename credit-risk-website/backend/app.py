from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os

# Serve the frontend directory dynamically
frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../frontend')
app = Flask(__name__, static_folder=frontend_dir, static_url_path='')
# Enable Flask-CORS for browser compatibility
CORS(app)

@app.route('/')
def index():
    return app.send_static_file('index.html')

# Load the trained model gracefully
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, 'model.pkl')

try:
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
except FileNotFoundError:
    model = None
    print("Warning: model.pkl not found. Please run train_model.py first.")

@app.route('/predict', methods=['POST'])
def predict():
    """
    Route: POST /predict
    Input: JSON with age, income, loan_amount, credit_score, employment_years, existing_loans
    Output: JSON with result, confidence, and message
    """
    if model is None:
        return jsonify({"error": "Model not trained yet. Please train the AI model first."}), 500
        
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input JSON provided"}), 400
            
        # Extract features
        age = float(data.get('age', 0))
        income = float(data.get('income', 0))
        loan_amount = float(data.get('loan_amount', 0))
        credit_score = float(data.get('credit_score', 0))
        employment_years = float(data.get('employment_years', 0))
        existing_loans = float(data.get('existing_loans', 0))
        
        # Matrix format matches train_model features:
        # ['age', 'income', 'loan_amount', 'credit_score', 'employment_years', 'existing_loans']
        features = np.array([[age, income, loan_amount, credit_score, employment_years, existing_loans]])
        
        # Predict probability and class using Scikit-Learn RandomForestClassifier
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        
        # Target: 0 = Low Risk, 1 = High Risk
        risk_class = int(prediction)
        confidence = probabilities[risk_class] * 100
        
        # Check condition for response
        if risk_class == 0:
            result = "Low Risk"
            message = "Loan can be approved safely."
        else:
            result = "High Risk"
            message = "Consider reducing loan amount."
            
        return jsonify({
            "result": result,
            "confidence": f"{confidence:.0f}%",
            "message": message
        })
        
    except Exception as e:
        # Include error handling with try/except
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)