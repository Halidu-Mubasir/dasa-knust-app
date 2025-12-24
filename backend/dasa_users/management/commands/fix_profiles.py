from django.core.management.base import BaseCommand
from dasa_users.models import User, Profile

class Command(BaseCommand):
    help = 'Creates missing Profile objects for Users that do not have one.'

    def handle(self, *args, **options):
        users = User.objects.all()
        created_count = 0
        
        self.stdout.write(f"Checking {users.count()} users for missing profiles...")

        for user in users:
            if not hasattr(user, 'profile'):
                try:
                    Profile.objects.create(user=user)
                    created_count += 1
                    self.stdout.write(self.style.SUCCESS(f"Created profile for user: {user.username}"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Failed to create profile for {user.username}: {e}"))
        
        if created_count == 0:
             self.stdout.write(self.style.SUCCESS('All users already have profiles.'))
        else:
             self.stdout.write(self.style.SUCCESS(f'Successfully created {created_count} missing profiles.'))
