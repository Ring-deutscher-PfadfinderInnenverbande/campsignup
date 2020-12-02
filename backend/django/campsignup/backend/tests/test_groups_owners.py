import json

from django.test import TestCase
from django.core import management

from pprint import pprint

from rest_framework.test import APIClient

from backend.models import Participant, Group
from .common import common

class GroupOwnerTestCase(TestCase):
    def setUp(self):
        management.call_command("createDummyUser")

    def test_permissions_checkList_users(self):
        """ Test creation permission rules as anonymous user"""

        client = APIClient()
        client.login(username='user1@localhost.local', password='user1')
        response = client.post('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 201)
        client.logout()

        client.login(username='user2@localhost.local', password='user2')
        response = client.post('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 201)
        client.logout()

        client.login(username='user3@localhost.local', password='user3')
        response = client.post('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 201)
        client.logout()

        client.login(username='user1@localhost.local', password='user1')
        response = client.get('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 200)
        client.logout()
        content = response.content.decode("utf-8")
        data = json.loads(content)
        self.assertEqual(len(data), 1)

        client.login(username='user2@localhost.local', password='user2')
        response = client.get('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 200)
        client.logout()
        content = response.content.decode("utf-8")
        data = json.loads(content)
        self.assertEqual(len(data), 1)

        client.login(username='user3@localhost.local', password='user3')
        response = client.get('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 200)
        client.logout()
        content = response.content.decode("utf-8")
        data = json.loads(content)

        self.assertEqual(len(data), 1)

        client.login(username='admin@localhost.local', password='admin')
        response = client.get('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 200)
        client.logout()
        content = response.content.decode("utf-8")
        data = json.loads(content)
        self.assertEqual(len(data), 3)

        # Now add user 2 to user 1 first group
        self.assertEqual(data[0]["owner"], 2) # Check our basic assumption
        gid = data[0]["id"]

        group = dict(data[0])
        group["more_owners"] = [
            "user2@localhost.local"
        ]
        client.login(username='user1@localhost.local', password='user1')
        response = client.put(f'/api/v1/groups/{gid}', group, format='json')
        self.assertEqual(response.status_code, 200)
        client.logout()

        client.login(username='user1@localhost.local', password='user1')
        response = client.get('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 200)
        client.logout()
        content = response.content.decode("utf-8")
        data = json.loads(content)
        self.assertEqual(len(data), 1)

        client.login(username='user2@localhost.local', password='user2')
        response = client.get('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 200)
        client.logout()
        content = response.content.decode("utf-8")
        data = json.loads(content)
        self.assertEqual(len(data), 2)





   