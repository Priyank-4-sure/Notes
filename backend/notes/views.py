import time

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework import generics, permissions
from rest_framework.throttling import UserRateThrottle
from pgvector.django import CosineDistance

from .models import Note
from .serializers import NoteSerializer
from .serializers import UserRegistrationSerializer
from .utils import get_embedding_model

class UserRegistrationView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
def test_view(request):
    return Response({"message": "Backend is working!"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def semantic_search(request):
    # Rate limiting is handled by DRF's global throttle classes
    model = get_embedding_model()
    query = request.GET.get('q', '').strip().lower()
    if not query:
        return Response([])

    # Add query length validation and sanitization
    if len(query) > 500:
        return Response({'error': 'Query must be at most 500 characters.'}, status=status.HTTP_400_BAD_REQUEST)

    query_vector = model.encode(query).tolist()

    start_time = time.time()
    notes = list(
        Note.objects.filter(user=request.user)
        .exclude(embedding__isnull=True)
        .annotate(distance=CosineDistance("embedding", query_vector))
        .order_by("distance")[:8]
    )
    end_time = time.time()
    search_ms = (end_time - start_time) * 1000
    print(f"Semantic search for '{query}' completed in {search_ms:.2f} ms")

    data = []
    for note in notes:
        serialized = NoteSerializer(note).data
        
        # 1. Non-linear dynamic contrast stretching on cosine distance
        # Raw distance typical range is 0.15 (bullseye) to 0.50 (distant)
        raw_sim = max(0.0, min(1.0, 1.0 - note.distance))
        
        if raw_sim >= 0.78:
            calibrated = 86 + (raw_sim - 0.78) / 0.22 * 13
        elif raw_sim >= 0.65:
            calibrated = 60 + (raw_sim - 0.65) / 0.13 * 25
        elif raw_sim >= 0.50:
            calibrated = 30 + (raw_sim - 0.50) / 0.15 * 29
        else:
            calibrated = max(12, raw_sim / 0.50 * 25)

        score = round(calibrated)

        # 2. Distinct Keyword Boost
        title_lower = (note.title or "").lower()
        content_lower = (note.markdown or "").lower()

        if query in title_lower:
            score = max(score, 95) + 3
        elif query in content_lower:
            score = max(score, 82) + 5
        else:
            words = [w for w in query.split() if len(w) > 2]
            title_hits = sum(1 for w in words if w in title_lower)
            body_hits = sum(1 for w in words if w in content_lower)
            if title_hits > 0:
                score += min(12, title_hits * 5)
            elif body_hits > 0:
                score += min(8, body_hits * 3)

        serialized['match_score'] = max(10, min(99, score))
        data.append(serialized)

    # Re-sort descending by calibrated match score
    data.sort(key=lambda x: x['match_score'], reverse=True)
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_photo(request):
    import os
    import uuid
    from django.conf import settings

    if 'photo' not in request.FILES:
        return Response({'error': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)

    photo = request.FILES['photo']
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'}
    ext = os.path.splitext(photo.name)[1].lower()
    if ext not in allowed_extensions:
        return Response(
            {'error': 'Unsupported file format. Supported: JPG, PNG, WebP, GIF, SVG'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # MIME type verification
    allowed_mime_types = {'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'}
    if photo.content_type not in allowed_mime_types:
        return Response(
            {'error': 'Unsupported file format. Supported: JPG, PNG, WebP, GIF, SVG'},
            status=status.HTTP_400_BAD_REQUEST
        )

    upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
    os.makedirs(upload_dir, exist_ok=True)
    safe_name = photo.name.replace(' ', '_')
    filename = f"{uuid.uuid4().hex[:10]}_{safe_name}"
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, 'wb+') as destination:
        for chunk in photo.chunks():
            destination.write(chunk)

    file_url = f"{settings.MEDIA_URL}uploads/{filename}"
    return Response({
        'url': file_url,
        'filename': photo.name,
        'size': photo.size
    }, status=status.HTTP_201_CREATED)


class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [UserRateThrottle]

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user).defer('embedding').order_by('-pinned', '-updated_at')

    def perform_create(self, serializer):
        # 1. Grab the text from the request
        title = self.request.data.get('title', '')
        markdown = self.request.data.get('markdown', '')
        combined_text = f"{title} {markdown}"

        # 2. Generate the embedding vector
        model = get_embedding_model()
        vector = model.encode(combined_text).tolist()

        # 3. Save everything together
        serializer.save(user=self.request.user, embedding=vector)


class NoteDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [UserRateThrottle]

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user).defer('embedding')

    def perform_update(self, serializer):
        title = self.request.data.get('title', serializer.instance.title)
        markdown = self.request.data.get('markdown', serializer.instance.markdown)
        combined_text = f"{title} {markdown}"
        model = get_embedding_model()
        vector = model.encode(combined_text).tolist()
        serializer.save(embedding=vector)


class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        notes_count = Note.objects.filter(user=user).count()
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "date_joined": user.date_joined,
            "notes_count": notes_count
        })

