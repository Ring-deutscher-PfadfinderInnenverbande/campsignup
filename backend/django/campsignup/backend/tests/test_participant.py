import json

from django.test import TestCase
from django.core import management

from pprint import pprint

from rest_framework.test import APIClient

from backend.models import Participant, Group
from .common import common

class ParticipantTestCase(TestCase):
    def setUp(self):
        management.call_command("createDummyUser")
        client = APIClient()
        a = client.login(username='user1@localhost.local', password='user1')

        response = client.post('/api/v1/groups/', common.valid_group, format='json')
        self.assertEqual(response.status_code, 201)
        content = response.content.decode("utf-8")
        data = json.loads(content)

        self.valid_participant = dict(common.valid_participant)
        self.valid_participant['group'] = data['id']

    def test_permissions_CreateList_nologin(self):
        """ Test creation permission rules as anonymous user"""

        # First test basic creation without auth.
        # Should be rejected
        client = APIClient()
        response = client.post('/api/v1/participants/', self.valid_participant, format='json')
        self.assertEqual(response.status_code, 403)

        response = client.put('/api/v1/participants/', self.valid_participant, format='json')
        self.assertEqual(response.status_code, 403)

        response = client.get('/api/v1/participants/', self.valid_participant, format='json')
        self.assertEqual(response.status_code, 403)

    def test_permissions_CreateList_admin(self):
        """ Test creation permission rules as admin user"""

        # First test basic creation without auth.
        # Should be rejected
        client = APIClient()
        a = client.login(username='admin@localhost.local', password='admin')

        response = client.post('/api/v1/participants/', self.valid_participant, format='json')
        self.assertEqual(response.status_code, 201)

        response = client.put('/api/v1/participants/', self.valid_participant, format='json')
        self.assertEqual(response.status_code, 405)

        response = client.get('/api/v1/participants/', self.valid_participant, format='json')
        self.assertEqual(response.status_code, 200)

    def test_permissions_CreateList_user(self):
        """ Test creation permission rules as 'User' user"""

        # First test basic creation without auth.
        # Should be rejected
        client = APIClient()
        a = client.login(username='user1@localhost.local', password='user1')

        response = client.post('/api/v1/participants/', self.valid_participant, format='json')
        self.assertEqual(response.status_code, 201)

        response = client.put('/api/v1/participants/', self.valid_participant, format='json')
        self.assertEqual(response.status_code, 405)

        response = client.get('/api/v1/participants/', self.valid_participant, format='json')
        self.assertEqual(response.status_code, 200)

    def test_checks_CreateList_admin(self):
        """ Test creation permission rules as admin user"""

        # First test basic creation without auth.
        # Should be rejected
        client = APIClient()
        a = client.login(username='admin@localhost.local', password='admin')

        participant = dict(self.valid_participant)

        # Allow admin to set other owners
        participant['owner'] = 2
        response = client.post('/api/v1/participants/', participant, format='json')
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

        participant = dict(self.valid_participant)

        # Allow user to only set current user as owners, the id 1 should be ignored and 3 should be set
        participant['owner'] = 1
        response = client.post('/api/v1/participants/', participant, format='json')
        self.assertEqual(response.status_code, 201)

        content = response.content.decode("utf-8")
        data = json.loads(content)
        self.assertEqual(data['owner'], 3)

        cid = data['id']
        response = client.get(f'/api/v1/participants/{cid}', self.valid_participant, format='json')
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

        response = client.post('/api/v1/participants/', self.valid_participant, format='json')
        self.assertEqual(response.status_code, 201)
        content = response.content.decode("utf-8")
        data = json.loads(content)
        cid = data['id']

        cid = data['id']
        response = client.get(f'/api/v1/participants/{cid}', self.valid_participant, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        participant = json.loads(content)

        participant['fullName'] = "Mr Testcase"
        response = client.put(f'/api/v1/participants/{cid}', participant, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        data = json.loads(content)

        self.assertEqual(data['fullName'], "Mr Testcase")

    def test_checks_UpdateEmergencyContacts_user(self):
        """ Test creation permission rules as admin user"""

        # First test basic creation without auth.
        # Should be rejected
        client = APIClient()
        a = client.login(username='user2@localhost.local', password='user2')

        response = client.post('/api/v1/participants/', self.valid_participant, format='json')
        self.assertEqual(response.status_code, 201)
        content = response.content.decode("utf-8")
        data = json.loads(content)
        cid = data['id']

        cid = data['id']
        response = client.get(f'/api/v1/participants/{cid}', self.valid_participant, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        participant = json.loads(content)

        # Test delete
        participant['emergencyContacts'] = []
        response = client.put(f'/api/v1/participants/{cid}', participant, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        data = json.loads(content)

        self.assertEqual(len(data['emergencyContacts']), 0)

        # Test add
        data['emergencyContacts'] = [
             {
                "fullName": "Person A",
                "address": "Addr 1",
                "phone": "0701",
                "email": "bla1@bla.muh",
                "misc": "Ladida1"
            },
            {
                "fullName": "Person B",
                "address": "Addr 2",
                "phone": "0702",
                "email": "bla2@bla.muh",
                "misc": "Ladida2"
            },
            {
                "fullName": "Person C",
                "address": "Addr 3",
                "phone": "0703",
                "email": "bla3@bla.muh",
                "misc": "Ladida3"
            },
        ]
        response = client.put(f'/api/v1/participants/{cid}', data, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        data = json.loads(content)

        self.assertEqual(len(data['emergencyContacts']), 3)

        # Test update and delete
        del(data['emergencyContacts'][2])
        data['emergencyContacts'][1]["fullName"] = "This was changed"

        response = client.put(f'/api/v1/participants/{cid}', data, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        data = json.loads(content)

        self.assertEqual(len(data['emergencyContacts']), 2)
        self.assertEqual(data['emergencyContacts'][1]["fullName"], "This was changed")

        # Test update ID forbidden
        data['emergencyContacts'][1]['id'] = 1
        response = client.put(f'/api/v1/participants/{cid}', data, format='json')
        self.assertEqual(response.status_code, 400)

    def test_checks_UpdateGuardianContact_user(self):
        """ Test creation permission rules as admin user"""

        # First test basic creation without auth.
        # Should be rejected
        client = APIClient()
        a = client.login(username='user2@localhost.local', password='user2')

        response = client.post('/api/v1/participants/', self.valid_participant, format='json')
        self.assertEqual(response.status_code, 201)
        content = response.content.decode("utf-8")
        data = json.loads(content)
        cid = data['id']

        cid = data['id']
        response = client.get(f'/api/v1/participants/{cid}', self.valid_participant, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        participant = json.loads(content)

        # Test update 
        participant['guardianContact']['fullName'] = "My fancy new Name"
        response = client.put(f'/api/v1/participants/{cid}', participant, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        data = json.loads(content)

        self.assertEqual(data['guardianContact']['fullName'], "My fancy new Name")

        # Test update ID forbidden
        participant['guardianContact']['id'] = 1
        response = client.put(f'/api/v1/participants/{cid}', participant, format='json')
        self.assertEqual(response.status_code, 400)

    def test_checks_CreateSmallChildRef_user(self):
        """ Test creation permission rules as admin user"""

        # First test basic creation without auth.
        # Should be rejected
        client = APIClient()
        a = client.login(username='user2@localhost.local', password='user2')

        participant = dict(self.valid_participant)
        participant['fullName'] = "Urs Ubel"

        response = client.post('/api/v1/participants/', participant, format='json')
        self.assertEqual(response.status_code, 201)

        participant['fullName'] = "Urs2 Ubel"

        response = client.post('/api/v1/participants/', participant, format='json')
        self.assertEqual(response.status_code, 201)

        # Create Cild2 Entry
        participant['fullName'] = "Child2 Ubel"
        participant['smallChildRef'] = "Urs Ubel"
        response = client.post('/api/v1/participants/', participant, format='json')
        self.assertEqual(response.status_code, 201)

        # Create  FAIL Cild2 Entry with link to child
        participant['fullName'] = "Child3 Ubel"
        participant['smallChildRef'] = "Child2 Ubel"
        response = client.post('/api/v1/participants/', participant, format='json')
        self.assertEqual(response.status_code, 400)
        
        # Create Cild Entry
        participant['fullName'] = "Child Ubel"
        participant['smallChildRef'] = "Urs Ubel"
        response = client.post('/api/v1/participants/', participant, format='json')
        self.assertEqual(response.status_code, 201)
        content = response.content.decode("utf-8")
        data = json.loads(content)
        cid = data['id']
        self.assertEqual(participant['smallChildRef'], data['smallChildRef'])

        # Create FAIL Cild Entry with link to self
        participant['fullName'] = "Child4 Ubel"
        participant['smallChildRef'] = "Child4 Ubel"
        response = client.post('/api/v1/participants/', participant, format='json')
        self.assertEqual(response.status_code, 400)

        # Update Cild Entry
        participant = dict(data)
        participant['smallChildRef'] = "Urs2 Ubel"
        response = client.put(f'/api/v1/participants/{cid}', participant, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        data = json.loads(content)
        self.assertEqual(participant['smallChildRef'], data['smallChildRef'])

        # Set SmallChildRef to own
        participant['smallChildRef'] = "Child Ubel"
        response = client.put(f'/api/v1/participants/{cid}', participant, format='json')
        self.assertEqual(response.status_code, 400)

        # Set SmallChildRef to other child
        participant['smallChildRef'] = "Child2 Ubel"
        response = client.put(f'/api/v1/participants/{cid}', participant, format='json')
        self.assertEqual(response.status_code, 400)

         # Update Failed Cild Entry
        participant['smallChildRef'] = "Noexisting Ubel"
        response = client.put(f'/api/v1/participants/{cid}', participant, format='json')
        self.assertEqual(response.status_code, 400)

        # Create Failed Cild Entry
        participant['fullName'] = "Child2 Ubel"
        participant['smallChildRef'] = "Noexisting Ubel"
        response = client.post('/api/v1/participants/', participant, format='json')
        self.assertEqual(response.status_code, 400)

        # Create Failed Cild Entry linked to self
        participant['fullName'] = "Child4 Ubel"
        participant['smallChildRef'] = "Child4 Ubel"
        response = client.post('/api/v1/participants/', participant, format='json')
        self.assertEqual(response.status_code, 400)


    def test_checks_CreateFamilyMemberRef_user(self):
        """ Test creation permission rules as admin user"""

        # First test basic creation without auth.
        # Should be rejected
        client = APIClient()
        a = client.login(username='user2@localhost.local', password='user2')

        participant = dict(self.valid_participant)
        participant['fullName'] = "Urs Ubel"
        participant['rate'] = "normal-long-full"

        response = client.post('/api/v1/participants/', participant, format='json')
        self.assertEqual(response.status_code, 201)

        participant['fullName'] = "Urs2 Ubel"

        response = client.post('/api/v1/participants/', participant, format='json')
        self.assertEqual(response.status_code, 201)

        # Create Cild2 Entry
        participant['fullName'] = "Child2 Ubel"
        participant['familyMember'] = "Urs Ubel"
        participant['rate'] = "normal-long-full"
        response = client.post('/api/v1/participants/', participant, format='json')
        self.assertEqual(response.status_code, 201)

        # Create  Cild3 Entry with reduced rate
        participant['fullName'] = "Child3 Ubel"
        participant['familyMember'] = "Urs Ubel"
        participant['rate'] = "family-full"
        response = client.post('/api/v1/participants/', participant, format='json')
        self.assertEqual(response.status_code, 201)

        # Create FAIL Cild4 Entry with linked reduced rate
        participant['fullName'] = "Child4 Ubel"
        participant['familyMember'] = "Child3 Ubel"
        participant['rate'] = "family-full"
        response = client.post('/api/v1/participants/', participant, format='json')
        self.assertEqual(response.status_code, 400)
        
        # Create Cild Entry
        participant['fullName'] = "Child Ubel"
        participant['familyMember'] = "Urs Ubel"
        response = client.post('/api/v1/participants/', participant, format='json')
        self.assertEqual(response.status_code, 201)
        content = response.content.decode("utf-8")
        data = json.loads(content)
        cid = data['id']
        self.assertEqual(participant['familyMember'], data['familyMember'])

        # Create FAIL Cild Entry with link to self
        participant['fullName'] = "Child4 Ubel"
        participant['familyMember'] = "Child4 Ubel"
        response = client.post('/api/v1/participants/', participant, format='json')
        #self.assertEqual(response.status_code, 400)

    
    def test_permissions_UpdateRate_admin(self):
        client = APIClient()
        a = client.login(username='admin@localhost.local', password='admin')

        response = client.post('/api/v1/participants/', self.valid_participant, format='json')
        self.assertEqual(response.status_code, 201)
        content = response.content.decode("utf-8")
        data = json.loads(content)
        cid = data['id']

        cid = data['id']
        response = client.get(f'/api/v1/participants/{cid}', self.valid_participant, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        participant = json.loads(content)

        # Test update 
        participant['rate'] = "My fancy new rate"
        response = client.put(f'/api/v1/participants/{cid}', participant, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        data = json.loads(content)

        self.assertEqual(data['rate'], "My fancy new rate")

    def test_permissions_UpdateRate_user(self):
        client = APIClient()
        a = client.login(username='user2@localhost.local', password='user2')

        response = client.post('/api/v1/participants/', self.valid_participant, format='json')
        self.assertEqual(response.status_code, 201)
        content = response.content.decode("utf-8")
        data = json.loads(content)
        cid = data['id']

        cid = data['id']
        response = client.get(f'/api/v1/participants/{cid}', self.valid_participant, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        participant = json.loads(content)

        # Test update 
        participant['rate'] = "My fancy new rate"
        response = client.put(f'/api/v1/participants/{cid}', participant, format='json')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        data = json.loads(content)

        self.assertNotEqual(data['rate'], "My fancy new rate")