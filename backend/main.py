from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
import jwt
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import os
import joblib
import numpy as np
import shap
from fastapi.middleware.cors import CORSMiddleware
import ocr_service
import pdf_service
import google.generativeai as genai
from dotenv import load_dotenv

# Try to load environment variables (for Gemini API Key)
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

# Import our custom database configurations and models
import models
from database import engine, get_db

# 1. Initialize Database Tables
# This command looks at models.py and automatically creates the 'users' table in MySQL if it doesn't exist.
models.Base.metadata.create_all(bind=engine)

# 2. Setup FastAPI Application Instance
app = FastAPI(title="Multi-Disease Prediction Backend API")

# Enable CORS so the React frontend can communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with the specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Setup Password Hashing and JWT Configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "super-secret-key-for-med-core-os"  # In production, use os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- Request Data Models (Pydantic Schemas) ---
class UserCreateRequest(BaseModel):
    first_name: str
    last_name: str
    gender: str
    email: EmailStr
    password: str

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

# Schema for Diabetes Prediction Input
class DiabetesInput(BaseModel):
    pregnancies: float
    glucose: float
    blood_pressure: float
    skin_thickness: float
    insulin: float
    bmi: float
    diabetes_pedigree_function: float
    age: float

# Schema for Heart Disease Prediction Input
class HeartInput(BaseModel):
    age: float
    sex: float
    cp: float
    trestbps: float
    chol: float
    fbs: float
    restecg: float
    thalach: float
    exang: float
    oldpeak: float
    slope: float
    ca: float
    thal: float

# Schema for Kidney Disease Prediction Input
class KidneyInput(BaseModel):
    bp: float
    sg: float
    al: float
    su: float
    rbc: float

# Schema for Parkinsons Prediction Input
class ParkinsonsInput(BaseModel):
    mdvp_fo: float
    mdvp_fhi: float
    mdvp_flo: float
    mdvp_jitter_percent: float
    mdvp_jitter_abs: float

# Schema for PDF Generation
class PDFRequest(BaseModel):
    disease: str
    risk_percentage: float
    risk_category: str
    important_factors: List[Dict[str, Any]] = []
    vitals: Dict[str, Any] = {}
    advice: str

# Schema for AI Chatbot
class ChatMessage(BaseModel):
    message: str

# --- ML Model Loading ---
# We load the models once when the server starts to keep predictions fast
# Using absolute or reliable relative paths (assuming backend/ is next to models/)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")

try:
    diabetes_model = joblib.load(os.path.join(MODELS_DIR, "diabetes_model.joblib"))
    diabetes_scaler = joblib.load(os.path.join(MODELS_DIR, "diabetes_scaler.joblib"))
    diabetes_explainer = shap.TreeExplainer(diabetes_model)
    print("✅ Diabetes Model loaded successfully.")
except Exception as e:
    print(f"⚠️ Warning: Could not load Diabetes models. Error: {e}")
    diabetes_model = None; diabetes_scaler = None; diabetes_explainer = None

try:
    heart_model = joblib.load(os.path.join(MODELS_DIR, "heart_disease_model.joblib"))
    heart_scaler = joblib.load(os.path.join(MODELS_DIR, "heart_disease_scaler.joblib"))
    heart_explainer = shap.TreeExplainer(heart_model)
    print("✅ Heart Model loaded successfully.")
except Exception as e:
    print(f"⚠️ Warning: Could not load Heart models. Error: {e}")
    heart_model = None; heart_scaler = None; heart_explainer = None

try:
    kidney_model = joblib.load(os.path.join(MODELS_DIR, "kidney_disease_model.joblib"))
    kidney_scaler = joblib.load(os.path.join(MODELS_DIR, "kidney_disease_scaler.joblib"))
    kidney_explainer = shap.TreeExplainer(kidney_model)
    print("✅ Kidney Model loaded successfully.")
except Exception as e:
    print(f"⚠️ Warning: Could not load Kidney models. Error: {e}")
    kidney_model = None; kidney_scaler = None; kidney_explainer = None

