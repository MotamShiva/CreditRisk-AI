# AI Credit Risk Prediction Website 🏦

**CreditRisk AI** is a full-stack web application that uses artificial intelligence to evaluate a person's loan application and predict their credit risk. The system analyzes financial factors like income, loan amount, credit score, and employment history to determine if a user is a **Low Risk** or **High Risk** borrower.

### 🌟 How it works (The Tech Stack)
* **Frontend (User Interface):** Built purely with HTML, CSS, and JavaScript, featuring a sleek, responsive dark-mode design. It provides an intuitive form for users to enter their details, a dynamic results page displaying the AI's confidence score, and a history page that saves past predictions locally.
* **Backend (Server & API):** Powered by Python and Flask, the backend processes the incoming data from the website and passes it to the ML model.
* **Machine Learning Model:** Uses a robust Scikit-Learn `RandomForestClassifier` trained on financial data. It takes the user's inputs, runs them through the algorithm, and instantly returns a prediction along with a confidence percentage.
## 🖥️ Tech Stack
* **Frontend:** HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript
* **Backend:** Python 3.9, Flask, Flask-CORS
* **AI Model:** Scikit-Learn RandomForestClassifier, Numpy, Pandas
* **Persistence:** Pickled ML Model, Browser LocalStorage for Prediction History

## ▶️ How To Run

**Step 1:** Install backend dependencies. Make sure you are using Python 3.9.6 or later.
```bash
pip3 install -r requirements.txt
```

**Step 2:** Generate the synthetic dataset and train the Machine Learning model. This will output a `model.pkl` in the `backend` folder.
```bash
python3 backend/train_model.py
```

**Step 3:** Start the Flask local development server. The server will launch at `http://localhost:5001`.
```bash
python3 backend/app.py
```

**Step 4:** Open the frontend in any modern browser. Double-click the file to open it.
```bash
open frontend/index.html
```

**Step 5:** Fill out the form in the **Predict** section and submit. 

**Step 6:** Read the results, and go to **View History** (or the History Navbar link) to visually browse your saved entries. Note that the History is fully editable and searchable!


## 📁 Project Layout
```
credit-risk-website/
├── frontend/
│   ├── index.html       → Home + Portfolio page
│   ├── predict.html     → User input form page
│   ├── result.html      → Prediction result page
│   ├── history.html     → User history page
│   ├── style.css        → All CSS (modern responsive UI)
│   └── script.js        → Form logic + fetch API + history logic
├── backend/
│   ├── app.py           → Flask server + /predict route
│   ├── train_model.py   → Train + save model as model.pkl
│   └── model.pkl        → Auto-generated after training
├── requirements.txt     → Data science and server dependencies
└── README.md            → Run instructions
```
