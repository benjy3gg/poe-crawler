from django.views.generic.list import ListView
from .models import Entry


class EntryListView(ListView):

    model = Entry
    template_name = "entry_list.html"

    def get_queryset(self):
        entries = Entry.object.all()
        return entries
