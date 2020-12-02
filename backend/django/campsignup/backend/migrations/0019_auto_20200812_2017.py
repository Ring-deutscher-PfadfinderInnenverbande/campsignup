# Generated by Django 3.0.8 on 2020-08-12 20:17

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('backend', '0018_auto_20200812_1752'),
    ]

    operations = [
        migrations.AlterField(
            model_name='group',
            name='more_owners',
            field=models.ManyToManyField(blank=True, default=None, help_text="Ein weiteres Array Feld, in dem das FrontEnd E-Mails ablegen kann, falls für die jeweilige Mail ein Benutzer gefunden wird, wird er hier verlinkt und erhält dann automatisch 'Owner' Rechte auf die Gruppe", null=True, related_name='more_grps', to=settings.AUTH_USER_MODEL, verbose_name='Weitere Besitzer'),
        ),
        migrations.AlterField(
            model_name='participant',
            name='dateOfBirth',
            field=models.DateField(blank=True, help_text='Geschlecht, ist momentan Freitext im Backend.', null=True, verbose_name='Geburtstag'),
        ),
        migrations.AlterField(
            model_name='participant',
            name='emergencyContacts',
            field=models.ManyToManyField(blank=True, default=None, help_text='Falls weitere Notfall-Kontaktdaten benötigt werden', null=True, related_name='participants_emergency', to='backend.Contact', verbose_name='Weitere Notfall-Kontaktdaten'),
        ),
        migrations.AlterField(
            model_name='participant',
            name='familyMember',
            field=models.ManyToManyField(blank=True, default=None, help_text='Für die Buchung des Familienpreises muss hier der Name des bereits angemeldeten, den Vollpreis zahlenden Familienmitglieds angegeben werden.', null=True, related_name='familyMembers', to='backend.Participant', verbose_name='Name eines weiteren Familienmitglieds'),
        ),
        migrations.AlterField(
            model_name='participant',
            name='foodOptions',
            field=models.CharField(blank=True, choices=[('Frühstück', 'Frühstück'), ('Mittagessen', 'Mittagessen'), ('Abendessen', 'Abendessen')], help_text='Auswahl der Essens-Art.', max_length=60, verbose_name='Essen'),
        ),
        migrations.AlterField(
            model_name='participant',
            name='guardianContact',
            field=models.ForeignKey(blank=True, default=None, help_text='Die Kontaktdaten des/der Erziehungsberechtigten', null=True, on_delete=django.db.models.deletion.PROTECT, related_name='participants_guardian', to='backend.Contact', verbose_name='Erziehungsberechtigter Kontaktdaten'),
        ),
        migrations.AlterField(
            model_name='participant',
            name='ownContact',
            field=models.ForeignKey(blank=True, default=None, help_text='Die Kontaktdaten des Teilnehmers', null=True, on_delete=django.db.models.deletion.PROTECT, related_name='participants_own', to='backend.Contact', verbose_name='Eigene Kontaktdaten'),
        ),
        migrations.AlterField(
            model_name='participant',
            name='participantType',
            field=models.CharField(blank=True, choices=[('Stammesmitglied (außer Leiter)', 'Stammesmitglied (außer Leiter)'), ('Leiter*in', 'Leiter*in'), ('Kinder unter sechs Jahren', 'Kinder unter sechs Jahren'), ('Ehemalige', 'Ehemalige'), ('Helfende', 'Helfende')], help_text='Teilnehmer Typ, evtl. können wir darüber Berechtigungen ableiten?', max_length=60, verbose_name='Teilnehmerkategorie'),
        ),
    ]
