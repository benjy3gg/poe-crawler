# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Account',
            fields=[
                ('id', models.AutoField(verbose_name='ID', auto_created=True, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name_plural': 'Accounts',
            },
        ),
        migrations.CreateModel(
            name='Character',
            fields=[
                ('id', models.AutoField(verbose_name='ID', auto_created=True, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
                ('active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name_plural': 'Characters',
            },
        ),
        migrations.CreateModel(
            name='SkillTree',
            fields=[
                ('id', models.AutoField(verbose_name='ID', auto_created=True, primary_key=True, serialize=False)),
                ('url', models.CharField(max_length=20000)),
                ('level', models.IntegerField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('image_url', models.CharField(max_length=20000)),
                ('image_file', models.ImageField(upload_to='images')),
                ('broken', models.BooleanField(default=False)),
                ('account', models.ForeignKey(to='myproject.Account')),
                ('character', models.ForeignKey(to='myproject.Character')),
            ],
            options={
                'verbose_name_plural': 'SkillTrees',
            },
        ),
        migrations.AddField(
            model_name='account',
            name='characters',
            field=models.ManyToManyField(blank=True, to='myproject.Character'),
        ),
    ]