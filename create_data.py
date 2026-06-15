import pandas as pd
import numpy as np
import os

# Create 'data' folder automatically
os.makedirs('data', exist_ok=True)

# 1. Diabetes Data (Target is 'Outcome')
diabetes = pd.DataFrame(np.random.randint(0, 100, size=(100, 8)), columns=['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age'])
diabetes['Outcome'] = np.random.randint(0, 2, size=100)
diabetes.to_csv('data/diabetes.csv', index=False)

# 2. Heart Disease Data (Target is 'target')
heart = pd.DataFrame(np.random.randint(0, 100, size=(100, 13)), columns=['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'])
heart['target'] = np.random.randint(0, 2, size=100)
heart.to_csv('data/heart.csv', index=False)

# 3. Kidney Disease Data (Target is 'classification')
kidney = pd.DataFrame(np.random.randint(0, 100, size=(100, 5)), columns=['bp', 'sg', 'al', 'su', 'rbc'])
kidney['classification'] = np.random.randint(0, 2, size=100)
kidney.to_csv('data/kidney.csv', index=False)

# 4. Parkinson's Data (Target is 'status')
parkinsons = pd.DataFrame(np.random.rand(100, 5) * 100, columns=['MDVP:Fo(Hz)', 'MDVP:Fhi(Hz)', 'MDVP:Flo(Hz)', 'MDVP:Jitter(%)', 'MDVP:Jitter(Abs)'])
parkinsons['status'] = np.random.randint(0, 2, size=100)
parkinsons.to_csv('data/parkinsons.csv', index=False)

print("✅ All 4 Dummy Datasets created successfully in the 'data' folder!")