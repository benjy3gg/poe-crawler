from __future__ import print_function

from django.core.management.base import BaseCommand
from myproject.models import SkillTree, Character, Account
import urllib.request
import struct
import base64
import json

class Command(BaseCommand):
    help = 'Closes the specified poll for voting'

    def handle(self, *args, **options):
        accounts = Account.objects.all()
        for account in accounts:
            for character in account.characters.all():
                if character.active:
                    try:
                        data = getSkillTreeDataForCharacter(account.name, character.name)
                        try:
                            skillTree = SkillTree.objects.get_or_create(account=account, character=character, url=data["fullUrl"], level=int(data["level"]))
                        except:
                            self.stdout.write('Found same skillTree already "%s"' % skillTree.character.name)
                        self.stdout.write('Successfully created skillTree "%s"' % skillTree.character.name)
                    except TypeError:
                        character.active = False
                        self.stdout.write('Character is not available "%s"' % character.name)


def getUrl(requestUrl):
    fp = urllib.request.urlopen(requestUrl)
    mybytes = fp.read()
    mystr = mybytes.decode("utf8")
    fp.close()
    print(mystr)


def getJsonFromUrl(requestUrl):
    fp = urllib.request.urlopen(requestUrl)
    mybytes = fp.read()
    mystr = mybytes.decode("utf8")
    jsonObj = json.loads(mystr)
    fp.close()
    return jsonObj


def getSkillTreeDataForCharacter(accountName, characterName):
    characterDataUrl = "http://www.pathofexile.com/character-window/get-characters?accountName={}".format(accountName)
    characterPassivesUrl = "http://www.pathofexile.com/character-window/get-passive-skills?reqData=0&character={}&accountName={}".format(
        characterName, accountName)

    characterJson = getJsonFromUrl(characterDataUrl)
    characterPassivesJson = getJsonFromUrl(characterPassivesUrl)
    hashes = characterPassivesJson["hashes"]

    for char in characterJson:
        if char["name"] == characterName:
            print (json.dumps(char, indent=4, sort_keys=True))
            character = char
    # print (json.dumps(characterJson, indent=4, sort_keys=True))


    passives = b""
    # add SkilltreeVersion
    passives += struct.pack("!i", 4)
    passives += struct.pack("!B", character["classId"])
    passives += struct.pack("!B", character["ascendancyClass"])
    passives += struct.pack("!B", 0)

    for h in hashes:
        passives += struct.pack("!H", h)

    encoded = base64.b64encode(passives)
    encoded = str(encoded, 'utf-8')
    encoded = encoded.replace("/", "_")
    encoded = encoded.replace("+", "-")

    fullUrl = "http://www.pathofexile.com/passive-skill-tree/" + encoded + "?accountName={}&characterName={}".format(
        accountName, characterName)


    return  {"fullUrl": fullUrl, "level": character["level"]}