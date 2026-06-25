import os
from fastembed import TextEmbedding

_model = None

class FastEmbedWrapper:
    def __init__(self, model_name="BAAI/bge-small-en-v1.5"):
        cache_dir = os.environ.get("FASTEMBED_CACHE_DIR")
        self.model = TextEmbedding(model_name=model_name, cache_dir=cache_dir)

    def encode(self, text):
        if isinstance(text, str):
            embeddings = list(self.model.embed([text]))
            return embeddings[0]
        else:
            return list(self.model.embed(text))

def get_embedding_model():
    global _model
    if _model is None:
        _model = FastEmbedWrapper()
    return _model