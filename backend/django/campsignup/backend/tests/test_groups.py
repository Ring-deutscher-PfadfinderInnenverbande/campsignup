import json

from django.test import TestCase
from django.core import management

from pprint import pprint

from rest_framework.test import APIClient

from backend.models import Participant, Group
from .common import common

class GroupTestCase(TestCase):
    def setUp(self):
        management.call_command("createDummyUser")

    def test_permissions_CreateList_nologin(self):
        """ Test creation permission rules as anonymous user"""

        # First test basic creation without auth.
        # Should be rejected
        client = APIClient()
        response = client.post('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 403)

        response = client.put('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 403)

        response = client.get('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 403)

    def test_permissions_CreateList_admin(self):
        """ Test creation permission rules as admin user"""

        # First test basic creation without auth.
        # Should be rejected
        client = APIClient()
        a = client.login(username='admin@localhost.local', password='admin')

        response = client.post('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 201)

        response = client.put('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 405)

        response = client.get('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 200)

    def test_permissions_CreateList_user(self):
        """ Test creation permission rules as 'User' user"""

        # First test basic creation without auth.
        # Should be rejected
        client = APIClient()
        a = client.login(username='user1@localhost.local', password='user1')

        response = client.post('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 201)

        response = client.put('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 405)

        response = client.get('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 200)

    def test_checks_CreateList_admin(self):
        """ Test creation permission rules as admin user"""

        # First test basic creation without auth.
        # Should be rejected
        client = APIClient()
        a = client.login(username='admin@localhost.local', password='admin')

        group = dict(common.valid_group)

        # Allo admin to set other owners
        group['owner'] = 2
        response = client.post('/api/v1/groups/', group, format='json')
        self.assertEqual(response.status_code, 201)

        content = response.content.decode("utf-8")
        data = json.loads(content)
        self.assertEqual(data['owner'], 2)
        

    def test_checks_CreateList_user(self):
        """ Test creation permission rules as admin user"""

        # First test basic creation without auth.
        # Should be rejected
        client = APIClient()
        a = client.login(username='user2@localhost.local', password='user2')

        group = dict(common.valid_group)

        # Allo user to only set current user as owners, the id 1 should be ignored and 3 should be set
        group['owner'] = 1
        response = client.post('/api/v1/groups/', group, format='json')
        self.assertEqual(response.status_code, 201)

        content = response.content.decode("utf-8")
        data = json.loads(content)
        self.assertEqual(data['owner'], 3)

        cid = data['id']
        response = client.get(f'/api/v1/groups/{cid}', common.valid_group, format='json')

        self.assertEqual(response.status_code, 200)

        content = response.content.decode("utf-8")
        data = json.loads(content)
        self.assertEqual(data['owner'], 3)

    def test_checks_UpdateOwn_user(self):
        """ Test creation permission rules as admin user"""

        # First test basic creation without auth.
        # Should be rejected
        client = APIClient()
        a = client.login(username='user2@localhost.local', password='user2')

        response = client.post('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 201)
        content = response.content.decode("utf-8")
        data = json.loads(content)
        cid = data['id']

        cid = data['id']
        response = client.get(f'/api/v1/groups/{cid}', common.valid_group, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        group = json.loads(content)

        group['name'] = "Mr Testcase"
        response = client.put(f'/api/v1/groups/{cid}', group, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        data = json.loads(content)

        self.assertEqual(data['name'], "Mr Testcase")

    def test_checks_UpdatePriceAdjustments_user(self):
        """ Test creation permission rules as admin user"""

        # First test basic creation without auth.
        # Should be rejected
        client = APIClient()
        a = client.login(username='user2@localhost.local', password='user2')

        response = client.post('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 201)
        content = response.content.decode("utf-8")
        data = json.loads(content)
        cid = data['id']

        cid = data['id']
        response = client.get(f'/api/v1/groups/{cid}', common.valid_group, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        group = json.loads(content)

        # Test delete
        group['priceAdjustments'] = {}
        response = client.put(f'/api/v1/groups/{cid}', group, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        data = json.loads(content)

        self.assertEqual(data['priceAdjustments'], {})

        # Test add
        data['priceAdjustments'] = {
                "fullName": "Person A",
                "address": "Addr 1",
                "phone": "0701",
                "email": "bla1@bla.muh",
                "misc": "Ladida1"
        }

        response = client.put(f'/api/v1/groups/{cid}', data, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        data = json.loads(content)

        self.assertEqual(data['priceAdjustments'], {
                "fullName": "Person A",
                "address": "Addr 1",
                "phone": "0701",
                "email": "bla1@bla.muh",
                "misc": "Ladida1"
        })

    def test_checks_UpdateMore_owners_user(self):
        """ Test creation permission rules as admin user"""

        client = APIClient()
        a = client.login(username='user2@localhost.local', password='user2')

        # Create group
        response = client.post('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 201)
        content = response.content.decode("utf-8")
        data = json.loads(content)
        cid = data['id']

        # Get new group
        response = client.get(f'/api/v1/groups/{cid}', common.valid_group, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        group = json.loads(content)

        # Add owners
        group["more_owners"] = [
            "user1@localhost.local",
            "user2@localhost.local",
        ]
        response = client.put(f'/api/v1/groups/{cid}', group, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        group = json.loads(content)

        self.assertEqual(group['more_owners'], [
            "user1@localhost.local",
            "user2@localhost.local",
        ])

        # Set invalid owner which should be ignored
        group["more_owners"] = [
            "user1@localhost.local",
            "user2@localhost.local",
            "invalid@localhost.local"
        ]
        response = client.put(f'/api/v1/groups/{cid}', group, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        group = json.loads(content)

        self.assertEqual(group['more_owners'], [
            "user1@localhost.local",
            "user2@localhost.local",
        ])


   