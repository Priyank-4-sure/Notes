from django.core.management.base import BaseCommand
from notes.models import Note

class Command(BaseCommand):
    help = 'Recompute all note embeddings'

    def handle(self, *args, **options):
        notes = Note.objects.all()
        count = notes.count()
        self.stdout.write(f"Recomputing embeddings for {count} notes...")
        for i, note in enumerate(notes, start=1):
            note.save()  # Triggers post_save to compute embedding using FastEmbed
            if i % 10 == 0 or i == count:
                self.stdout.write(f"Progress: {i}/{count} notes processed")
        self.stdout.write(self.style.SUCCESS("Successfully recomputed all embeddings."))
