import os
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
import django
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from rest_framework.parsers import JSONParser
from chat.views import UserMessageCreateView
from chat.serializers import MessageCreateSerializer
from chat.models import Chat, Message

User = get_user_model()
username = f"debug_user_view_{uuid.uuid4().hex[:8]}"
user = User.objects.create_user(username=username, email=f"{username}@example.com", password="TestPass123")
chat = Chat.objects.create(title='My Chat', owner=user)

factory = APIRequestFactory()
request = factory.post('/api/chat/{}/messages/user/'.format(chat.pk), {'content': 'Hello'}, format='json')
request.user = user

view = UserMessageCreateView()
view.request = request
view.kwargs = {'chat_id': chat.pk}

serializer = MessageCreateSerializer(data={'content': 'Hello'})
if not serializer.is_valid():
    print('serializer errors', serializer.errors)
else:
    try:
        view.perform_create(serializer)
        print('perform_create succeeded')
        print('messages count', chat.messages.count())
        for m in chat.messages.all():
            print(m.sender, m.content)
    except Exception:
        import traceback
        traceback.print_exc()
