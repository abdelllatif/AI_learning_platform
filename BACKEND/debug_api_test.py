import os
import sys
import uuid
from pathlib import Path

# Ensure workspace root is on sys.path so BACKEND imports can resolve ai_engine.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
import django
django.setup()
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.urls import reverse

User = get_user_model()
username = f"debug_user_api_{uuid.uuid4().hex[:8]}"
user = User.objects.create_user(username=username, email=f"{username}@example.com", password="TestPass123")
client = APIClient()
client.force_authenticate(user=user)

print('=== CHAT CREATE ===')
res = client.post(reverse('chat-list-create'), {'title': 'My Chat'}, format='json')
print('status', res.status_code)
print('data', getattr(res, 'data', None))
print('content', res.content.decode('utf-8', errors='replace'))

if res.status_code == 201:
    chat_id = res.data['id']
    print('chat_id', chat_id)
    res2 = client.post(reverse('message-create-user', kwargs={'chat_id': chat_id}), {'content': 'Hello'}, format='json')
    print('=== USER MESSAGE ===')
    print('status', res2.status_code)
    print('data', getattr(res2, 'data', None))
    print('content', res2.content.decode('utf-8', errors='replace'))

print('=== QUIZ CREATE ===')
payload = {
    'title': 'Sample Quiz',
    'description': 'A test quiz',
    'questions': [
        {'text': 'Q1?', 'order': 0, 'answers': [
            {'text': 'A', 'is_correct': False},
            {'text': 'B', 'is_correct': True},
            {'text': 'C', 'is_correct': False},
            {'text': 'D', 'is_correct': False},
        ]},
        {'text': 'Q2?', 'order': 1, 'answers': [
            {'text': 'A2', 'is_correct': True},
            {'text': 'B2', 'is_correct': False},
            {'text': 'C2', 'is_correct': False},
            {'text': 'D2', 'is_correct': False},
        ]},
    ],
}
res3 = client.post(reverse('quiz-list-create'), payload, format='json')
print('status', res3.status_code)
print('data', getattr(res3, 'data', None))
print('content', res3.content.decode('utf-8', errors='replace'))
