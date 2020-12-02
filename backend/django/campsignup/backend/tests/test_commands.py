import json

from django.test import TestCase
from django.core import management

from pprint import pprint

from rest_framework.test import APIClient

from backend.models import Participant, Group
from .common import common

class CommandTestCase(TestCase):

    def test_commands(self):
        management.call_command("createDummyUser")
        management.call_command("createDummyParticipants")


   