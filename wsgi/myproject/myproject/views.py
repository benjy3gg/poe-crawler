from django.views.generic.list import ListView
from django.views.generic.detail import DetailView
from django.views.decorators.http import require_POST
from django.shortcuts import get_object_or_404, redirect
from django.views.decorators.csrf import csrf_exempt
from .models import SkillTree, Character
import logging
from django.http import HttpResponse

logger = logging.getLogger(__name__)


class SkillTreeListView(ListView):

    model = SkillTree
    template_name = "skilltree_list.html"

    def get_queryset(self):
        objects = SkillTree.objects.order_by("created_at").all()
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
        character_pk = kwargs["pk"]
        context["skilltrees"] = SkillTree.objects.filter(character__id=character_pk)
        return context

@csrf_exempt
@require_POST
def skilltree_setimage(request, skilltree_id, img_hash):
    logger.error(skilltree_id)
    skilltree = get_object_or_404(SkillTree, id=skilltree_id)
    skilltree.image_url = "https://poe-creeper2.herokuapp.com/{}.png".format(img_hash)
    skilltree.save()

    return HttpResponse('')

