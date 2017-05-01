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

    model = SkillTree
    template_name = "skilltree_list.html"

    def get_queryset(self):
        objects = SkillTree.objects.order_by("created_at").all()
        return objects


class SkillTreeDetailView(DetailView):

    model = SkillTree
    template_name = "skilltree_detail.html"


class CharacterDetailView(DetailView):

    model = Character
    template_name = "character_detail.html"
    pk_url_kwarg = "character_name"

    def get_object(self, queryset=None):
        return Character.objects.filter(name=self.kwargs["character_name"])

    def get_context_data(self, **kwargs):
        character_name = kwargs.pop("character_name")
        context = super(CharacterDetailView, self).get_context_data()
        context["skilltrees"] = SkillTree.objects.filter(name=character_name)
        return context


@csrf_exempt
@require_POST
def skilltree_setimage(request, skilltree_id, img_hash):
    logger.error(skilltree_id)
    skilltree = get_object_or_404(SkillTree, id=skilltree_id)
    skilltree.image_url = "https://poe-creeper2.herokuapp.com/{}.png".format(img_hash)
    skilltree.save()

    return HttpResponse('')

