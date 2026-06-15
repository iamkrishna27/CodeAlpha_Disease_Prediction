import pytesseract
import pdfplumber
import re
from PIL import Image
import io

def extract_text_from_file(file_content: bytes, filename: str) -> str:
    """
    Extracts raw text from either a PDF or an Image file.
    """
    text = ""
    # Process PDF documents
    if filename.lower().endswith('.pdf'):
        try:
            with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                for page in pdf.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
        except Exception as e:
            print(f"Error reading PDF: {e}")
            
    # Process Image documents (png, jpg, jpeg, etc.)
    elif filename.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp')):
        try:
            image = Image.open(io.BytesIO(file_content))
            # Note: pytesseract requires Tesseract OCR engine to be installed on the host system
            text = pytesseract.image_to_string(image)
        except Exception as e:
            print(f"Error reading Image: {e}")
            
    return text

def parse_diabetes_features(text: str) -> dict:
    """
    Uses straightforward regex string matching to find biological markers in the raw text.
    Returns a dictionary of found features.
    """
    extracted_data = {}
    
    # Convert text to lower case to make matching case-insensitive and simpler
    text_lower = text.lower()
    
    # 1. Extract Glucose (Look for the word "glucose" followed by optional punctuation and a number)
    # Example matches: "Glucose: 125 mg/dL", "Fasting Glucose 100"
    glucose_match = re.search(r'glucose[\s:.-]*(\d+(?:\.\d+)?)', text_lower)
    if glucose_match:
        extracted_data['glucose'] = float(glucose_match.group(1))
        
    # 2. Extract Blood Pressure
    bp_match = re.search(r'blood\s*pressure[\s:.-]*(\d+(?:\.\d+)?)', text_lower)
    if bp_match:
        extracted_data['blood_pressure'] = float(bp_match.group(1))
        
    # 3. Extract BMI
    bmi_match = re.search(r'bmi[\s:.-]*(\d+(?:\.\d+)?)', text_lower)
    if bmi_match:
        extracted_data['bmi'] = float(bmi_match.group(1))
        
    # 4. Extract Insulin
    insulin_match = re.search(r'insulin[\s:.-]*(\d+(?:\.\d+)?)', text_lower)
    if insulin_match:
        extracted_data['insulin'] = float(insulin_match.group(1))
        
    # 5. Extract Skin Thickness
    skin_match = re.search(r'skin\s*thickness[\s:.-]*(\d+(?:\.\d+)?)', text_lower)
    if skin_match:
        extracted_data['skin_thickness'] = float(skin_match.group(1))
        
    # 6. Extract Age
    age_match = re.search(r'age[\s:.-]*(\d+)', text_lower)
    if age_match:
        extracted_data['age'] = float(age_match.group(1))
        
    # Note: If a feature is not found in the medical report, it won't be added to the dictionary.
    # The frontend will intelligently handle this by keeping the user's manual input for missing fields.
    
    return extracted_data
