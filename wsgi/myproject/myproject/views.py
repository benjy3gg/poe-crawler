from django.views.generic.list import ListView
from django.views.generic.detail import DetailView
from django.views.decorators.http import require_POST
from django.shortcuts import get_object_or_404, redirect, get_list_or_404
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Avg, Max, Min
from django.core.files import File
from django.http import HttpResponse
from urllib.request import urlretrieve
from django.http import JsonResponse
import os
import logging
import json

import cloudinary
import cloudinary.uploader
import cloudinary.api
import pyimgur
CLIENT_ID = "0f278547208555a"


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

class AccountDetailView(DetailView):

    model = Account
    template_name = "account_detail.html"

    def get_context_data(self, **kwargs):
        context = super(AccountDetailView, self).get_context_data()
        account_pk = context["account"].id
        context["account"] = Account.objects.get(pk=account_pk)
        character = Character.objects.filter(account__pk=account_pk).last()
        skillTrees = SkillTree.objects.filter(character__id=character.pk).order_by('level')
        aggregate = skillTrees.aggregate(Max('level'), Min('level'))
        print(aggregate)
        context["min_level"] = aggregate["level__min"]
        context["max_level"] = aggregate["level__max"]
        skillTrees_ = {}
        lastLevel = -1
        for skillTree in skillTrees:
            if skillTree.level == lastLevel:
                skillTrees_[skillTree.level] = skillTree
            else:
                skillTrees_[skillTree.level] = skillTree
            lastLevel = skillTree.level
        context["skilltrees"] = skillTrees_
        context["skilltree"] = skillTrees_[context["min_level"]]
        context["character"] = character

        return context


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
    template_name = "test.html"

    def get_context_data(self, **kwargs):
        context = super(CharacterDetailView, self).get_context_data()
        character_pk = context["character"].id
        skillTrees = SkillTree.objects.filter(character__id=character_pk).order_by('level')
        aggregate = skillTrees.aggregate(Max('level'), Min('level'))
        print(aggregate)
        context["min_level"] = aggregate["level__min"]
        context["max_level"] = aggregate["level__max"]
        skillTrees_ = {}
        lastLevel = -1
        for skillTree in skillTrees:
            if skillTree.level == lastLevel:
                skillTrees_[skillTree.level] = skillTree
            else:
                skillTrees_[skillTree.level] = skillTree
            lastLevel = skillTree.level
        context["skilltrees"] = skillTrees_
        context["skilltree"] = skillTrees_[context["min_level"]]
        context["character"] = Character.objects.get(pk=character_pk)
        context["account"] = Account.objects.get(characters__id=character_pk)
        return context

@csrf_exempt
@require_POST
def skilltree_setimage(request, skilltree_id, img_hash):
    logger.error(skilltree_id)
    skilltree = get_object_or_404(SkillTree, id=skilltree_id)
    skilltree.image_url = "https://poe-creeper2.herokuapp.com/{}.png".format(img_hash)

    im = pyimgur.Imgur(CLIENT_ID)
    uploaded_image = im.upload_image(url=skilltree.image_url, title="Uploaded with PyImgur")
    print(uploaded_image.title)
    print(uploaded_image.link)
    print(uploaded_image.size)
    print(uploaded_image.type)
    # result = cloudinary.uploader.upload(skilltree.image_url)
    skilltree.image_url = uploaded_image.link
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

def character_get_passive_skills(request):
    account = request.GET.get('account', '')
    character = request.GET.get('character', '')
    level = request.GET.get('level', 0)
    skilltree = SkillTree.objects.filter(account__name=account, character__name=character, level=int(level)).order_by("-created_at").first()
    return JsonResponse(json.loads(skilltree.characterJSON))

def character_get_items(request):
    account = request.GET.get('account', '')
    character = request.GET.get('character', '')
    level = request.GET.get('level', 0)
    skilltree = SkillTree.objects.filter(account__name=account, character__name=character, level=int(level)).order_by("-created_at").first()
    return JsonResponse(json.loads(skilltree.itemsJSON))

def account_get_characters(request):
    accountName = request.GET.get('accountName', '')
    account = Account.objects.get(name=accountName)
    array = []
    for idx, character in enumerate(account.characters.all().order_by("-created_at")):
        char = {}
        char['ascendancyClass'] = character.ascendancyClass
        char['class'] = character.classs
        char['classId'] = character.classId
        char['league'] = character.league
        char['level'] = character.get_max_level()["level__max"]
        char['levels'] = character.get_levels()
        char['name'] = character.name
        array.append(char)
    return JsonResponse(json.dumps(array), safe=False)
