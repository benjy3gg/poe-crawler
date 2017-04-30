from django.db import models


class Entry(models.Model):

    accountName = models.CharField(max_length=200)
    characterName = models.CharField(max_length=200)
    url = models.CharField(max_length=20000)
    level = models.IntegerField()