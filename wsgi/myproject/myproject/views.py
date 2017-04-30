from django.views.generic.list import ListView
from django.views.generic.detail import DetailView
from django.views.decorators.http import require_POST
from django.shortcuts import get_object_or_404, redirect
from .models import SkillTree


class SkillTreeListView(ListView):

    model = SkillTree
    template_name = "skilltree_list.html"


class SkillTreeDetailView(DetailView):

    model = SkillTree
    template_name = "skilltree_detail.html"


@require_POST
def skilltree_setimage(request, skilltree_id):
    skilltree = get_object_or_404(SkillTree, id=skilltree_id)
    skilltree.image_url = request.POST.get("image_url", "")
    skilltree.save()

