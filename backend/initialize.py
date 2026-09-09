import os

def initialize_models():
    # Check if models exist, if not, generate data and train
    model_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
    if not os.path.exists(model_dir) or not os.listdir(model_dir):
        print("Models not found. Initializing data and training models...")
        import sys
        sys.path.append(os.path.dirname(os.path.abspath(__file__))) # add ml dir
        sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")) # add backend dir
        
        from dataset.generate_data import generate_synthetic_data
        from ml.train import train_models
        
        generate_synthetic_data(1000)
        train_models()
        print("Model initialization complete.")
    else:
        print("Models already exist.")

if __name__ == "__main__":
    initialize_models()
