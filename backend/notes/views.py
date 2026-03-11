from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics, permissions
from .models import Note
from .serializers import NoteSerializer
from .serializers import UserRegistrationSerializer
from pgvector.django import CosineDistance
from sentence_transformers import SentenceTransformer
from django.db.models import F
    
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

model = None
def get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

# backend/notes/views.py

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def semantic_search(request):
    get_model()
    query = request.GET.get('q', '').lower() # Lowercase for case-insensitive matching
    if not query:
        return Response([])

    query_vector = model.encode(query).tolist()

    notes = Note.objects.filter(user=request.user).exclude(
        embedding__isnull=True
    ).annotate(
        distance=CosineDistance('embedding', query_vector)
    ).order_by('distance')[:5]

    data = []
    for note in notes:
        serialized = NoteSerializer(note).data
        
        # 1. Start with the AI Semantic Score
        # Cosine distance 0.0 is perfect, 1.0 is neutral
        score = max(0, min(100, round((1 - note.distance) * 100)))
        
        # 2. Add the "Keyword Boost"
        # Check if the exact query exists in title or markdown
        title_match = query in note.title.lower()
        content_match = query in note.markdown.lower()
        
        if title_match:
            score += 20  # Significant boost for title matches
        elif content_match:
            score += 10  # Moderate boost for body matches
            
        # 3. Cap the score at 100%
        serialized['match_score'] = min(100, score)
        data.append(serialized)

    # Re-sort the data list because the boost might have changed the order
    data.sort(key=lambda x: x['match_score'], reverse=True)

    return Response(data)

class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # 1. Grab the text from the request
        title = self.request.data.get('title', '')
        markdown = self.request.data.get('markdown', '')
        combined_text = f"{title} {markdown}"

        # 2. Generate the embedding vector
        vector = model.encode(combined_text).tolist()

        # 3. Save everything together
        serializer.save(user=self.request.user, embedding=vector)


class NoteDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user)
