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
from .views import SkillTreeListView, SkillTreeDetailView, skilltree_setimage, CharacterListView


urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', SkillTreeListView.as_view(), name="skilltree-list"),
    url(r'character/(?P<character_name>[0-9a-zA-Z]+)/^$', CharacterListView.as_view(), name="character-list"),
    url(r'^(?P<pk>[-\w]+)/$', SkillTreeDetailView.as_view(), name='skilltree-detail'),
    url(r'^skilltree/(?P<skilltree_id>[0-9]+)/setimage/(?P<img_hash>[0-9a-z]+)/$', skilltree_setimage, name='skilltree-setimage'),
]
