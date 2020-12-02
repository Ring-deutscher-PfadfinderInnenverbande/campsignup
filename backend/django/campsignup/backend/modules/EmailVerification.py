from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework import permissions

from binascii import Error as binasciiError
from base64 import urlsafe_b64decode, urlsafe_b64encode
from threading import Thread

from pprint import pprint

def sendMail(mail, token):
    if settings.DEBUG:
        print(f"DEBUG: #MAILVERIFICATION# Mail verification send {settings.EMAILVERIFICATION_BASEURL}/{token}")
    else:
        # @TODO: Implement SMTP mailing for email verification
        pass

class EmailVerification():
    def createToken(self, user):
        token = default_token_generator.make_token(user)
        email = urlsafe_b64encode(str(user.email).encode('utf-8'))

        return f'{email.decode("utf-8")}/{token}'

    def sendConfirm(self, user):
        if not settings.DEBUG:
            user.is_active = False
            user.last_login = timezone.now()
            user.save()
        
        token = self.createToken(user)
        
        t = Thread(target=sendMail, args=(user.email, token))
        t.start()

    def verifyToken(self, mail, token):
        try:
            users = get_user_model().objects.filter(email=urlsafe_b64decode(mail).decode("utf-8"))
            for user in users:
                valid = default_token_generator.check_token(user, token)
                if valid:
                    user.is_active = True
                    user.last_login = timezone.now()
                    user.save()
                    return True
        except binasciiError:
            pass
        return False

    @classmethod
    def as_view(cls):
        class VerifyView(APIView):
            permission_classes = (permissions.AllowAny,)

            def get(request, *args, **kwargs):
                email = kwargs["email"]
                email_token = kwargs["email_token"]
                val = EmailVerification()
                result = val.verifyToken(email, email_token)
                if settings.DEBUG:
                    print("DEBUG: #MAILVERIFICATION# Verify token", email, email_token, result)

                return JsonResponse({"verification": result})
        return VerifyView.as_view()