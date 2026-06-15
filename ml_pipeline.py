import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.impute import SimpleImputer

class DiseaseModelTrainer:
    """
    A modular class to train, evaluate, and save machine learning models for disease prediction.
    It includes automated data preprocessing, model training using RandomForest, and evaluation.
    This class is designed to be easily integrated into a FastAPI backend later.
    """
    
    def __init__(self, models_dir: str = "models"):
        """
        Initializes the trainer and ensures the models directory exists.
        
        Args:
            models_dir (str): Directory where the trained models and scalers will be saved.
        """
        self.models_dir = models_dir
        # Create models directory if it doesn't exist
        os.makedirs(self.models_dir, exist_ok=True)
        
    def preprocess_data(self, df: pd.DataFrame, target_column: str, columns_with_zeros_as_missing: list = None):
        """
        Preprocesses the dataset: handles missing values (zeros) and splits features/target.
        
        Args:
            df (pd.DataFrame): The raw dataset.
            target_column (str): The name of the target variable column.
            columns_with_zeros_as_missing (list): List of columns where '0' means missing data (e.g., Glucose).
            
        Returns:
            X (pd.DataFrame): Features.
            y (pd.Series): Target.
        """
        # Create a copy to avoid SettingWithCopyWarning
        data = df.copy()
        
        # 1. Handle Missing Values represented as 0
        # In datasets like Diabetes, biological metrics (e.g., BMI, Glucose) cannot realistically be 0.
        if columns_with_zeros_as_missing:
            # Replace 0 with NaN for these specific columns
            data[columns_with_zeros_as_missing] = data[columns_with_zeros_as_missing].replace(0, np.nan)
            
            # Impute missing values (NaNs) with the median of the respective columns
            # Median is robust to outliers compared to mean.
            imputer = SimpleImputer(strategy='median')
            data[columns_with_zeros_as_missing] = imputer.fit_transform(data[columns_with_zeros_as_missing])
            
        # 2. Separate features (X) and target (y)
        if target_column not in data.columns:
            raise ValueError(f"Target column '{target_column}' not found in dataset.")
            
        X = data.drop(columns=[target_column])
        y = data[target_column]
        
        return X, y

    def train_and_evaluate(self, data_path: str, disease_name: str, target_column: str, 
                           columns_with_zeros_as_missing: list = None, test_size: float = 0.2, random_state: int = 42):
        """
        Executes the full pipeline for a given disease: 
        loads data, preprocesses, scales, trains, evaluates, and saves artifacts.
        
        Args:
            data_path (str): Path to the CSV dataset.
            disease_name (str): Identifier for the disease (used for naming saved files).
            target_column (str): The column name to predict.
            columns_with_zeros_as_missing (list, optional): Columns where 0 indicates missing data.
            test_size (float): Proportion of the dataset to include in the test split.
            random_state (int): Seed for reproducibility.
            
        Returns:
            None
        """
        print(f"\n{'='*50}")
        print(f"Starting pipeline for: {disease_name.upper()}")
        print(f"{'='*50}")
        
        try:
            # 1. Load Data
            if not os.path.exists(data_path):
                print(f"⚠️ Warning: Dataset not found at {data_path}. Please check the file path.")
                return
                
            df = pd.read_csv(data_path)
            print(f"✅ Data loaded successfully. Shape: {df.shape}")
            
            # 2. Preprocess Data
            X, y = self.preprocess_data(df, target_column, columns_with_zeros_as_missing)
            print("✅ Data preprocessing complete (handled missing values).")
            
            # 3. Train-Test Split
            # Stratify ensures the class distribution is maintained in the train/test splits
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=random_state, stratify=y
            )
            
            # 4. Feature Scaling
            # We fit the scaler ONLY on training data to prevent data leakage into the test set
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            # Convert back to DataFrame to keep feature names for SHAP explainability later
            X_train_scaled = pd.DataFrame(X_train_scaled, columns=X_train.columns)
            X_test_scaled = pd.DataFrame(X_test_scaled, columns=X_test.columns)
            print("✅ Feature scaling applied (StandardScaler).")
            
            # 5. Model Training
            # RandomForest is robust, handles non-linear relationships well, and is great for SHAP
            model = RandomForestClassifier(n_estimators=100, random_state=random_state, n_jobs=-1)
            model.fit(X_train_scaled, y_train)
            print("✅ Model training complete (RandomForestClassifier).")
            
            # 6. Evaluation
            y_pred = model.predict(X_test_scaled)
            acc = accuracy_score(y_test, y_pred)
            
            print(f"\n📊 Evaluation Results for {disease_name}:")
            print(f"Accuracy: {acc * 100:.2f}%\n")
            print("Classification Report:")
            print(classification_report(y_test, y_pred))
            
            # 7. Automated Export
            model_filepath = os.path.join(self.models_dir, f"{disease_name}_model.joblib")
            scaler_filepath = os.path.join(self.models_dir, f"{disease_name}_scaler.joblib")
            
            joblib.dump(model, model_filepath)
            joblib.dump(scaler, scaler_filepath)
            
            print(f"💾 Saved model to: {model_filepath}")
            print(f"💾 Saved scaler to: {scaler_filepath}")
            
        except Exception as e:
            print(f"❌ Error occurred while processing {disease_name}: {e}")

# ==========================================
# Execution Example
# ==========================================
if __name__ == "__main__":
    # Initialize the trainer (this will automatically create the 'models' directory)
    trainer = DiseaseModelTrainer(models_dir="models")
    
    # Define the datasets and their specific configurations
    # Note: Replace 'data/...' with your actual dataset paths before running.
    # The 'columns_with_zeros_as_missing' list is crucial for datasets like Diabetes
    # where features like Glucose=0 are biologically invalid.
    
    pipeline_configs = [
        {
            "disease_name": "diabetes",
            "data_path": "data/diabetes.csv",
            "target_column": "Outcome",
            "columns_with_zeros_as_missing": ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]
        },
        {
            "disease_name": "heart_disease",
            "data_path": "data/heart.csv",
            "target_column": "target",
            # Typically 0 is a valid value for many features here, adjust if needed
            "columns_with_zeros_as_missing": [] 
        },
        {
            "disease_name": "kidney_disease",
            "data_path": "data/kidney_disease.csv",
            "target_column": "classification",
            "columns_with_zeros_as_missing": []
        },
        {
            "disease_name": "parkinsons",
            "data_path": "data/parkinsons.csv",
            "target_column": "status",
            "columns_with_zeros_as_missing": []
        }
    ]
    
    # Run the pipeline sequentially for all configured diseases
    for config in pipeline_configs:
        trainer.train_and_evaluate(
            disease_name=config["disease_name"],
            data_path=config["data_path"],
            target_column=config["target_column"],
            columns_with_zeros_as_missing=config.get("columns_with_zeros_as_missing", [])
        )
