from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from faker import Faker

from notes.models import Note
from notes.utils import get_embedding_model


class Command(BaseCommand):
    help = "Generate fake notes with embeddings for pgvector benchmarking"

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=50000,
            help="Number of notes to generate (10,000-50,000)",
        )
        parser.add_argument("--username", type=str, default="benchmark")
        parser.add_argument("--password", type=str, default="benchmark123")
        parser.add_argument("--batch-size", type=int, default=500)
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete existing notes for this user before generating",
        )

    def handle(self, *args, **options):
        count = options["count"]
        if count < 10000 or count > 50000:
            self.stderr.write(
                self.style.WARNING(
                    f"Count {count} is outside 10,000-50,000; clamping to range."
                )
            )
            count = max(10000, min(50000, count))

        username = options["username"]
        password = options["password"]
        batch_size = options["batch_size"]
        fake = Faker()

        user, created = User.objects.get_or_create(
            username=username,
            defaults={"email": f"{username}@example.com"},
        )
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(
                self.style.SUCCESS(
                    f"Created user '{username}' (password: {password})"
                )
            )
        else:
            self.stdout.write(f"Using existing user '{username}'")

        if options["clear"]:
            deleted, _ = Note.objects.filter(user=user).delete()
            self.stdout.write(f"Cleared {deleted} existing notes for '{username}'")

        model = get_embedding_model()
        self.stdout.write(f"Generating {count:,} notes in batches of {batch_size}...")

        created_total = 0
        while created_total < count:
            current_batch = min(batch_size, count - created_total)
            titles = [fake.sentence(nb_words=4)[:100] for _ in range(current_batch)]
            bodies = [fake.paragraph(nb_sentences=5) for _ in range(current_batch)]
            texts = [f"{title} {body}" for title, body in zip(titles, bodies)]

            vectors = [vector.tolist() for vector in model.encode(texts)]
            notes = [
                Note(
                    user=user,
                    title=title,
                    markdown=body,
                    embedding=vector,
                )
                for title, body, vector in zip(titles, bodies, vectors)
            ]
            Note.objects.bulk_create(notes, batch_size=batch_size)
            created_total += current_batch
            self.stdout.write(f"  {created_total:,}/{count:,} notes inserted")

        total = Note.objects.filter(user=user, embedding__isnull=False).count()
        self.stdout.write(
            self.style.SUCCESS(
                f"Done. {total:,} notes with embeddings ready for '{username}'."
            )
        )
