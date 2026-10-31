from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Note
from .utils import get_embedding_model


@receiver(post_save, sender=Note)
def update_note_embedding(sender, instance, **kwargs):
    # If embedding is already set (e.g. from perform_create or perform_update), skip duplicate computation
    if instance.embedding is not None and len(instance.embedding) > 0:
        return

    model = get_embedding_model()
    text = f"{instance.title} {instance.markdown}"
    new_embedding = model.encode(text).tolist()
    Note.objects.filter(pk=instance.pk).update(embedding=new_embedding)
