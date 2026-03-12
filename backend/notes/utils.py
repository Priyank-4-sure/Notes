from sentence_transformers import SentenceTransformer

_model = None

def get_embedding_model():
    global _model
    if _model is None:
        # This only runs the first time it's called
        _model = SentenceTransformer('paraphrase-MiniLM-L3-v2')
    return _model