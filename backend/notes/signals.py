from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Note
from sentence_transformers import SentenceTransformer

# Load the model once
model = SentenceTransformer('all-MiniLM-L6-v2')

@receiver(post_save, sender=Note)
def update_note_embedding(sender, instance, **kwargs):
    # This runs every time a note is Created OR Updated
    combined_text = f"{instance.title} {instance.title} {instance.markdown}"

    # Generate the fresh vector
    new_embedding = model.encode(combined_text).tolist()

    # Use .update() so we don't trigger this post_save signal again!
    Note.objects.filter(pk=instance.pk).update(embedding=new_embedding)