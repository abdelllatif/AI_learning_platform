from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model


class ChatAPITestCase(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username="chat_user", email="chat@example.com", password="TestPass123")
        self.client.force_authenticate(user=self.user)

    def test_create_chat_and_post_user_message_creates_ai_reply(self):
        # create chat
        res = self.client.post(reverse("chat-list-create"), {"title": "My Chat"}, format="json")
        self.assertEqual(res.status_code, 201)
        chat_id = res.data.get("id")

        # post user message
        url = reverse("message-create-user", kwargs={"chat_id": chat_id})
        res2 = self.client.post(url, {"content": "Hello"}, format="json")
        self.assertEqual(res2.status_code, 201)

        # list messages
        url_list = reverse("message-list", kwargs={"chat_id": chat_id})
        res3 = self.client.get(url_list)
        self.assertEqual(res3.status_code, 200)
        # should contain 2 messages: user + ai
        self.assertEqual(len(res3.data), 2)
from django.test import TestCase

# Create your tests here.
