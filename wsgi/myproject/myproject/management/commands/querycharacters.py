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
            characterDataUrl = "http://www.pathofexile.com/character-window/get-characters?accountName={}".format(account.name)
            characters = getCharacterData(characterDataUrl)
            for char in characters:
                c = Character.objects.create(name=char, active=True)
                account.characters.add(c)
                account.save()
            for character in account.characters.all():
                if character.active:
                    try:
                        data = getSkillTreeDataForCharacter(account.name, character.name)
                        if not data:
                            self.stdout.write('Error getting data for'.format(account.name, character.name))
                        else:
                            try:
                                """previous = SkillTree.objects.get(account=account, character=character, url=data["fullUrl"], level=int(data["level"])-1)
                                if previous:
                                    previous.broken = True
                                    previous.save()
                                    self.stdout.write('Deleted previous skillTree "%s"' % skillTree.character.name)"""
                                skillTree, created = SkillTree.objects.get_or_create(account=account, character=character,
                                                                            url=data["fullUrl"], level=int(data["level"]))
                                """if created:
                                    image_url = requestImage(data["url"], skillTree.pk)
                                    self.stdout.write('Successfully created skillTree "%s"' % skillTree.character.name)"""
                            except Exception as e:
                                print(e)
                                self.stdout.write('Found same skillTree already')
                    except TypeError:
                        character.active = False
                        character.save()
                        self.stdout.write('Character is not available "%s"' % character.name)


def requestImage(skilltreeUrl, skillTreeId):
    hash = getUrl("https://poe-creeper2.herokuapp.com/?url=http://poedb.tw/us/passive-skill-tree/{}&skilltree_id={}".format(skilltreeUrl, skillTreeId))
    return "https://poe-creeper2.herokuapp.com/{}.png".format(hash)

def getUrl(requestUrl):
    fp = urllib.request.urlopen(requestUrl)
    mybytes = fp.read()
    mystr = mybytes.decode("utf8")
    fp.close()
    #print(mystr)
    return mystr

def getCharacterData(characterDataUrl):
    characterJson = getJsonFromUrl(characterDataUrl)
    chars = []
    if characterJson:
        for char in characterJson:
            if char["league"] in ["Hardcore Legacy", "Legacy", "SSF HC Legacy"]:
                if not Character.objects.filter(name=char["name"]).exists():
                    chars.append(char["name"])
    return chars

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
    itemsUrl = "http://www.pathofexile.com/character-window/get-items?character={}&accountName={}".format(
        characterName, accountName)

    characterJson = getJsonFromUrl(characterDataUrl)
    characterPassivesJson = getJsonFromUrl(characterPassivesUrl)
    itemsJson = getJsonFromUrl(itemsUrl)
    hashes = characterPassivesJson["hashes"]

    if characterJson:
        for char in characterJson:
            if char["name"] == characterName:
                character = char
    else:
        return false

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


    return  {"fullUrl": fullUrl, "level": character["level"], "url": encoded, "characterJSON": json.dumps(characterPassivesJson), "itemsJSON": json.dumps(itemsJson)}
