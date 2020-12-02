"""campsignup URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path, include

from rest_framework.schemas import get_schema_view
from rest_framework import permissions
from django.views.generic import TemplateView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
)

from campsignup import settings
from backend.modules.EmailVerification import EmailVerification
from backend.views import ParticipantDetailAPI, ParticipantListCreateAPI, GroupListCreateAPI, GroupDetailAPI, RegisterView
from django.contrib.auth import views as auth_views

# Code to dyamically load Readme.md into API documentation
api_description = "Rest API der Lager 2020 Anmeldung"
with open("Readme.md", "r") as fd:
    api_description = fd.read()

# On local debug build, everyone can access API description.
# In production, only admins can access.
openapi_permission = permissions.IsAdminUser
if settings.DEBUG:
    openapi_permission = permissions.AllowAny

urlpatterns = [
    # URLs of our REST API (DATA)
    re_path(r'^api/v1/participants/(?P<pk>[0-9]+)/?$', ParticipantDetailAPI.as_view()),
    re_path(r'^api/v1/participants/?$', ParticipantListCreateAPI.as_view()),

    re_path(r'^api/v1/groups/(?P<pk>[a-zA-Z0-9-]+)/?$', GroupDetailAPI.as_view()),
    re_path(r'^api/v1/groups/?$', GroupListCreateAPI.as_view()),

    # API Documentation, auto generated
    path('api/v1/openapi', get_schema_view(
        title="Campsignup Python Backend",
        description=api_description,
        permission_classes=[openapi_permission],
        version="1.0.0"
    ), name='openapi-schema'),
    path('api/v1/redoc', TemplateView.as_view(
        template_name='redoc.html',
        extra_context={'schema_url':'openapi-schema'}
    ), name='redoc'),

    # URLs of registration and login
    re_path(r'^api/v1/user/login/?$', TokenObtainPairView.as_view()),
    re_path(r'^api/v1/user/register/?$', RegisterView.as_view()),
    path('api/v1/user/verify/<str:email>/<str:email_token>', EmailVerification.as_view()),
]

if settings.ADMIN_ENABLED:
    urlpatterns.append(path('admin/', admin.site.urls))
    urlpatterns.append(path('api-auth/', include('rest_framework.urls')))
