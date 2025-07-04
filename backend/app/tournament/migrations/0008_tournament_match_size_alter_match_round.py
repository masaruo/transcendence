# Generated by Django 5.1.9 on 2025-05-19 00:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0007_alter_score_match'),
    ]

    operations = [
        migrations.AddField(
            model_name='tournament',
            name='match_size',
            field=models.IntegerField(choices=[(2, 'Two'), (4, 'Four'), (8, 'Eight')], default=4),
        ),
        migrations.AlterField(
            model_name='match',
            name='round',
            field=models.IntegerField(choices=[(0, 'Preliminary'), (1, 'Quarterfinal'), (2, 'Semifinal'), (3, 'Final')], default=2),
        ),
    ]
