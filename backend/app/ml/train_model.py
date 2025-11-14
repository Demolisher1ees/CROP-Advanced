import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os


def generate_sample_data(n_samples=1000):
    """Generate sample crop data for training"""
    np.random.seed(42)
    
    data = {
        'temperature': np.random.uniform(15, 40, n_samples),
        'humidity': np.random.uniform(30, 90, n_samples),
        'ph': np.random.uniform(4, 9, n_samples),
        'rainfall': np.random.uniform(50, 300, n_samples),
        'nitrogen': np.random.uniform(10, 80, n_samples),
        'phosphorus': np.random.uniform(10, 80, n_samples),
        'potassium': np.random.uniform(10, 80, n_samples),
    }
    
    df = pd.DataFrame(data)
    
    # Simple rule-based crop assignment
    crops = []
    for _, row in df.iterrows():
        if row['temperature'] > 30 and row['humidity'] > 60:
            crops.append('Rice')
        elif row['temperature'] < 25 and row['humidity'] < 60:
            crops.append('Wheat')
        elif row['temperature'] > 28 and row['ph'] > 6:
            crops.append('Cotton')
        else:
            crops.append('Sugarcane')
    
    df['crop'] = crops
    return df


def train_crop_model():
    """Train a crop prediction model"""
    print("Generating training data...")
    df = generate_sample_data(1000)
    
    X = df.drop('crop', axis=1)
    y = df['crop']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print("Training model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model accuracy: {accuracy:.2f}")
    
    # Save model
    model_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'crop_model.joblib')
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")
    
    return model, accuracy


if __name__ == "__main__":
    train_crop_model()
