import time

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db import connection
from pgvector.django import CosineDistance

from notes.models import Note
from notes.utils import get_embedding_model

INDEX_NAME = "note_embedding_hnsw_idx"


class Command(BaseCommand):
    help = "Benchmark pgvector semantic search with and without an HNSW index"

    def add_arguments(self, parser):
        parser.add_argument("--username", type=str, default="benchmark")
        parser.add_argument(
            "--query",
            type=str,
            default="project deadline meeting notes",
        )
        parser.add_argument(
            "--runs",
            type=int,
            default=5,
            help="Timed runs per configuration (after warmup)",
        )
        parser.add_argument("--limit", type=int, default=5)

    def _index_exists(self):
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT 1 FROM pg_indexes
                WHERE indexname = %s
                """,
                [INDEX_NAME],
            )
            return cursor.fetchone() is not None

    def _drop_index(self):
        with connection.cursor() as cursor:
            cursor.execute(f"DROP INDEX IF EXISTS {INDEX_NAME}")

    def _create_index(self):
        with connection.cursor() as cursor:
            cursor.execute(
                f"""
                CREATE INDEX {INDEX_NAME} ON notes_note
                USING hnsw (embedding vector_cosine_ops)
                WITH (m = 16, ef_construction = 64)
                """
            )

    def _run_search(self, user, query_vector, limit):
        start_time = time.time()
        list(
            Note.objects.filter(user=user)
            .exclude(embedding__isnull=True)
            .annotate(distance=CosineDistance("embedding", query_vector))
            .order_by("distance")[:limit]
        )
        end_time = time.time()
        return (end_time - start_time) * 1000

    def _benchmark(self, label, user, query_vector, runs, limit):
        # Warmup run (not timed)
        self._run_search(user, query_vector, limit)

        timings = [
            self._run_search(user, query_vector, limit) for _ in range(runs)
        ]
        avg_ms = sum(timings) / len(timings)
        self.stdout.write(f"\n{label}")
        self.stdout.write(f"  Runs: {runs}")
        self.stdout.write(f"  Timings (ms): {[round(t, 2) for t in timings]}")
        self.stdout.write(f"  Average: {avg_ms:.2f} ms")
        return avg_ms

    def handle(self, *args, **options):
        username = options["username"]
        query = options["query"]
        runs = options["runs"]
        limit = options["limit"]

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            self.stderr.write(
                self.style.ERROR(
                    f"User '{username}' not found. "
                    "Run: python manage.py generate_fake_notes"
                )
            )
            return

        note_count = Note.objects.filter(
            user=user, embedding__isnull=False
        ).count()
        if note_count == 0:
            self.stderr.write(
                self.style.ERROR(
                    f"No embedded notes for '{username}'. "
                    "Run: python manage.py generate_fake_notes"
                )
            )
            return

        model = get_embedding_model()
        query_vector = model.encode(query).tolist()

        self.stdout.write("=" * 60)
        self.stdout.write("pgvector Semantic Search Benchmark")
        self.stdout.write("=" * 60)
        self.stdout.write(f"User: {username}")
        self.stdout.write(f"Records: {note_count:,}")
        self.stdout.write(f"Query: {query!r}")
        self.stdout.write(f"Top-K: {limit}")

        had_index = self._index_exists()
        if had_index:
            self.stdout.write(f"\nDropping existing index '{INDEX_NAME}' for baseline...")
            self._drop_index()

        without_index_ms = self._benchmark(
            "WITHOUT index (sequential scan)",
            user,
            query_vector,
            runs,
            limit,
        )

        self.stdout.write(f"\nCreating HNSW index '{INDEX_NAME}'...")
        index_start = time.time()
        self._create_index()
        index_build_s = time.time() - index_start
        self.stdout.write(f"  Index build time: {index_build_s:.2f} s")

        with_index_ms = self._benchmark(
            "WITH HNSW index",
            user,
            query_vector,
            runs,
            limit,
        )

        if without_index_ms > 0:
            reduction = ((without_index_ms - with_index_ms) / without_index_ms) * 100
        else:
            reduction = 0

        self.stdout.write("\n" + "=" * 60)
        self.stdout.write("SUMMARY")
        self.stdout.write("=" * 60)
        self.stdout.write(f"Records searched: {note_count:,}")
        self.stdout.write(f"Without index:    {without_index_ms:.2f} ms (avg)")
        self.stdout.write(f"With HNSW index:  {with_index_ms:.2f} ms (avg)")
        self.stdout.write(f"Latency reduction: {reduction:.1f}%")
        self.stdout.write(
            f"\nResume line:\n"
            f'  "Reduced search latency by {reduction:.0f}% to achieve '
            f"sub-{int(with_index_ms + 9)}ms response times across "
            f'{note_count:,}+ records by implementing HNSW indexing."'
        )
