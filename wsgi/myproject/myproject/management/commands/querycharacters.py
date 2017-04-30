from __future__ import print_function

from django.core.management.base import BaseCommand
#from myproject.models import Entry
import urllib.request
import struct
import base64
import json

class Command(BaseCommand):
    help = 'Closes the specified poll for voting'

    def handle(self, *args, **options):
        fullUrl = getSkillTreeDataForCharacter("benjy3gg", "EingefrorenerScheiss")
        self.stdout.write(self.style.SUCCESS('Successfully queried user "%s"' % fullUrl))


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

    return fullUrl

    # add the url to the database with the character info like skilltree and especially character level


getSkillTreeDataForCharacter("benjy3gg", "EingefrorenerScheiss")