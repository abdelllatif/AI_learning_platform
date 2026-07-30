from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase


class AccountsTests(APITestCase):
    def setUp(self):
        self.register_url = '/api/auth/register/'
        self.token_url = '/api/token/'
        self.refresh_url = '/api/token/refresh/'
        self.profile_url = '/api/auth/profile/'
        self.change_password_url = '/api/auth/change-password/'
        self.logout_url = '/api/auth/logout/'

    def test_register_user(self):
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'StrongPassword123!',
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.filter(username='testuser').count(), 1)

    def authenticate(self):
        User.objects.create_user(username='testuser', email='test@example.com', password='StrongPassword123!')
        response = self.client.post(self.token_url, {'username': 'testuser', 'password': 'StrongPassword123!'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        return response.data

    def test_profile_get(self):
        self.authenticate()
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')

    def test_update_profile(self):
        self.authenticate()
        response = self.client.put(self.profile_url, {'username': 'updateduser', 'email': 'updated@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'updateduser')
        self.assertEqual(response.data['email'], 'updated@example.com')

    def test_change_password(self):
        self.authenticate()
        response = self.client.post(self.change_password_url, {
            'old_password': 'StrongPassword123!',
            'new_password': 'NewStrongPassword123!',
            'confirm_password': 'NewStrongPassword123!',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user = User.objects.get(username='testuser')
        self.assertTrue(user.check_password('NewStrongPassword123!'))

    def test_logout_blacklist(self):
        auth_data = self.authenticate()
        refresh_token = auth_data['refresh']
        logout_response = self.client.post(self.logout_url, {'refresh': refresh_token}, format='json')
        self.assertEqual(logout_response.status_code, status.HTTP_205_RESET_CONTENT)

        refresh_response = self.client.post(self.refresh_url, {'refresh': refresh_token}, format='json')
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)
