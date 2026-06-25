from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Note
from .utils import get_embedding_model

@receiver(post_save, sender=Note)
def update_note_embedding(sender, instance, **kwargs):
    model = get_embedding_model() # Lazy load
    text = f"{instance.title} {instance.title} {instance.markdown}"
    new_embedding = model.encode(text).tolist()
    Note.objects.filter(pk=instance.pk).update(embedding=new_embedding)
