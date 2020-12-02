# Generated by Django 3.0.8 on 2020-08-03 20:42

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('backend', '0008_auto_20200803_1740'),
    ]

    operations = [
        migrations.AddField(
            model_name='group',
            name='owner',
            field=models.ForeignKey(help_text='Benutzer, dem diese Gruppe gehoert', null=True, on_delete=django.db.models.deletion.PROTECT, related_name='grps', to=settings.AUTH_USER_MODEL, verbose_name='Besitzer'),
        ),
    ]
