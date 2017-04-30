from django.views.generic.list import ListView
from .models import Entry


class EntryListView(ListView):

    model = Entry
    template_name = "templates/entry_list.html"
