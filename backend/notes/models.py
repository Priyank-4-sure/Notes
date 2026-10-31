from django.contrib.auth.models import User
from django.db import models
from pgvector.django import HnswIndex, VectorField


class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    markdown = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    pinned = models.BooleanField(default=False)
    embedding = VectorField(dimensions=384, null=True, blank=True)

    class Meta:
        ordering = ['-pinned', '-updated_at']
        indexes = [
            HnswIndex(
                name="note_embedding_hnsw_idx",
                fields=["embedding"],
                m=16,
                ef_construction=64,
                opclasses=["vector_cosine_ops"],
            ),
            models.Index(
                name="note_user_pinned_idx",
                fields=["user", "-pinned", "-updated_at"],
            ),
        ]