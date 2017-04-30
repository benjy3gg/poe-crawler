from django.views.generic.list import ListView
from django.views.generic.detail import DetailView
from .models import SkillTree


class SkillTreeListView(ListView):

    model = SkillTree
    template_name = "skilltree_list.html"


class SkillTreeDetailView(DetailView):

    model = SkillTree
    template_name = "skilltree_detail.html"
