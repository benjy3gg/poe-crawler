import urllib.request
import json
import base64
import struct
import webbrowser

"""def getSkillTreeURL:
    define("PoE/PassiveSkillTree/GenerateLink", ["plugins", "PoE/PassiveSkillTree/ByteEncoder", "PoE/PassiveSkillTree/Version"], function(e, t, n) {

    return function(r, i, s, o) {
        var u = new t;
        u.appendInt(n),
        u.appendInt8(r),
        u.appendInt8(i),
        u.appendInt8(o ? 1 : 0);
        for (var a = 0, f = s.length; a < f; ++a)
            u.appendInt16(s[a]);
        var l = e.base64.encode(u.getDataString());
        return l = l.replace(/\+/g, "-").replace(/\//g, "_"),
        (o ? "/fullscreen-passive-skill-tree/" : "/passive-skill-tree/") + l
    }
}),"""



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
    characterPassivesUrl = "http://www.pathofexile.com/character-window/get-passive-skills?reqData=0&character={}&accountName={}".format(characterName, accountName)

    characterJson = getJsonFromUrl(characterDataUrl)
    characterPassivesJson = getJsonFromUrl(characterPassivesUrl)
    hashes = characterPassivesJson["hashes"]

    for char in characterJson:
        if char["name"] == characterName:
            print (json.dumps(char, indent=4, sort_keys=True))
            character = char
    #print (json.dumps(characterJson, indent=4, sort_keys=True))


    passives = b""
    # add SkilltreeVersion
    passives += struct.pack("!i", 4)
    passives += struct.pack("!B", character["classId"])
    passives += struct.pack("!B", character["ascendancyClass"])
    passives += struct.pack("!B", 0)
    
    for h in hashes:
        passives += struct.pack("!H", h)

    encoded = base64.b64encode(passives)
    encoded = str(encoded,'utf-8')
    encoded = encoded.replace("/", "_")
    encoded = encoded.replace("+", "-")

    fullUrl = "http://www.pathofexile.com/passive-skill-tree/" + encoded + "?accountName={}&characterName={}".format(accountName, characterName)
    webbrowser.open(fullUrl)

    #add the url to the database with the character info like skilltree and especially character level

getSkillTreeDataForCharacter("benjy3gg", "EingefrorenerScheiss")




