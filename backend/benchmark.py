import os
import time
import django
from django.db import connection

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.contrib.auth.models import User
from notes.models import Note
from notes.utils import get_embedding_model
from pgvector.django import CosineDistance

def run_benchmark():
    user = User.objects.filter(username="benchmark").first()
    if not user:
        print("User 'benchmark' not found.")
        return

    print(f"Total notes in database: {Note.objects.count()}")
    print(f"Notes for user '{user.username}': {Note.objects.filter(user=user).count()}")

    # Encode a test query
    model = get_embedding_model()
    query_text = "find notes about machine learning applications and projects"
    query_vector = model.encode(query_text).tolist()

    print(f"Query vector dimensions: {len(query_vector)}")

    # We run the query multiple times to get an average response time.
    times = []
    for i in range(10):
        start = time.time()
        results = list(
            Note.objects.filter(user=user)
            .exclude(embedding__isnull=True)
            .annotate(distance=CosineDistance("embedding", query_vector))
            .order_by("distance")[:5]
        )
        elapsed = (time.time() - start) * 1000
        times.append(elapsed)
        if i == 0:
            print(f"First run (cold): {elapsed:.2f} ms")
            for idx, r in enumerate(results):
                print(f"  Result {idx+1}: Title: '{r.title}', Distance: {r.distance:.4f}")

    avg_time = sum(times[1:]) / len(times[1:]) if len(times) > 1 else times[0]
    print(f"Average response time (runs 2-10, warm): {avg_time:.2f} ms")

    # Let's inspect the execution plan using EXPLAIN ANALYZE
    query = Note.objects.filter(user=user).exclude(embedding__isnull=True).annotate(distance=CosineDistance("embedding", query_vector)).order_by("distance")[:5]
    compiler = query.query.get_compiler(using='default')
    sql, params = compiler.as_sql()
    
    print("\nRunning EXPLAIN ANALYZE on query...")
    with connection.cursor() as cursor:
        cursor.execute(f"EXPLAIN ANALYZE {sql}", params)
        plan = cursor.fetchall()
        for row in plan:
            print(row[0])

if __name__ == "__main__":
    run_benchmark()
