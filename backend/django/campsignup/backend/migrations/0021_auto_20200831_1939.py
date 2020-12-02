# Generated by Django 3.0.8 on 2020-08-31 19:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0020_auto_20200812_2018'),
    ]

    operations = [
        migrations.AlterField(
            model_name='participant',
            name='dateOfBirth',
            field=models.DateField(blank=True, help_text='Geburtsdatum des Teilnehmers.', null=True, verbose_name='Geburtstag'),
        ),
        migrations.AlterField(
            model_name='participant',
            name='foodOptions',
            field=models.CharField(blank=True, choices=[('vegetarian', 'vegetarian'), ('vegan', 'vegan'), ('meat', 'meat')], help_text='Auswahl der Essens-Art.', max_length=60, verbose_name='Essen'),
        ),
    ]
