#!/usr/bin/env python

from setuptools import setup

setup(
    # GETTING-STARTED: set your app name:
    name='YourAppName',
    # GETTING-STARTED: set your app version:
    version='1.0',
    # GETTING-STARTED: set your app description:
    description='OpenShift App',
    # GETTING-STARTED: set author name (your name):
    author='Your Name',
    # GETTING-STARTED: set author email (your email):
    author_email='example@example.com',
    # GETTING-STARTED: set author url (your url):
    url='http://www.python.org/sigs/distutils-sig/',
    # GETTING-STARTED: define required django version:
    install_requires=[
        'Django==1.8.4',
        'Pillow==4.1.1',
        'sorl-thumbnail==12.3',
        'django-debug-toolbar==1.7',
        'cloudinary==1.8.0',
        'six==1.10.0'
    ],
    dependency_links=[
        'https://pypi.python.org/simple/django/'
    ],
)
