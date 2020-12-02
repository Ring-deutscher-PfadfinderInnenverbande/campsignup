from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User

from backend.models import Participant, Group
class Command(BaseCommand):
    help = 'Creates ParticipantEntries'

    num = 0

    def createParticipant(self, owner, grp):
        p = Participant(fullName=f'Participant {self.num}', owner=owner, group=grp)
        p.save()
        self.num += 1

    def handle(self, *args, **options):
        user = User.objects.get(username='admin@localhost.local')
        grp = Group(owner=user)
        grp.save()
        for i in range(5):
            self.createParticipant(user, grp)
        user = User.objects.get(username='user1@localhost.local')
        for i in range(5):
            self.createParticipant(user, grp)
        user = User.objects.get(username='user2@localhost.local')
        for i in range(5):
            self.createParticipant(user, grp)
        user = User.objects.get(username='user3@localhost.local')
        for i in range(5):
            self.createParticipant(user, grp)