try:
    parkinsons_model = joblib.load(os.path.join(MODELS_DIR, "parkinsons_model.joblib"))
    parkinsons_scaler = joblib.load(os.path.join(MODELS_DIR, "parkinsons_scaler.joblib"))
    parkinsons_explainer = shap.TreeExplainer(parkinsons_model)
    print("✅ Parkinsons Model loaded successfully.")
except Exception as e:
    print(f"⚠️ Warning: Could not load Parkinsons models. Error: {e}")
    parkinsons_model = None; parkinsons_scaler = None; parkinsons_explainer = None

# --- Endpoints / Routing ---

@app.post("/signup")
def signup_user(user: UserCreateRequest, db: Session = Depends(get_db)):
    """
    Signup Endpoint:
    Receives JSON with email and password.
    Saves a new hashed user to the MySQL database.
    """
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")
        
    hashed_pwd = pwd_context.hash(user.password)
    
    new_db_user = models.User(
        first_name=user.first_name,
        last_name=user.last_name,
        gender=user.gender,
        email=user.email,
        hashed_password=hashed_pwd
    )
    
    db.add(new_db_user)
    db.commit()
    db.refresh(new_db_user)
    
    return {"message": "User created successfully", "user_id": new_db_user.id}


@app.post("/login")
def login_user(user: UserLoginRequest, db: Session = Depends(get_db)):
    """
    Login Endpoint:
    Receives JSON with email and password.
    Verifies credentials and returns a JWT token.
    """
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    
    if not db_user or not pwd_context.verify(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
        
    # Generate JWT token
    access_token = create_access_token(data={"sub": db_user.email, "user_id": db_user.id})
    
    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "first_name": db_user.first_name,
        "last_name": db_user.last_name,
        "gender": db_user.gender,
        "email": db_user.email
    }

# --- Generic Prediction Helper ---
def make_prediction(model, scaler, explainer, feature_array, feature_names, disease_name):
    """
    Modular helper function to scale inputs, generate predictions,
    calculate SHAP values, and return the standard JSON payload.
    """
    if not model or not scaler:
        raise HTTPException(status_code=500, detail=f"{disease_name} models are not loaded on the server.")
        
    scaled_data = scaler.transform(feature_array)
    probabilities = model.predict_proba(scaled_data)[0]
    risk_percentage = float(probabilities[1] * 100)
    
    if risk_percentage < 30: risk_category = "Low"
    elif risk_percentage < 50: risk_category = "Moderate"
    elif risk_percentage < 75: risk_category = "High"
    else: risk_category = "Critical"
    
    important_factors = []
    if explainer:
        try:
            shap_values = explainer.shap_values(scaled_data)
            if isinstance(shap_values, list): instance_shap = shap_values[1][0]
            elif hasattr(shap_values, "values"): instance_shap = shap_values.values[0, :, 1] if len(shap_values.values.shape) == 3 else shap_values.values[0]
            else: instance_shap = shap_values[1][0] if len(np.array(shap_values).shape) == 3 else np.array(shap_values)[0]

            feature_contributions = list(zip(feature_names, instance_shap))
            feature_contributions.sort(key=lambda x: abs(x[1]), reverse=True)
            for name, val in feature_contributions[:3]:
                important_factors.append({
                    "feature": name,
                    "impact": "Increased Risk" if val > 0 else "Decreased Risk",
                    "score": round(float(abs(val)), 3)
                })
        except Exception as e: print(f"SHAP Error: {e}")

    return {
        "disease": disease_name,
        "risk_percentage": round(risk_percentage, 2),
        "risk_category": risk_category,
        "important_factors": important_factors,
        "advice": "Please consult with a healthcare professional for an accurate diagnosis."
    }

@app.post("/predict/diabetes")
def predict_diabetes(data: DiabetesInput):
    input_data = np.array([[data.pregnancies, data.glucose, data.blood_pressure, data.skin_thickness, data.insulin, data.bmi, data.diabetes_pedigree_function, data.age]])
    features = ["Pregnancies", "Glucose", "Blood Pressure", "Skin Thickness", "Insulin", "BMI", "Pedigree Function", "Age"]
    return make_prediction(diabetes_model, diabetes_scaler, diabetes_explainer, input_data, features, "Diabetes")

