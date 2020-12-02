from rest_framework import generics
from rest_framework import permissions
from rest_framework.schemas.openapi import AutoSchema
import re

from .GenericSerializer import StringListField, HashIDField, ArrayReferencesField, StringReferencesField, StringJSONField, Serializer_permission_owners

# Schema, this is used to descibe and document the API
class MySchema(AutoSchema):

    # Override, so that we can group the Endpoints together
    def get_operation(self, path, method):
        rmatch = r"\/api\/v1\/([a-zA-Z0-9-_.]+)"
        vals = super().get_operation(path, method)
        matches = re.match(rmatch, path)
        if matches:
            val = f"API: {matches.group(1)}"
            vals["tags"] = [val]
        tmp = list(vals['operationId'])
        tmp[0] = tmp[0].upper()
        vals['operationId'] = "".join(tmp)
        return vals

    def _map_field(self, field):
        if isinstance(field, StringListField):
            return {
                'type': 'array',
                'items': {
                    'type': "string"
                },
            }
        elif isinstance(field, ArrayReferencesField):
            return {
                'type': 'array',
                'items': {
                    'type': "string"
                },
            }
        elif isinstance(field, StringReferencesField):
            return {
                'type': 'string'
            }
        elif isinstance(field, StringJSONField):
            return {
                'type': 'object',
                'items': {
                    'type': "free entries"
                },
            }
        return super()._map_field(field)

# Permission
class OwnerPermission(permissions.BasePermission):
    """
    Handles permissions for users.  The basic rules are
     - owner and admin may GET, PUT, POST, DELETE
     - nobody else can access
     """

    def has_object_permission(self, request, view, obj):
        return Serializer_permission_owners.checkPermission(request.method, request.user, None, obj)

class AnonViewOwnerRestPermission(permissions.BasePermission):
    """
    Handles permissions for users.  The basic rules are
     - owner and admin may GET, PUT, POST, DELETE
     - nobody else can access
     """

    def has_object_permission(self, request, view, obj):
        # Admin can do all
        if request.user.is_staff:
            return True
        
        if request.method == "GET":
            return True
        else:
            perm = OwnerPermission()
            return perm.has_object_permission(request, view, obj)

# Create your views here.
class ListCreateOwnerAPI(generics.ListCreateAPIView):
    """
    get:
    This returns a list of all elements.
    No pagination or so is done and can be done.
    Depending on the logged in user the results are different:
    - If the user is an admin: All elements are returned.
    - If the user is no admin: Only the elements where the currently logged in user is the "owner" are returned.

    post:
    Create a new element.
    - If the user is an admin: The admin can assign a different user as "owner" of the element. Default is the admin itself as owner.
    - If the user is no admin: The current user is assigned as owner, no matter what is requested
    
    """
    schema = MySchema()
    permission_classes = [permissions.IsAuthenticated] # More generic permission, as we filter, rather than reject 

    # Filter list, to only show own elements
    def get_queryset(self):
        user = self.request.user

        if user is not None and user.is_authenticated:
            if user.is_staff: # Admin sees all
                return self.model.objects.all()
            if hasattr(self.model, "more_owners"):
                return self.model.objects.filter(owner=user) | self.model.objects.filter(more_owners__in=[user])
            else:
                return self.model.objects.filter(owner=user)
        return None

    # Hook into create,
    # so that we check, that the owner is always right
    def perform_create(self, serializer):
        user = self.request.user

        if user is not None and user.is_authenticated:
            if user.is_staff: # Admin is allowed to create as wanted
                return serializer.save() 
            return serializer.save(owner=user)
        raise ValidationError('You are not logged in')

class DetailOwnerAPI(generics.RetrieveUpdateAPIView):
    """
    get:
    This returns a specific element.
    Depending on the logged in user the results are different:
    - If the user is an admin: All elements can be returned.
    - If the user is no admin: Only the elements where the currently logged in user is the "owner" can be returned.

    put:
    Update a existing element.
    - If the user is an admin: The admin can edit all elements.
    - If the user is no admin: The user can only edit its own elements.

    """
    schema = MySchema()
    permission_classes = [OwnerPermission]

     # Override ID obfuscation
    def get_object(self):
        if hasattr(self.serializer_class.Meta, "has_hashid"):
            if self.serializer_class.Meta.has_hashid:
                field = HashIDField()
                self.kwargs['pk'] = field.to_internal_value(self.kwargs['pk'])
        return super().get_object()