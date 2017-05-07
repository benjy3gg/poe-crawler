from django.views.generic.list import ListView
from django.views.generic.detail import DetailView
from django.views.decorators.http import require_POST
from django.shortcuts import get_object_or_404, redirect
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Avg, Max, Min
from django.core.files import File
from django.http import HttpResponse
from urllib.request import urlretrieve
import os
import logging
import cloudinary
import cloudinary.uploader
import cloudinary.api

from .models import SkillTree, Character, Account
from .settings import MEDIA_ROOT, MEDIA_URL

logger = logging.getLogger(__name__)


class SkillTreeListView(ListView):

    model = SkillTree
    template_name = "skilltree_list.html"

    def get_queryset(self):
        objects = SkillTree.objects.order_by("created_at").all()
        return objects

class AccountListView(ListView):

    model = Account
    template_name = "account_list.html"

    def get_queryset(self):
        objects = Account.objects.order_by("name").all()
        return objects


class CharacterListView(ListView):

    model = Character
    template_name = "character_list.html"

    def get_queryset(self):
        objects = Character.objects.order_by("created_at").all()
        return objects


class SkillTreeDetailView(DetailView):

    model = SkillTree
    template_name = "skilltree_detail.html"


class CharacterDetailView(DetailView):

    model = Character
    template_name = "character_detail.html"

    def get_context_data(self, **kwargs):
        context = super(CharacterDetailView, self).get_context_data()
        character_pk = context["character"].id
        aggregate = SkillTree.objects.all().aggregate(Max('level'), Min('level'))
        print(aggregate)
        context["min_level"] = aggregate["level__min"]
        context["max_level"] = aggregate["level__max"]
        skillTrees = SkillTree.objects.filter(character__id=character_pk).order_by('level')
        skillTrees_ = []
        lastLevel = -1
        for skillTree in skillTrees:
            if skillTree.level == lastLevel:
                skillTrees_.pop()
                skillTrees_.append(skillTree)
            else:
                skillTrees_.append(skillTree)
            lastLevel = skillTree.level
        context["skilltrees"] = skillTrees_
        return context

@csrf_exempt
@require_POST
def skilltree_setimage(request, skilltree_id, img_hash):
    logger.error(skilltree_id)
    skilltree = get_object_or_404(SkillTree, id=skilltree_id)
    skilltree.image_url = "https://poe-creeper2.herokuapp.com/{}.png".format(img_hash)
    result = cloudinary.uploader.upload(skilltree.image_url)
    skilltree.image_url = result["url"]
    skilltree.save()
    #get_remote_image(skilltree)

    return HttpResponse('')

def get_remote_image(self):
    if self.image_url and not self.image_file:
        result = urlretrieve(self.image_url)
        imagefile = File(open(result[0], 'rb'))
        filename = MEDIA_ROOT + MEDIA_URL + self.character.name + "_" + str(self.level) + ".png"
        self.image_file.save(
                filename,
                imagefile
                )
        self.image_url = filename
        self.save()