@app.post("/predict/heart")
def predict_heart(data: HeartInput):
    input_data = np.array([[data.age, data.sex, data.cp, data.trestbps, data.chol, data.fbs, data.restecg, data.thalach, data.exang, data.oldpeak, data.slope, data.ca, data.thal]])
    features = ["Age", "Sex", "Chest Pain Type", "Resting BP", "Cholesterol", "Fasting Blood Sugar", "Resting ECG", "Max Heart Rate", "Exercise Angina", "Oldpeak", "Slope", "Vessels Colored", "Thalassemia"]
    return make_prediction(heart_model, heart_scaler, heart_explainer, input_data, features, "Heart Disease")

@app.post("/predict/kidney")
def predict_kidney(data: KidneyInput):
    input_data = np.array([[data.bp, data.sg, data.al, data.su, data.rbc]])
    features = ["Blood Pressure", "Specific Gravity", "Albumin", "Sugar", "Red Blood Cells"]
    return make_prediction(kidney_model, kidney_scaler, kidney_explainer, input_data, features, "Kidney Disease")

@app.post("/predict/parkinsons")
def predict_parkinsons(data: ParkinsonsInput):
    input_data = np.array([[data.mdvp_fo, data.mdvp_fhi, data.mdvp_flo, data.mdvp_jitter_percent, data.mdvp_jitter_abs]])
    features = ["MDVP:Fo(Hz)", "MDVP:Fhi(Hz)", "MDVP:Flo(Hz)", "MDVP:Jitter(%)", "MDVP:Jitter(Abs)"]
    return make_prediction(parkinsons_model, parkinsons_scaler, parkinsons_explainer, input_data, features, "Parkinson's Disease")
@app.post("/upload/report")
async def upload_medical_report(file: UploadFile = File(...)):
    """
    OCR Endpoint:
    Accepts a medical report file (PDF or Image).
    Extracts text using OCR and parses it for relevant medical features.
    """
    try:
        # Read file securely
        content = await file.read()
        
        # Pass to our modular OCR service
        raw_text = ocr_service.extract_text_from_file(content, file.filename)
        
        if not raw_text:
            raise HTTPException(status_code=400, detail="Could not extract text from the file.")
            
        # Parse the text for known features
        extracted_data = ocr_service.parse_diabetes_features(raw_text)
        
        return {
            "message": "Report processed successfully",
            "extracted_data": extracted_data
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

@app.post("/download/report")
def download_pdf_report(data: PDFRequest):
    """
    Takes the JSON prediction results and patient vitals,
    generates a professional PDF, and streams it back as a downloadable file.
    """
    try:
        pdf_buffer = pdf_service.generate_medical_report(data.dict())
        return StreamingResponse(
            pdf_buffer, 
            media_type="application/pdf", 
            headers={"Content-Disposition": f"attachment; filename={data.disease.replace(' ', '_')}_Report.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")

@app.post("/chat")
async def chat_with_ai(request: dict):
    try:
        print("\n--- CHAT API HIT ---")
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print("❌ ERROR: API Key missing in backend!")
            from fastapi import HTTPException
            raise HTTPException(status_code=500, detail="API Key Missing")
        
        from google import genai
        client = genai.Client(api_key=api_key)
        
        user_message = request.get("message", "Hello")
        print(f"User asking: {user_message}")
        
        response = client.models.generate_content(
            model='gemini-3.5-flash', 
            contents=f"System: You are a healthcare AI assistant. Provide general health information only. Do not diagnose or prescribe. Keep answers under 3 sentences.\nUser: {user_message}"
        )
        
        # AI-oda exact reply-a variable-la save pandrom
        ai_reply = response.text
        print(f"✅ Gemini Reply Success! AI Says: {ai_reply}")
        
        # React 'reply', 'response', 'answer' ethu thedunalum kedaikura mathiri anuppurom
        return {
            "reply": ai_reply,
            "response": ai_reply,
            "answer": ai_reply
        }
        
    except Exception as e:
        import traceback
        print("\n================ ERROR IN CHATBOT ================")
        traceback.print_exc()
        print("==================================================\n")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))