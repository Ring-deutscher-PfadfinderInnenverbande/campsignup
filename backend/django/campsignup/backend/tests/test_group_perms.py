import json

from django.test import TestCase
from django.core import management

from pprint import pprint

from rest_framework.test import APIClient

from backend.models import Participant, Group
from .common import common

class GroupPermsTestCase(TestCase):
    def setUp(self):
        management.call_command("createDummyUser")

    def test_permissions(self):
        """ Test creation permission rules as admin user"""

        client = APIClient()
        a = client.login(username='user2@localhost.local', password='user2')

        # Create group
        response = client.post('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 201)
        content = response.content.decode("utf-8")
        data = json.loads(content)
        cid = data['id']

        # Get new group as owner
        response = client.get(f'/api/v1/groups/{cid}', common.valid_group, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")

        self.assertIn("firstPlacementChoice", content)
        self.assertIn("priceAdjustments", content)
        self.assertIn("contactName", content)

        client.logout()

        response = client.get(f'/api/v1/groups/{cid}', common.valid_group, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")

        self.assertNotIn("firstPlacementChoice", content)
        self.assertIn("priceAdjustments", content)
        self.assertNotIn("contactName", content)

        client.logout()
        client.login(username='user1@localhost.local', password='user1')
        response = client.get(f'/api/v1/groups/{cid}', common.valid_group, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")

        self.assertNotIn("firstPlacementChoice", content)
        self.assertIn("priceAdjustments", content)
        self.assertNotIn("contactName", content)

        client.logout()
        client.login(username='admin@localhost.local', password='admin')
        response = client.get(f'/api/v1/groups/{cid}', common.valid_group, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")

        self.assertIn("firstPlacementChoice", content)
        self.assertIn("priceAdjustments", content)
        self.assertIn("contactName", content)


   