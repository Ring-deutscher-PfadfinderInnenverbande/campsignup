# Generated by Django 3.0.8 on 2020-08-12 17:12

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0015_participant_familymember'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='participant',
            name='familyMember',
        ),
    ]
