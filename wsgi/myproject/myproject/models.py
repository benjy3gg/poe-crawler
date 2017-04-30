from django.db import models


class Entry(models.Model):

    accountName = models.CharField(max_length=200)