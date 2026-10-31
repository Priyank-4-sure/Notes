from rest_framework import serializers
from .models import Note
from django.contrib.auth.models import User
from rest_framework import serializers

class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'markdown', 'pinned', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate_title(self, value):
        if len(value) > 100:
            raise serializers.ValidationError("Title must be at most 100 characters.")
        return value

    def validate_markdown(self, value):
        if len(value) > 10000:
            raise serializers.ValidationError("Markdown must be at most 10,000 characters.")
        return value
