from django.db import models
from django_thumbs.db.models import ImageWithThumbsField

class Character(models.Model):
    name = models.CharField(max_length=200)
    active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Characters"

    def __unicode__(self):
        return "{} ({})".format(self.name, self.active)

    def __str__(self):
        return "{} ({})".format(self.name, self.active)


class Account(models.Model):
    name = models.CharField(max_length=200)
    characters = models.ManyToManyField(to=Character, blank=True)

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
    image_file = models.ImageWithThumbsField(upload_to='images', sizes=((500,500), (1500,1500)))

    class Meta:
        verbose_name_plural = "SkillTrees"

    def __unicode__(self):
        return "{} - {} ()".format(self.account.name, self.character.name, self.level)

    def __str__(self):
        return "{} - {} ()".format(self.account.name, self.character.name, self.level)
