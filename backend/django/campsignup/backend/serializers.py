from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, get_user_model, password_validation
from pprint import pprint

from .modules.EmailVerification import EmailVerification
from .modules.GenericSerializer import GenericSerializer, HashIDField, HashIDModelField, StringListField, StringReferencesField, ArrayReferencesField, StringJSONField
from .models import Contact, Group, Participant

"""Contact Data Serializer (REST JSON <---> Django conversion)

Scheme copied from frontend: /web/src/SignupPage/ContactForm.tsx
Do not include business logic in here, this is only a data conversion layer
Most likely this serializer will not be called directly, but by SerializerParticipant
"""
class SerializerContact(GenericSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Contact
        fields = '__all__' 


"""Participant Data Serializer (REST JSON <---> Django conversion)

Scheme copied from frontend: /web/src/SignupPage/ParticipantSignupPage.tsx
Do not include business logic in here, this is only a data conversion layer
"""
class SerializerParticipant(GenericSerializer):
    # HashID, as we hide the integer ID
    group = HashIDModelField(model=Group, help_text=Participant._meta.get_field('group').help_text)

    # Define the Array Fields, as the "Array" Feature is only in the json part, the database saves an array string
    staffDays = StringListField(required=False, help_text=Participant._meta.get_field('staffDays').help_text, max_length=Participant._meta.get_field('staffDays').max_length)
    staffLanguages = StringListField(required=False, help_text=Participant._meta.get_field('staffLanguages').help_text, max_length=Participant._meta.get_field('staffLanguages').max_length)
    staffChildcare = StringListField(required=False, help_text=Participant._meta.get_field('staffChildcare').help_text, max_length=Participant._meta.get_field('staffChildcare').max_length)

    # To show also related items, we need to declare how to serialize these objects
    ownContact = SerializerContact(allow_null=True, required=False, help_text=Participant._meta.get_field('ownContact').help_text)
    guardianContact = SerializerContact(allow_null=True, required=False, help_text=Participant._meta.get_field('guardianContact').help_text)
    emergencyContacts = SerializerContact(required=False, many=True, help_text=Participant._meta.get_field('emergencyContacts').help_text) # many=True indicates an array of to be serialized objects

    # Field override to automatically link it with other participant
    smallChildRef = StringReferencesField(required=False, refModel=Participant, refFieldName="fullName", help_text=Participant._meta.get_field('smallChildRef').help_text)
    familyMember = StringReferencesField(required=False, refModel=Participant, refFieldName="fullName", help_text=Participant._meta.get_field('familyMember').help_text)

    class Meta:
        model = Participant
        fields = '__all__'

    # Custom validation, as we need specific error checks
    def validate(self, data):
        # Check that smallChildRef doesn't link to itself or other children
        if data["smallChildRef"] is not None and len(data["smallChildRef"]) == 1:
            # We can only check, if we are sure that we have the right smallChildRef,
            # multiple search results can't be checked
            person = data["smallChildRef"][0]
            if person.smallChildRef and person.smallChildRef.count() > 0:
                raise serializers.ValidationError("You can't link smallChildRef to a participant who is a child")

            # Only check if we do an update 
            if self.instance:                    
                if person.id == self.instance.id:
                    raise serializers.ValidationError("You can't link smallChildRef to yourself")
            else: # Check on creation.
                # If fullName is not in DB and smallChildRef = own-fullName, this is fishy
                if person.fullName == data["fullName"]:
                    persons = Participant.filter(fullName__iexact=person.fullName)
                    if not persons:
                        raise serializers.ValidationError("You can't link smallChildRef to yourself on creation")

        # Check Rate specific stuff
        # Family Rates
        if "family" in data["rate"]:
            if data["familyMember"] is None or len(data["familyMember"]) == 0:
                raise serializers.ValidationError("You need to specify a family member with the full rate")
            elif len(data["familyMember"]) == 1: # We can only check if we have single match in DB
                person = data["familyMember"][0]
                if "family" in person.rate:
                    raise serializers.ValidationError("You need to specify a family member with the full rate, not a member with also a reduced rate")
        return data

    # We need to implement our own create,
    # as we need to incoperate the other serializers
    def create(self, validated_data):
        validated_data = self.checkPermissions("create", validated_data, None)
        
        # First extract the new contacts
        ownContact = self.referenceField_Create("ownContact", Contact, validated_data)
        guardianContact = self.referenceField_Create("guardianContact", Contact, validated_data)
        emergencyContacts = self.manyField_Create("emergencyContacts", Contact, validated_data)
        smallChildRef = self.stringReferencesField_Create("smallChildRef", validated_data)
        familyMember = self.stringReferencesField_Create("familyMember", validated_data)

        # Setup new participant object
        participant = Participant.objects.create(**validated_data, ownContact=ownContact, guardianContact=guardianContact)
        participant.emergencyContacts.set(emergencyContacts)
        participant.smallChildRef.set(smallChildRef)
        participant.familyMember.set(familyMember)

        return participant

    # Override, as we need to define how to save nested data (= contact)
    def update(self, instance, validated_data):
        validated_data = self.checkPermissions("update", validated_data, instance)

        instance = self.referenceField_CreateUpdate('ownContact', Contact, instance, validated_data)
        instance = self.referenceField_CreateUpdate('guardianContact', Contact, instance, validated_data)

        instance = self.manyField_CreateUpdateDelete('emergencyContacts', Contact, instance, validated_data)
        instance = self.stringReferencesField_Update("smallChildRef", instance, validated_data)
        instance = self.stringReferencesField_Update("familyMember", instance, validated_data)

        instance = self.updateWithExclusion(("ownContact", "guardianContact", "emergencyContacts", "smallChildRef", "familyMember"), instance, validated_data)

        return instance

"""Participant Data Serializer (REST JSON <---> Django conversion)

Scheme copied from frontend: /web/src/SignupPage/ParticipantSignupPage.tsx
Do not include business logic in here, this is only a data conversion layer
"""
class SerializerGroup(GenericSerializer):
    # Define the Dict Fields, as the "Dict" Feature is only in the json part, the database saves an dict string
    id = HashIDField(help_text=Group._meta.get_field('id').help_text)
    priceAdjustments = StringJSONField(required=False, max_length=Group._meta.get_field('priceAdjustments').max_length, help_text=Group._meta.get_field('priceAdjustments').help_text)
    more_owners = ArrayReferencesField(required=False, refModel=User, refFieldName="email", help_text=Group._meta.get_field('more_owners').help_text)

    class Meta:
        model = Group
        fields = '__all__'
        has_hashid = True

    # We need to implement our own create,
    # as we need to incoperate the other serializers
    def create(self, validated_data):
        validated_data = self.checkPermissions("create", validated_data, None)

        more_owners = self.stringReferencesField_Create("more_owners", validated_data)
        group = Group.objects.create(**validated_data)
        group.more_owners.set(more_owners)
        return group

    def update(self, instance, validated_data):
        validated_data = self.checkPermissions("update", validated_data, instance)

        instance = self.stringReferencesField_Update("more_owners", instance, validated_data)
        instance = self.updateWithExclusion(("more_owners",), instance, validated_data)

        return instance


""" Serializer to register new user
"""
class SerializerRegister(serializers.Serializer):
    email = serializers.EmailField(required=True, read_only=False)
    password = serializers.CharField(required=True, read_only=False)

    def validate(self, data):
        UserModel = get_user_model()
        try:
            userentry = UserModel.objects.get(email=data['email'])
            return {
                'status': 'OK',
            } 
        except UserModel.DoesNotExist:
            userentry = UserModel.objects.create_user(data['email'], data['email'], data['password'])
            password_validation.validate_password(data['password'], userentry)
            userentry.save()

            ver = EmailVerification()
            ver.sendConfirm(userentry)

        return {
            'status': 'SEND',
        } 