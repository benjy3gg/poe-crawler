from django.views.generic.list import ListView
from django.views.generic.detail import DetailView
from django.views.decorators.http import require_POST
from django.shortcuts import get_object_or_404, redirect
from django.views.decorators.csrf import csrf_exempt
from .models import SkillTree
import logging
from django.http import JsonResponse

logger = logging.getLogger(__name__)


class SkillTreeListView(ListView):

    model = SkillTree
    template_name = "skilltree_list.html"


class SkillTreeDetailView(DetailView):

    model = SkillTree
    template_name = "skilltree_detail.html"


@csrf_exempt
@require_POST
def skilltree_setimage(request, skilltree_id):
    logger.error(skilltree_id)
    skilltree = get_object_or_404(SkillTree, id=skilltree_id)
    logger.error(skilltree)
    logger.error(request.POST)
    hash = request.POST.get("hash", "")
    logger.error(hash)
    skilltree.image_url = "https://poe-creeper2.herokuapp.com/{}.png".format(hash)
    skilltree.save()
    response_data = {True}

    return JsonResponse(response_data, status=201)

