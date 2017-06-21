"""myproject URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf.urls import include, url
from django.contrib import admin
from .views import SkillTreeListView, SkillTreeDetailView, skilltree_setimage, CharacterDetailView, CharacterListView, AccountListView, character_get_passive_skills, character_get_items, account_get_characters
from django.views.generic import TemplateView
from .settings import MEDIA_ROOT, MEDIA_URL
from django.conf.urls.static import static
import debug_toolbar


urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', SkillTreeListView.as_view(), name="skilltree-list"),
    url(r'^character/(?P<pk>[-\w]+)/$', CharacterDetailView.as_view(), name="character-detail"),
    url(r'^characters/$', CharacterListView.as_view(), name="character-list"),
    url(r'^accounts/$', AccountListView.as_view(), name="account-list"),
    url(r'^skilltree/(?P<pk>[-\w]+)/$', SkillTreeDetailView.as_view(), name='skilltree-detail'),
    url(r'^skilltree/(?P<skilltree_id>[0-9]+)/setimage/(?P<img_hash>[0-9a-z]+)/$', skilltree_setimage, name='skilltree-setimage'),
    url(r'^__debug__/', include(debug_toolbar.urls)),

    url(r'^character-window/get-passive-skills/$', character_get_passive_skills, name="character-get-passive-skills"),
    url(r'^character-window/get-items/$', character_get_items, name="character-get-items"),
    url(r'^character-window/get-characters/$', account_get_characters, name="character-get-characters"),
    url(r'^character-overview/$', TemplateView.as_view(template_name="test.html"))
    url(r'^character-overview/$', TemplateView.as_view(template_name="test.html"))


]
urlpatterns += static(MEDIA_ROOT, document_root=MEDIA_URL)
