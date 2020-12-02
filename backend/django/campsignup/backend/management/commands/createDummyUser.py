from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Creates admin user and dummy users'

    def add_arguments(self, parser):
        # Named (optional) arguments
        parser.add_argument(
            '--delete',
            action='store_true',
            help='Delete all users beforehand',
        )

    def createUser(self, name, isStaff):
        try:
            User.objects.get(username=name)
        except User.DoesNotExist:
            if isStaff:
                user = User.objects.create_superuser(f'{name}@localhost.local', f'{name}@localhost.local', name)
            else:
                user = User.objects.create_user(f'{name}@localhost.local', f'{name}@localhost.local', name)
            user.isStaff = isStaff
            print(f"Creating new user {name}")
            user.save()

    def handle(self, *args, **options):
        if options['delete']:
            User.objects.all().delete()
        self.createUser('admin', True)
        self.createUser('user1', False)
        self.createUser('user2', False)
        self.createUser('user3', False)