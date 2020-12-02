
from rest_framework import generics, permissions, views
from rest_framework.response import Response

from django.contrib.auth import login, logout

from .modules.OwnerAPIView import ListCreateOwnerAPI, DetailOwnerAPI, MySchema, AnonViewOwnerRestPermission, OwnerPermission
from .models import Group, Participant
from .serializers import SerializerParticipant, SerializerGroup, SerializerRegister

# Create your views here.
class ParticipantListCreateAPI(ListCreateOwnerAPI):
    """
    get:
    This returns a list of all participants.
    No pagination or so is done and can be done.
    Depending on the logged in user the results are different:
    - If the user is an admin: All participants are returned.
    - If the user is no admin: Only the participants where the currently logged in user is the "owner" are returned.

    post:
    Create a new participant.
    - If the user is an admin: The admin can assign a different user as "owner" of the participant. Default is the admin itself as owner.
    - If the user is no admin: The current user is assigned as owner, no matter what is requested
    
    """
    model = Participant
    queryset = Participant.objects.none()
    serializer_class = SerializerParticipant

class ParticipantDetailAPI(DetailOwnerAPI):
    """
    get:
    This returns a specific participant.
    Depending on the logged in user the results are different:
    - If the user is an admin: All participants can be returned.
    - If the user is no admin: Only the participants where the currently logged in user is the "owner" can be returned.

    put:
    Update a existing participant.
    - If the user is an admin: The admin can edit all participants.
    - If the user is no admin: The user can only edit its own participants.

    """
    model = Participant
    queryset = Participant.objects.all()
    serializer_class = SerializerParticipant

class GroupListCreateAPI(ListCreateOwnerAPI):
    """
    get:
    This returns a list of all groups.
    No pagination or so is done and can be done.
    Depending on the logged in user the results are different:
    - If the user is an admin: All groups are returned.
    - If the user is no admin: Only the groups where the currently logged in user is the "owner" are returned.

    post:
    Create a new participant.
    - If the user is an admin: The admin can assign a different user as "owner" of the group. Default is the admin itself as owner.
    - If the user is no admin: The current user is assigned as owner, no matter what is requested
    
    """
    model = Group
    queryset = Group.objects.none()
    serializer_class = SerializerGroup

class GroupDetailAPI(DetailOwnerAPI):
    """
    get:
    This returns a specific group.
    Depending on the logged in user the results are different:
    - If the user is an admin: All groups can be returned.
    - If the user is no admin: Only the groups where the currently logged in user is the "owner" can be returned.

    put:
    Update a existing group.
    - If the user is an admin: The admin can edit all groups.
    - If the user is no admin: The user can only edit its own groups.

    """
    model = Group
    queryset = Group.objects.all()
    serializer_class = SerializerGroup
    permission_classes = [AnonViewOwnerRestPermission] #AnonView, as we filter in serializer based on permission in model.py

class RegisterView(generics.CreateAPIView):
    """
    post:
    Register user, gives an OK.
    Reponse ist error or {"status": "OK"}.
    
    """
    serializer_class = SerializerRegister
    permission_classes = (permissions.AllowAny,)
    schema = MySchema()

    def post(self, request):
        serializer = SerializerRegister(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)