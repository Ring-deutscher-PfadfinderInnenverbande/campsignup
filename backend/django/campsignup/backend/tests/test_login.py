import json

from django.test import TestCase
from django.core import management
from django.contrib.auth import get_user_model

from pprint import pprint

import time

from rest_framework.test import APIClient

from backend.modules.EmailVerification import EmailVerification
from backend.models import Participant, Group
from .common import common

class LoginTestCase(TestCase):
    def setUp(self):
        management.call_command("createDummyUser")
     

    def test_logins(self):
        """ Test creation permission rules as anonymous user"""

        # First test basic creation without auth.
        # Should be rejected
        client = APIClient()
        response = client.post('/api/v1/user/login', {"username": "user1@localhost.local", "password": "user1"}, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        data = json.loads(content)
        self.assertIn("access", data)
        self.assertNotIn("detail", data)

        response = client.get('/api/v1/participants/', None, format='json')
        self.assertEqual(response.status_code, 403)

        client.credentials(HTTP_AUTHORIZATION='Bearer ' + data["access"])
        response = client.get('/api/v1/participants/', None, format='json')
        self.assertEqual(response.status_code, 200)
        client.credentials()

        response = client.post('/api/v1/user/login', {"username": "user1@localhost.local", "password": "wrong"}, format='json')
        self.assertEqual(response.status_code, 401)
        content = response.content.decode("utf-8")
        data = json.loads(content)
        self.assertIn("detail", data)

        response = client.post('/api/v1/user/login', {"username": "new-user@localhost.local", "password": "new-user"}, format='json')
        self.assertEqual(response.status_code, 401)
        content = response.content.decode("utf-8")
        data = json.loads(content)
        self.assertIn("detail", data)

        response = client.post('/api/v1/user/register', {"email": "new-user@localhost.local", "password": "new-user"}, format='json')
        self.assertEqual(response.status_code, 200)

        response = client.post('/api/v1/user/login', {"username": "new-user@localhost.local", "password": "new-user"}, format='json')
        self.assertEqual(response.status_code, 401)

        user = get_user_model().objects.filter(email="new-user@localhost.local").first()

        ver = EmailVerification()
        token = ver.createToken(user)

        time.sleep(1)

        response = client.get(f"/api/v1/user/verify/{token}")
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        data = json.loads(content)
        self.assertEqual(data, {"verification": True})

        response = client.get(f"/api/v1/user/verify/{token}")
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        data = json.loads(content)
        self.assertEqual(data, {"verification": False})

        response = client.post('/api/v1/user/login', {"username": "new-user@localhost.local", "password": "new-user"}, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        data = json.loads(content)
        self.assertIn("access", data)
        self.assertNotIn("detail", data)

