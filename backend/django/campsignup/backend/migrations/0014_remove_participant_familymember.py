# Generated by Django 3.0.8 on 2020-08-12 17:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0013_auto_20200811_1850'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='participant',
            name='familyMember',
        ),
    ]
