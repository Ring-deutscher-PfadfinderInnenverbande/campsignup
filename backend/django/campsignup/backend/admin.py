from django.contrib import admin
from backend.models import Participant, Group, Contact

# Register your models here.

@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    search_fields = ['fullName']
    autocomplete_fields = ['owner', 'smallChildRef', 'familyMember', 'emergencyContacts', 'guardianContact', 'ownContact']

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    autocomplete_fields = ['owner', 'more_owners']
    readonly_fields = ('hashid',)

    def hashid(self, obj):
        return obj.hashid()

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    search_fields = ['fullName', 'email']
    pass
