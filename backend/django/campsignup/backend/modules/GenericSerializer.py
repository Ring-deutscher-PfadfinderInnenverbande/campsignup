from django.conf import settings
from rest_framework import serializers
from hashids import Hashids
from pprint import pprint
from textwrap import wrap

import json
# --------------------------------------------------------------------------------------
# ------------------
# Common Serializer Fields

class Serializer_permission_owners():
    @classmethod
    def checkPermission(cls, mode, user, data, obj):
         # Admin can do all
        if user.is_staff:
            return True
        
        # check if object is ownable (has owner property)
        if hasattr(obj, "owner"):
            if obj.owner is not None:
                if user == obj.owner:
                    return True
        
        # check if object is ownable by multiple users
        if hasattr(obj, "more_owners"):
            if obj.more_owners is not None:
                if user in list(obj.more_owners.all()):
                    return True
        return False

class Serializer_permission_user():
    @classmethod
    def checkPermission(cls, mode, user, data, instance):
        return user.is_authenticated

class Serializer_permission_all():
    @classmethod
    def checkPermission(cls, mode, user, data, instance):
        return True

class Serializer_permission_admin():
    @classmethod
    def checkPermission(cls, mode, user, data, instance):
        return user.is_staff

class HashIDField(serializers.Field):
    default_error_messages = {
        'invalid': 'Invalid data in HashIDField',
    }

    def __init__(self, *args, **kwargs):
        self.salt = kwargs.pop("salt", settings.HASHID_FIELD_SALT)
        self.alphabet = kwargs.pop("alphabet", "123456789abcdefhjkmnprstwxyz")
        self.min_length = kwargs.pop("min_length", 4)

        return super().__init__(*args, **kwargs)


    def to_internal_value(self, data):
        if type(data) != str:
            self.fail('invalid')

        data = data.lower()
        data = data.replace("-", "")
        hashme = Hashids(alphabet=self.alphabet, min_length=self.min_length, salt=self.salt)
        retval = hashme.decode(data)
        if type(retval) == tuple and len(retval) == 1:
            return retval[0]
        return -1

    def to_representation(self, value):
        if not value:
            return ""

        hashme = Hashids(alphabet=self.alphabet, min_length=self.min_length, salt=self.salt)
        idhash = hashme.encode(value)
        return "-".join(wrap(idhash, 4))

class HashIDModelField(HashIDField):
    default_error_messages = {
        'invalid': 'Invalid data in HashIDModelField',
    }

    def __init__(self, *args, **kwargs):
        self.model = kwargs.pop("model")
        return super().__init__(*args, **kwargs)


    def to_internal_value(self, data):
        id = super().to_internal_value(data)
        return self.model.objects.get(pk=id)

    def to_representation(self, value):
        if not value:
            return ""

        hashme = Hashids(alphabet=self.alphabet, min_length=self.min_length, salt=self.salt)
        idhash = hashme.encode(value.id)
        return "-".join(wrap(idhash, 4))

class StringJSONField(serializers.CharField):
    default_error_messages = {
        'invalid': 'Invalid data in StringListField',
    }
    def to_internal_value(self, data):
        if type(data) != dict:
            self.fail('invalid')

        return json.dumps(data)

    def to_representation(self, value):
        if not value:
            return {}

        return json.loads(value)

class StringListField(serializers.CharField):
    default_error_messages = {
        'invalid': 'Invalid data in StringListField',
    }
    def to_internal_value(self, data):
        if type(data) != list:
            self.fail('invalid')

        if data is None:
            return ""

        # Don't allow ", as we escape with this character
        matching = [s for s in data if "\"" in s]
        if matching:
            self.fail('invalid')
        return ",".join('"{0}"'.format(w) for w in data)

    def to_representation(self, value):
        if not value:
            return []

        value_str = f"[{value}]"
        return json.loads(value_str)
        
class StringReferencesField(serializers.Field):
    default_error_messages = {
        'invalid_type': 'Invalid data type in StringReferenceField: {data}: {value}',
        'no_elems': "No element was found for: {data}"
    }

    def __init__(self, *args, **kwargs):
        self.refFieldName = kwargs.pop("refFieldName")
        self.refModel = kwargs.pop("refModel")

        return super().__init__(*args, **kwargs)

    def to_internal_value(self, data):
        if data == None:
            return []
        
        if type(data) != str:
            self.fail('invalid_type', data=type(data), value=str(data))

        if data == "":
            return []

        filter_str = {
            f"{self.refFieldName}__iexact": data
        }

        elems = self.refModel.objects.filter(**filter_str)
        if not elems:
            self.fail('no_elems', data=data)

        elems = list(elems) # Force Execute of full DB Query
        return elems

    def to_representation(self, value):
        if not value:
            return ""

        value = list(value.all())

        if len(value) > 0:
            elem = value[0]
            return getattr(elem, self.refFieldName, "")

        return ""

class ArrayReferencesField(serializers.Field):
    default_error_messages = {
        'invalid_type': 'Invalid data type in StringReferenceField: {data}: {value}',
        'no_elems': "No element was found for: {data}"
    }

    def __init__(self, *args, **kwargs):
        self.refFieldName = kwargs.pop("refFieldName")
        self.refModel = kwargs.pop("refModel")

        return super().__init__(*args, **kwargs)

    def to_internal_value(self, data):
        if data == None:
            return []
        
        if type(data) != list:
            self.fail('invalid_type', data=type(data), value=str(data))

        if data == []:
            return []

        links = []
        for elem in data:
            filter_str = {
                f"{self.refFieldName}__iexact": elem
            }

            elems = self.refModel.objects.filter(**filter_str)
            if elems:
                links += list(elems)

        return links

    def to_representation(self, value):
        if not value:
            return []

        value = list(value.all())
        retval = []
        for elem in value:
            retval.append(getattr(elem, self.refFieldName))
        return retval

