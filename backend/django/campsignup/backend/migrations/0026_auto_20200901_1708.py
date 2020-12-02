# Generated by Django 3.0.8 on 2020-09-01 17:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0025_auto_20200901_1648'),
    ]

    operations = [
        migrations.AlterField(
            model_name='participant',
            name='gender',
            field=models.CharField(blank=True, choices=[('female', 'weiblicher Schnitt'), ('male', 'männlicher Schnitt')], help_text='Wie das Lager-Shirt geschnitten sein soll', max_length=60, verbose_name='T-Shirt-Schnitt'),
        ),
        migrations.AlterField(
            model_name='participant',
            name='rank',
            field=models.IntegerField(blank=True, choices=[(1, 'Wölflinge (1)'), (2, 'Jungpfadfinder (2)'), (3, 'Pfadfinder (3'), (4, 'Rover (4)')], help_text='Die Altersstufe des Teilnehmers, da unterschiedlich je nach Verband, muss das im Frontend gefiltert sein.', max_length=60, null=True, verbose_name='Altersstufe'),
        ),
    ]
