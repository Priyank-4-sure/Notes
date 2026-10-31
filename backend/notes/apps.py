import os
import threading
from django.apps import AppConfig


class NotesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notes'

    def ready(self):
        import notes.signals
        # Pre-warm embedding model in background thread to eliminate first-request latency
        threading.Thread(target=self._warmup_model, daemon=True).start()

    def _warmup_model(self):
        try:
            from .utils import get_embedding_model
            model = get_embedding_model()
            # Perform a micro-encoding to load ONNX weights into RAM
            model.encode("warmup")
            print(" Embedding model warmed up successfully.")
        except Exception as e:
            print(f"Embedding model warmup notice: {e}")
