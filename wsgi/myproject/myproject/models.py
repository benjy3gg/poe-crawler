from django.db import models
from sorl.thumbnail import ImageField
from django.db.models import Max

class Character(models.Model):
    name = models.CharField(max_length=200)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    classId = models.IntegerField(default=-1)
    ascendancyClass = models.IntegerField(default=-1)
    classs = models.CharField(default="", max_length=100)
    league = models.CharField(default="", max_length=100)

    class Meta:
        verbose_name_plural = "Characters"

    def __unicode__(self):
        return "{} ({})".format(self.name, self.active)

    def __str__(self):
        return "{} ({})".format(self.name, self.active)

    def get_skilltrees(self):
        skilltrees = SkillTree.objects.filter(character=self)
        return skilltrees

    def get_max_level(self):
        return SkillTree.objects.filter(character=self).aggregate(Max("level"))


class Account(models.Model):
    name = models.CharField(max_length=200)
    characters = models.ManyToManyField(to=Character, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Accounts"

    def __unicode__(self):
        return "{} ({})".format(self.name, len(self.characters.all()))

    def __str__(self):
        return "{} ({})".format(self.name, len(self.characters.all()))


class SkillTree(models.Model):
    account = models.ForeignKey(to=Account)
    character = models.ForeignKey(to=Character)
    url = models.CharField(max_length=20000)
    level = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    image_url = models.CharField(max_length=20000)
    image_file = models.ImageField(upload_to='images')
    broken = models.BooleanField(default=False)
    characterJSON = models.CharField(max_length=200000, default="")
    itemsJSON = models.CharField(max_length=200000, default="")

    class Meta:
        verbose_name_plural = "SkillTrees"

    def __unicode__(self):
        return "{} - {} ()".format(self.account.name, self.character.name, self.level)

    def __str__(self):
        return "{} - {} ()".format(self.account.name, self.character.name, self.level)
