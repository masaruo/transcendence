# Generated by Django 5.1.9 on 2025-05-22 09:01

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='is_online',
        ),
        migrations.AddField(
            model_name='user',
            name='last_seen',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