class GenericSerializer(serializers.ModelSerializer):

    def stringReferencesField_Create(self, fieldname, validated_data):
        if fieldname in validated_data:
            data = validated_data.pop(fieldname)
            if data is None:
                return []
            return data
        return []

    def manyField_Create(self, fieldname, model, validated_data):
        fieldvalues = []
        if fieldname in validated_data:
            elems = validated_data.pop(fieldname)
            for data in elems:
                if "id" in data:
                    del(data["id"])
                elem = model.objects.create(**data)
                fieldvalues.append(elem)
        return fieldvalues

    def referenceField_Create(self, fieldname, model, validated_data):
        fieldvalue = None
        if fieldname in validated_data:
            data = validated_data.pop(fieldname)
            if data:
                if "id" in data:
                    del(data["id"])
                fieldvalue = model.objects.create(**data)
        return fieldvalue

    def referenceField_CreateUpdate(self, fieldname, model, instance, validated_data):
        fieldvalue = validated_data.get(fieldname)

        current_field = getattr(instance, fieldname)
        if fieldvalue:
            fid = fieldvalue.get('id', None)
            if fid and fid == current_field.id:  # If field id exists: update after some error checks, that nobody is fooling us
                try:
                    field_inst = model.objects.get(pk=fid)
                    # Iterate over each field and update
                    for fieldprop in fieldvalue:
                        setattr(field_inst, fieldprop, fieldvalue[fieldprop])
                    setattr(instance, fieldname, field_inst)
                except:
                    raise serializers.ValidationError(f"{fieldname} ID not linked to current instance, abort update: {e}")
            else:
                if current_field is None and not fid: # We didn't have a DB entry, and someone tries to create a new entry = OK
                    setattr(instance, fieldname, model.objects.create(**fieldvalue))
                else:
                    raise serializers.ValidationError(f"{fieldname} database entry not linked to current instance, abort update")
        return instance

    def stringReferencesField_Update(self, fieldname, instance, validated_data):
        val = []
        if fieldname in validated_data:
            data = validated_data.pop(fieldname)
            if data is not None:
                val = data
        getattr(instance, fieldname).set(val)
        return instance

    def manyField_CreateUpdateDelete(self, fieldname, model, instance, validated_data):
        fieldvalues = validated_data.get(fieldname)
        allelems = []
        # First get all current field values in DB, so that we can check if we need to delete entries
        field_dict = dict((i.id, i) for i in getattr(instance, fieldname).all())
        if fieldvalues:
            if len(fieldvalues) > 10:
                raise serializers.ValidationError(f"You are trying to create too many {fieldname}  elements, aborting.")

            if len(fieldvalues) + len(field_dict) > 21:
                raise serializers.ValidationError(f"You are trying to update too many {fieldname} elements, aborting.")

            for elem in fieldvalues:
                fid = elem.get('id', None)
                if fid: # If ID exist, we check that there is a link to our instance and we update
                    # if exists id remove from the dict and update, so that later we don't delete it
                    try:
                        elem_inst = field_dict.pop(fid)
                    except:
                        raise serializers.ValidationError("Element ID not linked to current participant, abort update")

                    # Iterate over each element field and update
                    for fieldprop in elem:
                        setattr(elem_inst, fieldprop, elem[fieldprop])
                    elem_inst.save()
                    allelems.append(elem_inst)

                else: # Else create new element
                    elem_inst = model.objects.create(**elem)
                    allelems.append(elem_inst)

        # delete remaining elements because they're not present in the update call
        if len(field_dict) > 0:
            for elem in field_dict.values():
                elem.delete()

        # Update Array in Parent instance
        ins_field = getattr(instance, fieldname).set(allelems)
        return instance

    def updateWithExclusion(self, exclusion, instance, validated_data):
        # Update rest fields of instance
        for field in validated_data:
            if field not in exclusion:
                setattr(instance, field, validated_data[field])

        instance.save() # Save instance

        return instance

    def checkFieldPermission(self, to_check_fieldname, permission_fieldname, method, validated_data, instance, current_user):
        if to_check_fieldname in validated_data:
            if method in self.Meta.model.serializerFieldPermissions[permission_fieldname]:
                permissions = self.Meta.model.serializerFieldPermissions[permission_fieldname][method]

                if len(permissions) > 0:
                    allowed = False
                    for perm in permissions:
                        allowed = allowed or perm.checkPermission(method, current_user, validated_data, instance)

                    if not allowed:
                        validated_data.pop(to_check_fieldname)
        return validated_data

    def checkPermissions(self, method, validated_data, instance):
        current_user = self.context['request'].user
        if hasattr(self.Meta.model, "serializerFieldPermissions"):
            for to_check_fieldname in self.Meta.model.serializerFieldPermissions:
                validated_data = self.checkFieldPermission(to_check_fieldname, to_check_fieldname, method, validated_data, instance, current_user)
            
            if "*" in self.Meta.model.serializerFieldPermissions:
                for field in dict(validated_data):
                    if field not in self.Meta.model.serializerFieldPermissions:
                        validated_data = self.checkFieldPermission(field, "*", method, validated_data, instance, current_user)
                    
        return validated_data

    # Override to filter out values which user is not allowed to see
    def to_representation(self, request_data):
        # get the original representation
        ret = super().to_representation(request_data)
        ret = self.checkPermissions("read", ret, request_data)

        return ret

    # Override as ID is not mandatory on create, only on update
    def get_fields(self, *args, **kwargs):
        fields = super().get_fields(*args, **kwargs)
        request = self.context.get('request', None)
        if request and getattr(request, 'method', None) == "POST":
            fields['id'].required = False
        return fields


    