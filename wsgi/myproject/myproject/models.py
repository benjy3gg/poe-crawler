from django.db import models


class Character(models.Model):
    name = models.CharField(max_length=200)
    active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Characters"


class Account(models.Model):
    name = models.CharField(max_length=200)
    characters = models.ManyToManyField(to=Character)

    class Meta:
        verbose_name_plural = "Accounts"


class SkillTree(models.Model):
    account = models.ForeignKey(to=Account)
    character = models.ForeignKey(to=Character)
    url = models.CharField(max_length=20000)
    level = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "SkillTrees"

    def __unicode__(self):
        return "{} - {} ()".format(self.account.name, self.character.name, self.level)


