# Backward compatibility wrapper pointing to the modular ML inference pipeline
from ml.inference import inference_pipeline

class MLPipelineWrapper:
    def __init__(self):
        self.pipeline = inference_pipeline

    def load_models(self):
        self.pipeline.load_models()

    def predict(self, title: str, description: str):
        return self.pipeline.predict(title, description, save_to_db=False)

    @property
    def cat_model(self):
        return self.pipeline.category_model.model

    @property
    def pri_model(self):
        return self.pipeline.priority_model.model

    @property
    def rc_model(self):
        return self.pipeline.root_cause_model.model

    @property
    def vectorizer(self):
        return self.pipeline.vectorizer

ml_pipeline = MLPipelineWrapper()
