# Generated by Django 3.0.8 on 2020-08-31 20:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0022_auto_20200831_2003'),
    ]

    operations = [
        migrations.AlterField(
            model_name='group',
            name='firstPlacementChoice',
            field=models.CharField(blank=True, choices=[('Osterinsel', 'Osterinsel'), ('Prismanien', 'Prismanien'), ('Wasteland', 'Wasteland'), ('Erde Feuer Wasser Luft', 'Erde Feuer Wasser Luft'), ('Brownsea Island', 'Brownsea Island'), ('Atlantis', 'Atlantis'), ('Neupfadland', 'Neupfadland'), ('St. Goldvein', 'St. Goldvein'), ('Espuertes', 'Espuertes')], help_text='Unterlager-Wunsch der Gruppierung. 1. Wahl', max_length=60, verbose_name='Unterlager, 1. Wahl'),
        ),
        migrations.AlterField(
            model_name='group',
            name='secondPlacementChoice',
            field=models.CharField(blank=True, choices=[('Osterinsel', 'Osterinsel'), ('Prismanien', 'Prismanien'), ('Wasteland', 'Wasteland'), ('Erde Feuer Wasser Luft', 'Erde Feuer Wasser Luft'), ('Brownsea Island', 'Brownsea Island'), ('Atlantis', 'Atlantis'), ('Neupfadland', 'Neupfadland'), ('St. Goldvein', 'St. Goldvein'), ('Espuertes', 'Espuertes')], help_text='Unterlager-Wunsch der Gruppierung. 2. Wahl', max_length=60, verbose_name='Unterlager, 2. Wahl'),
        ),
        migrations.AlterField(
            model_name='group',
            name='thirdPlacementChoice',
            field=models.CharField(blank=True, choices=[('Osterinsel', 'Osterinsel'), ('Prismanien', 'Prismanien'), ('Wasteland', 'Wasteland'), ('Erde Feuer Wasser Luft', 'Erde Feuer Wasser Luft'), ('Brownsea Island', 'Brownsea Island'), ('Atlantis', 'Atlantis'), ('Neupfadland', 'Neupfadland'), ('St. Goldvein', 'St. Goldvein'), ('Espuertes', 'Espuertes')], help_text='Unterlager-Wunsch der Gruppierung. 3. Wahl', max_length=60, verbose_name='Unterlager, 3. Wahl'),
        ),
    ]