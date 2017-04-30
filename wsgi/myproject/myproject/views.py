from django.views.generic.list import ListView
from .models import SkillTree


class SkillTreeListView(ListView):

    model = SkillTree
    template_name = "skilltree_list.html"
