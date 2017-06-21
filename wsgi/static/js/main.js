define("PoE/Environment/Font", ["require", "jquery", "webfont"], function(e) {
    var t = e("jquery")
      , n = e("webfont")
      , r = ["FontinRegular", "FontinSmallCaps", "FontinBold"]
      , i = {};
    for (var s = 0, o = r.length; s < o; ++s)
        i[r[s]] = t.Deferred();
    return {
        waitLoad: function(e) {
            if (i[e])
                return i[e].promise();
            console.warn("Font not found: " + e);
            var n = t.Deferred();
            return n.reject(),
            n.promise()
        },
        loadFonts: function() {
            n.load({
                custom: {
                    families: r
                },
                loading: function() {},
                active: function() {},
                inactive: function() {},
                fontloading: function(e, t) {},
                fontactive: function(e, t) {
                    i[e] && i[e].resolve()
                },
                fontinactive: function(e, t) {
                    i[e] && i[e].reject()
                }
            })
        }
    }
}),
define("PoE/Loader", ["require", "nprogress"], function(e) {
    var t = e("nprogress");
    return {
        start: function() {
            t.start()
        },
        done: function() {
            t.done()
        },
        abort: function() {
            t.done()
        },
        follow: function(e) {
            var t = this;
            this.start(),
            e.then(function() {
                t.done()
            }, function() {
                t.abort()
            })
        }
    }
}),
define("PoE/Item/DisplayProperty/ValueStyle", [], function() {
    return {
        Default: 0,
        Augmented: 1,
        Unmet: 2,
        PhysicalDamage: 3,
        FireDamage: 4,
        ColdDamage: 5,
        LightningDamage: 6,
        ChaosDamage: 7,
        MagicItem: 8,
        RareItem: 9,
        UniqueItem: 10
    }
}),
define("PoE/Item/DisplayProperty/DisplayMode", [], function() {
    return {
        NameValue: 0,
        ValueName: 1,
        Progress: 2,
        Inject: 3
    }
}),
define("PoE/Item/FrameType", [], function() {
    return {
        Normal: 0,
        Magic: 1,
        Rare: 2,
        Unique: 3,
        Gem: 4,
        Currency: 5,
        Quest: 7,
        DivinationCardFrame: 6,
        Prophecy: 8,
        Relic: 9
    }
}),
define("PoE/Item/Popup/Constants", [], function() {
    return {
        MinWidth: 262.88032454361,
        Padding: 6.0851926977688,
        MaxWidth: 547.66734279919,
        MaxDescriptionWidth: 365.11156186613
    }
}),
define("PoE/Item/Markup", ["Handlebars", "jquery"], function(e, t) {
    var n = {
        PoEMarkup: function(e, n) {
            n || (n = .5);
            var r = function(e) {
                var n = t(t(e).parent()).css("font-size");
                return n = n.substr(0, n.length - 2),
                Math.round(n)
            };
            e.find(".PoEMarkup").each(function() {
                var e = this
                  , i = t(e).data("markup")
                  , s = !1;
                if (i.indexOf("size") >= 0) {
                    var o = i.substr(i.indexOf(":") + 1, i.length);
                    o.indexOf("+") >= 0 ? o = r(e) + o.substr(1, o.length) : o.indexOf("-") >= 0 && (o = r(e) - o.substr(1, o.length)),
                    o *= n,
                    s = {
                        "font-size": o + "px"
                    }
                } else if (i.indexOf("bigger") >= 0) {
                    var o = r(e) + 3;
                    s = {
                        "font-size": o + "px"
                    }
                } else if (i.indexOf("smaller") >= 0) {
                    var o = r(e) - 3;
                    s = {
                        "font-size": o + "px"
                    }
                }
                s && t(e).css(s)
            })
        },
        splitTags: function(e) {
            var t = {
                items: [],
                lastIndex: 0
            };
            while (e.indexOf("<") >= 0 || e.indexOf(">") >= 0) {
                var n = 1
                  , r = {
                    tag: "",
                    content: "",
                    post: ""
                };
                e.charAt(e.indexOf("<") + 1) == "<" && (n = 2),
                r.tag = e.substr(e.indexOf("<") + n, e.indexOf(">") - n),
                t.lastIndex += e.indexOf(">") + n,
                e = e.substr(e.indexOf(">") + n),
                e.indexOf("{") == 0 && e.indexOf("}") > 0 && (e.indexOf("}") < e.indexOf("<") || e.indexOf("<") == -1) && (t.lastIndex += e.indexOf("}") + 1,
                r.content = e.substr(1, e.indexOf("}") - 1),
                e = e.substr(e.indexOf("}") + 1),
                e.indexOf("<") >= 0 && (t.lastIndex += e.indexOf("<"),
                r.post = e.substr(0, e.indexOf("<") - 1),
                e = e.substr(e.indexOf("<")))),
                t.items.push(r)
            }
            return t
        },
        convertTags: function(e, n) {
            console.warn("deprecated: convertTags");
            if (e && typeof e == "string") {
                var r = ""
                  , i = ""
                  , s = n && n.tags ? n.tags : !1;
                return s && !t.isEmptyObject(s) && (i = s.join(", ")),
                r += e.replace(/{/g, '<span class="PoEMarkup" data-markup="' + i + '">').replace(/}/g, "</span>"),
                r
            }
            return e
        },
        markupToObj: function(e, t) {
            var n = {
                pre: "",
                content: "",
                post: "",
                tags: {}
            };
            if (e.indexOf("<") >= 0) {
                n.pre += e.substr(0, e.indexOf("<")),
                e = e.substr(e.indexOf("<"));
                var r = 0;
                e.lastIndexOf("}") > 0 && (r = e.lastIndexOf("}")),
                e.lastIndexOf(">") > 0 && e.lastIndexOf(">") > r && (r = e.lastIndexOf(">")),
                r > 0 && (n.post = e.substr(r + 1),
                e = e.substr(0, r + 1)),
                e.indexOf("{") >= 0 ? (n.tags = this.splitTags(e),
                e = e.substr(n.tags.lastIndex),
                n.content = this.markupToObj(e, n),
                e = "") : (n.tags = this.splitTags(e),
                n.content = e.substr(n.tags.lastIndex),
                e = "")
            } else
                e.indexOf("{") == 0 ? (n.pre += this.convertTags(e, t),
                e = e.substr(e.indexOf("}") + 1)) : e.indexOf("{") > 0 && (n.pre += e.substr(0, e.indexOf("{")),
                e = this.convertTags(e, t)),
                n.content = e;
            if (n.pre.indexOf("{") >= 0 || n.pre.indexOf("}") >= 0)
                n.pre = this.convertTags(n.pre, t);
            if (n.post.indexOf("{") >= 0 || n.post.indexOf("}") >= 0)
                n.post = this.convertTags(n.post, t);
            return n
        },
        markupObjToHTML: function(t) {
            var n = "";
            typeof t.content == "object" && (t.content = this.markupObjToHTML(t.content));
            var r = t.pre;
            if (t.tags && t.tags.items && t.tags.items.length > 0) {
                var i = []
                  , s = []
                  , o = [];
                for (var u in t.tags.items) {
                    var a = t.tags.items[u]
                      , f = a.tag;
                    f.indexOf("set:") == 0 ? i.push(f.substr(f.indexOf("set:") + 4)) : f.indexOf("if:") === 0 || f.indexOf("elif:") === 0 || f.indexOf("else:") === 0 ? s.push(a) : o.push(a)
                }
                if (s.length > 0) {
                    var l = !1
                      , c = !1;
                    for (var u in s) {
                        var a = s[u]
                          , f = a.tag
                          , h = f.substr(0, f.indexOf(":"))
                          , p = f.substr(f.indexOf(":") + 1);
                        for (var d in i)
                            if (s.hasOwnProperty(u) && i.hasOwnProperty(d)) {
                                var v = i[d];
                                h == "if" && v == p ? l = a : h == "elif" && v == p && !l ? l = a : h == "else" && !l ? l = a : p == "MS" && c.length == 0 && (c = a)
                            }
                    }
                    l ? r += l.content + l.post : c ? r += c.content + c.post : r += s[s.length - 1].content + s[s.length - 1].post
                }
                for (var u in o)
                    o.hasOwnProperty(u) && (r += '<span class="PoEMarkup ' + o[u].tag.replace(":", "_") + '" data-markup="' + o[u].tag + '">' + o[u].content + "</span>")
            } else
                r += t.content;
            return r += t.post,
            r.length > 0 && (r = new e.SafeString(r.replace(/\r/g, "<br />"))),
            r
        },
        recMarkup: function(e) {
            e && e.flavourText && (e.flavourText = e.flavourText.join("\n"));
            if (e && e.toHTML)
                return e;
            if (typeof e == "string") {
                var t = this.markupToObj(e);
                return this.markupObjToHTML(t)
            }
            if (typeof e == "object") {
                for (var n in e)
                    e.hasOwnProperty(n) && n != "note" && (e[n] = this.recMarkup(e[n]));
                return e
            }
            return e
        }
    };
    return n
}),
define("PoE/Environment", [], function() {
    var e = typeof process != "undefined" && process.versions && process.versions.node
      , t = null
      , n = null;
    return {
        isNode: function() {
            return e
        },
        isBrowser: function() {
            return !e
        },
        getAppRoot: function() {
            return t
        },
        getJsDir: function() {
            return n
        },
        config: function(e) {
            if (!e)
                return;
            e.appRoot && (t = e.appRoot),
            e.jsDir && (n = e.jsDir)
        }
    }
}),
define("PoE/Handlebars/TemplateCollection", ["jquery", "Handlebars", "PoE/Environment"], function(e, t, n) {
    var r = {};
    return {
        load: function(n, i) {
            return n = n.replace(/^\/*/, ""),
            e.Deferred(function(e) {
                if (r[n] !== undefined) {
                    e.resolve(r[n]);
                    return
                }
                require(["text!" + n], function(i) {
                    r[n] = t.compile(i),
                    e.resolve(r[n])
                })
            }).promise()
        }
    }
}),
define("text!PoE/Item/DivinationCard.hbt", [], function() {
    return '<div class="cardFace">\r\n    <img src="{{cardFace}}" />\r\n</div>\r\n<div class="itemBoxContent">\r\n    <div class="itemHeader {{#if headerTwoLine}}doubleLine{{/if}}">\r\n        <span class="l"></span>\r\n        {{#if typeLine}}\r\n        <div class="itemName typeLine">\r\n            <span class="lc">{{typeLine}}</span>\r\n        </div>\r\n        {{/if}}\r\n        <span class="r"></span>\r\n    </div>\r\n    {{#if stackSize}}\r\n    <div class="stackSize">{{stackSize}}/{{maxStackSize}}</div>\r\n    {{/if}}\r\n    {{#if explicitMods}}\r\n    <div class="explicitModsWrapper">\r\n        <div class="explicitModsContainer">\r\n            {{#each explicitMods}}\r\n                {{#each this}}\r\n                    <div class="explicitMod"><span class="lc">{{{this}}}</span></div>\r\n                {{/each}}\r\n            {{/each}}\r\n        </div>\r\n    </div>\r\n    {{/if}}\r\n    {{#if flavourText}}\r\n    <div class="flavourTextWrapper">\r\n        <div class="flavourTextContainer">\r\n            <div class="flavourText"><span class="lc">{{flavourText}}</span></div>\r\n        </div>\r\n    </div>\r\n    {{/if}}\r\n</div>\r\n'
}),
define("PoE/Item/DivinationCard", ["Handlebars", "Backbone", "jquery", "./DisplayProperty/ValueStyle", "./DisplayProperty/DisplayMode", "./FrameType", "./Popup/Constants", "PoE/Helpers", "PoE/Handlebars/TemplateCollection", "text!PoE/Item/DivinationCard.hbt"], function(e, t, n, r, i, s, o, u, a) {
    var f = t.View.extend({
        initialize: function(e) {
            this.context = e,
            this.prepare()
        },
        prepare: function() {
            var e = this.context;
            e.artFilename && (e.cardFace = "/image/gen/divination_cards/" + e.artFilename + (e.panelLayout ? "_panel.png" : ".png"))
        },
        render: function() {
            var e = new n.Deferred
              , t = this;
            return a.load("PoE/Item/DivinationCard.hbt").done(function(n) {
                e.resolve(n(t.context))
            }),
            e.promise()
        }
    });
    return f
}),
define("PoE/Item/Popup", ["Handlebars", "Backbone", "jquery", "./DisplayProperty/ValueStyle", "./DisplayProperty/DisplayMode", "./FrameType", "./Popup/Constants", "PoE/Helpers", "./Markup", "./DivinationCard"], function(e, t, n, r, i, s, o, u, a, f) {
    e.registerHelper("itemDisplayProperty", function(t, n) {
        var s = ""
          , o = t.name
          , u = function(t) {
            var n;
            switch (t[1]) {
            default:
            case r.Default:
                n = "Default";
                break;
            case r.Augmented:
                n = "Augmented";
                break;
            case r.Unmet:
                n = "Unmet";
                break;
            case r.PhysicalDamage:
                n = "PhysicalDamage";
                break;
            case r.FireDamage:
                n = "FireDamage";
                break;
            case r.ColdDamage:
                n = "ColdDamage";
                break;
            case r.LightningDamage:
                n = "LightningDamage";
                break;
            case r.ChaosDamage:
                n = "ChaosDamage"
            }
            return '<span class="colour' + n + '">' + e.Utils.escapeExpression(t[0]) + "</span>"
        };
        o = o == "" ? "" : "<span>" + e.Utils.escapeExpression(o) + "</span>",
        t.displayMode == i.Progress && (s = '<span class="experienceBar"><span class="fill"><span style="width: ' + Math.round(t.progress * 100) + '%;"></span></span></span>');
        switch (t.displayMode) {
        case i.NameValue:
        case i.ValueName:
        case i.Progress:
            var a = "";
            for (var f = 0, l = t.values.length; f < l; ++f)
                a += (f > 0 ? ", " : "") + u(t.values[f]);
            t.displayMode == i.Progress && (o = ""),
            n = o == "" || a == "" ? "" : n,
            s += t.displayMode == i.ValueName ? a + n + o : o + n + a;
            break;
        case i.Inject:
            for (var f = 0, l = t.values.length; f < l; ++f)
                o = o.replace("%" + f, u(t.values[f]));
            s += o
        }
        return new e.SafeString(s)
    }),
    e.registerHelper("typeToField", function(t) {
        var n = [null, "map_tier", null, null, null, "gem_level", "quality", null, null, "pdamage", "edamage", "cdamage", "crit", "aps", null, "block", "ar", "ev", "es"]
          , r = n[t.type];
        return r === undefined || r === null ? "" : new e.SafeString(' s" data-field="' + r)
    });
    var l = t.View.extend({
        initialize: function() {
            this.divinationCard = this.model.get("frameType") === s.DivinationCardFrame,
            l.template === null && (l.template = e.compile(this.tpl)),
            this.divinationCard || (this.template = l.template)
        },
        render: function() {
            var t = this.model.toJSON()
              , n = !1
              , r = function(e, r) {
                t[e] && (n && (t[r] = !0),
                n = !0)
            }
              , i = function(n) {
                if (t[n]) {
                    var r = []
                      , i = t[n];
                    while (i.length > 0) {
                        var s = i.shift();
                        s instanceof e.SafeString && (s = s.string);
                        var o = s.split("\n");
                        r.push(o)
                    }
                    t[n] = r
                }
            };
            t.identified || (t.unidentifiedText = u.translate("Unidentified")),
            t.corrupted && (t.corruptedText = u.translate("Corrupted")),
            t.lockedToCharacter && (t.lockedToCharacterText = u.translate("Cannot be traded or modified")),
            t.duplicated && (t.duplicatedText = u.translate("Mirrored")),
            t.lockedToAccount && (t.lockedToAccountText = u.translate("Account-bound")),
            t.raceRewardText = !1,
            t.cisRaceReward && (t.raceRewardText = u.translate("CIS Race Season Reward")),
            t.seaRaceReward && (t.raceRewardText = u.translate("SG Race Season Reward")),
            t.thRaceReward && (t.raceRewardText = u.translate("TH Race Season Reward")),
            t.raceRewardText !== !1 && (t.flavourText ? (t.flavourText.push("\r"),
            t.flavourText.push("\r")) : t.flavourText = [],
            t.flavourText.push(t.raceRewardText)),
            i("enchantMods"),
            i("implicitMods"),
            i("explicitMods"),
            i("craftedMods"),
            i("pseudoMods"),
            r("properties"),
            r("requirements", "sep1"),
            r("secDescrText", "sep2"),
            r("implicitMods", "sep3"),
            r("enchantMods", "sep14"),
            r("explicitMods", "sep4"),
            r("cosmeticMods", "sep5"),
            r("additionalProperties", "sep6"),
            r("nextLevelRequirements", "sep7"),
            r("unidentifiedText", "sep8"),
            r("corruptedText", "sep9"),
            r("duplicatedText", "sep10"),
            t.sep8 = (t.sep8 || t.sep9 || t.sep10) && !t.sep4,
            r("lockedToCharacterText", "sep11"),
            r("flavourText", "sep12"),
            r("descrText", "sep13"),
            r("prophecyText", "sepProphecy"),
            r("prophecyDiffText", "sepProphecyDiffText"),
            r("note", "sep15"),
            r("lockedToAccountText", "sepLockedAccount"),
            this.$el.addClass("itemPopupContainer").addClass("newItemPopup");
            var o = this;
            t = a.recMarkup(t);
            var l = "";
            switch (this.model.get("frameType")) {
            default:
            case s.Normal:
                l = "normalPopup";
                break;
            case s.Magic:
                l = "magicPopup";
                break;
            case s.Rare:
                l = "rarePopup";
                break;
            case s.Unique:
                l = "uniquePopup";
                break;
            case s.Gem:
                l = "gemPopup";
                break;
            case s.Currency:
                l = "currencyPopup";
                break;
            case s.Quest:
                l = "questPopup";
                break;
            case s.DivinationCardFrame:
                l = "divinationCard";
                break;
            case s.Prophecy:
                l = "prophecyPopup";
                break;
            case s.Relic:
                l = "relicPopup"
            }
            this.$el.addClass(l),
            t.name && t.typeLine && (t.headerTwoLine = !0),
            n && (t.hasContent = !0),
            t.requirements && t.requirements.length > 0 && (t.requirements[0].first = !0),
            t.nextLevelRequirements && t.nextLevelRequirements.length > 0 && (t.nextLevelRequirements[0].first = !0);
            if (this.divinationCard) {
                var c = new f(t);
                c.render().done(function(e) {
                    o.$el.empty().html(e),
                    a.PoEMarkup(o.$el, .5)
                })
            } else
                this.$el.empty().html(this.template(t))
        },
        updatePopupWidth: function() {
            this.$el.css("position", "relative"),
            this.$el.css("top", "0px"),
            this.$el.css("left", "0px"),
            this.$el.css("width", "auto");
            var e = this.$el.find(".itemName:first")
              , t = 0;
            this.$el.find(".lc").each(function() {
                var e = n(this)
                  , r = e.outerWidth(!0) + 2;
                r > t && (t = r)
            }),
            this.$el.find(".descrText span, .secDescrText span").each(function() {
                var e = n(this)
                  , r = e.outerWidth(!0);
                r > o.MaxDescriptionWidth && (r = o.MaxDescriptionWidth),
                r > t && (t = r)
            }),
            this.$el.width(t + this.$el.outerWidth(!0) - this.$el.outerWidth(!0))
        },
        close: function() {
            this.remove(),
            this.off()
        }
    });
    return l.template = null,
    l.prototype.tpl = '         <div class="itemBoxContent">             <div class="itemHeader {{#if headerTwoLine}}doubleLine{{/if}}">                 <span class="l"></span>                 {{#if name}}                 <div class="itemName">                     <span class="lc">{{name}}</span>                 </div>                 {{/if}}                 {{#if typeLine}}                 <div class="itemName typeLine">                     <span class="lc">{{typeLine}}</span>                 </div>                 {{/if}}                 <span class="r"></span>             </div>             {{#if hasContent}}             <div class="content">                {{#if properties}}                     {{#each properties}}                     <div class="displayProperty"><span class="lc{{#if ../advanced}}{{typeToField this}}{{/if}}">{{itemDisplayProperty this ": "}}</span></div>                    {{/each}}                 {{/if}}                 {{#if utilityMods}}                     {{#each utilityMods}}<div class="utilityMod"><span class="lc">{{{this}}}</span></div>{{/each}}                 {{/if}}                 {{#if sep1}}<div class="separator"></div>{{/if}}                 {{#if talismanTier}}                    {{translate "Talisman Tier:"}} <span class="colourDefault">{{talismanTier}}</span>                {{/if}}                {{#if requirements}}                     <div class="requirements"><span class="lc">                    {{#each requirements}}{{#if first}}{{translate "Requires"}} {{else}}, {{/if}}{{itemDisplayProperty this " "}}{{/each}}                     </span></div>                 {{/if}}                 {{#if sep2}}<div class="separator"></div>{{/if}}                 {{#if secDescrText}}                     <div class="secDescrText"><span>{{secDescrText}}</span></div>                 {{/if}}                 {{#if sep3}}<div class="separator"></div>{{/if}}                 {{#if implicitMods}}                     {{#each implicitMods}}<div class="implicitMod"><span class="lc">{{#each this}}{{#if @index}}<br>{{/if}}{{this}}{{/each}}</span></div>{{/each}}                 {{/if}}                 {{#if sep14}}<div class="separator"></div>{{/if}}                {{#if enchantMods}}                     {{#each enchantMods}}<div class="enchantMod"><span class="lc">{{#each this}}{{#if @index}}<br>{{/if}}{{this}}{{/each}}</span></div>{{/each}}                 {{/if}}                {{#if sep4}}<div class="separator"></div>{{/if}}                 {{#if explicitMods}}                     {{#each explicitMods}}<div class="explicitMod"><span class="lc">{{#each this}}{{#if @index}}<br>{{/if}}{{this}}{{/each}}</span></div>{{/each}}                 {{/if}}                 {{#if craftedMods}}                     {{#each craftedMods}}<div class="craftedMod"><span class="lc">{{#each this}}{{#if @index}}<br>{{/if}}{{this}}{{/each}}</span></div>{{/each}}                 {{/if}}                 {{#if pseudoMods}}                     {{#each pseudoMods}}<div class="pseudoMod"><span class="lc">{{#each this}}{{#if @index}}<br>{{/if}}{{this}}{{/each}}</span></div>{{/each}}                 {{/if}}                 {{#if sep8}}<div class="separator"></div>{{/if}}                 {{#if unidentifiedText}}<div class="unmet"><span class="lc">{{unidentifiedText}}</span></div>{{/if}}                {{#if duplicatedText}}<div class="augmented"><span class="lc">{{duplicatedText}}</span></div>{{/if}}                {{#if corruptedText}}<div class="unmet"><span class="lc">{{corruptedText}}</span></div>{{/if}}                {{#if sep5}}<div class="separator"></div>{{/if}}                 {{#if cosmeticMods}}                     {{#each cosmeticMods}}<div class="cosmeticMod"><span class="lc">{{this}}</span></div>{{/each}}                 {{/if}}                 {{#if sep6}}<div class="separator"></div>{{/if}}                 {{#if additionalProperties}}                     {{#each additionalProperties}}                     <div class="additionalProperty"><span class="lc">{{itemDisplayProperty this ": "}}</span></div>                    {{/each}}                 {{/if}}                 {{#if sep7}}<div class="separator"></div>{{/if}}                 {{#if nextLevelRequirements}}                 <div class="nextLevelRequirements"><span class="lc">{{translate "Next Level"}}:</span><br /><span class="lc">                    {{#each nextLevelRequirements}}{{#if first}}{{translate "Requires"}} {{else}}, {{/if}}{{itemDisplayProperty this " "}}{{/each}}                 </span></div>                 {{/if}}                 {{#if sep11}}<div class="separator"></div>{{/if}}                 {{#if lockedToCharacterText}}<div class="unmet"><span class="lc">{{lockedToCharacterText}}</span></div>{{/if}}                {{#if sep12}}<div class="separator"></div>{{/if}}                 {{#if flavourText}}                     {{#each flavourText}}<div class="flavourText"><span class="lc">{{{this}}}</span></div>{{/each}}                 {{/if}}                 {{#if sepProphecy}}<div class="separator"></div>{{/if}}                {{#if prophecyText}}                    <div class="prophecyText colourDefault"><span class="lc">{{prophecyText}}</span></div>                {{/if}}                {{#if sepProphecyDiffText}}<div class="separator"></div>{{/if}}                {{#if prophecyDiffText}}                    <div class="prophecyDiffText"><span class="lc">{{prophecyDiffText}}</span></div>                {{/if}}                {{#if sep13}}<div class="separator"></div>{{/if}}                 {{#if descrText}}                 <div class="descrText"><span>{{descrText}}</span></div>                 {{/if}}                 {{#if sepLockedAccount}}<div class="separator"></div>{{/if}}                {{#if lockedToAccountText}}<div class="unmet"><span class="lc">{{lockedToAccountText}}</span></div>{{/if}}                {{#if sep15}}<div class="separator"></div>{{/if}}                {{#if note}}                    <div class="textCurrency itemNote">{{note}}</div>                {{/if}}            </div>             {{/if}}        </div>     ',
    l
}),
define("PoE/Geom/Point", [], function() {
    var e = function(e, t) {
        this.x = e === undefined ? 0 : e,
        this.y = t === undefined ? 0 : t
    };
    return e.prototype.scale = function(e) {
        this.x *= e,
        this.y *= e
    }
    ,
    e.prototype.inverseTranslate = function(e) {
        this.x -= e.x,
        this.y -= e.y
    }
    ,
    e.prototype.translateX = function(e) {
        return this.x += e,
        this
    }
    ,
    e.prototype.translateY = function(e) {
        return this.y += e,
        this
    }
    ,
    e.prototype.distTo = function(e) {
        return Math.sqrt(Math.pow(this.x - e.x, 2) + Math.pow(this.y - e.y, 2))
    }
    ,
    e.prototype.angleTo = function(e) {
        return Math.atan2(e.y - this.y, e.x - this.x)
    }
    ,
    e.prototype.clone = function() {
        return new e(this.x,this.y)
    }
    ,
    e.prototype.toString = function() {
        return "(" + this.x + "," + this.y + ")"
    }
    ,
    e.prototype.eq = function(e) {
        return this.x === e.x && this.y === e.y
    }
    ,
    e.prototype.neq = function(e) {
        return !this.eq(e)
    }
    ,
    e
}),
define("PoE/Geom/Offset", [], function() {
    var e = function(e, t, n, r) {
        this.top = e,
        this.left = r,
        this.bottom = n,
        this.right = t
    };
    return e.getBoundsOffset = function(t, n) {
        return new e(t.tl.y - n.tl.y,t.br.x - n.br.x,t.br.y - n.br.y,t.tl.x - n.tl.x)
    }
    ,
    e
}),
define("PoE/Layout/Popup", ["PoE/Geom/Point", "PoE/Geom/Offset"], function(e, t) {
    var n = {
        makePopup: function(e) {
            if (n.popupContainerEl === undefined) {
                var t = $("#poe-popup-container");
                t.length == 0 && (t = $('<div id="poe-popup-container" style="position: absolute; width: 800px; left: -1000px"></div>'),
                $("body").append(t)),
                n.popupContainerEl = t
            }
            n.popupContainerEl.append(e)
        }
    };
    return n
}),
define("PoE/Geom/Bounds", ["./Point", "./Offset"], function(e, t) {
    var n = function(t, n) {
        this.tl = t === undefined ? new e : t,
        this.br = n === undefined ? new e : n
    };
    return n.prototype.top = function() {
        return this.tl.y
    }
    ,
    n.prototype.bottom = function() {
        return this.br.y
    }
    ,
    n.prototype.left = function() {
        return this.tl.x
    }
    ,
    n.prototype.right = function() {
        return this.br.x
    }
    ,
    n.prototype.centerAt = function(e) {
        var t = this.width() / 2
          , n = this.height() / 2;
        this.tl.x = e.x - t,
        this.tl.y = e.y - n,
        this.br.x = e.x + t,
        this.br.y = e.y + n
    }
    ,
    n.prototype.width = function(e) {
        return e !== undefined ? (this.br.x = this.tl.x + e,
        this) : this.br.x - this.tl.x
    }
    ,
    n.prototype.height = function(e) {
        return e !== undefined ? (this.br.y = this.tl.y + e,
        this) : this.br.y - this.tl.y
    }
    ,
    n.prototype.scale = function() {
        this.tl.scale(),
        this.br.scale()
    }
    ,
    n.prototype.contains = function(e) {
        return this.containsCoords(e.x, e.y)
    }
    ,
    n.prototype.containsCoords = function(e, t) {
        return e >= this.tl.x && e <= this.br.x && t >= this.tl.y && t <= this.br.y
    }
    ,
    n.prototype.containsBounds = function(e) {
        return this.contains(e.tl) && this.contains(e.br)
    }
    ,
    n.prototype.translateX = function(e) {
        return this.tl.translateX(e),
        this.br.translateX(e),
        this
    }
    ,
    n.prototype.translateY = function(e) {
        return this.tl.translateY(e),
        this.br.translateY(e),
        this
    }
    ,
    n.prototype.grow = function(e) {
        this.tl.x -= e,
        this.tl.y -= e,
        this.br.x += e,
        this.br.y += e
    }
    ,
    n.prototype.tr = function() {
        return new e(this.br.x,this.tl.y)
    }
    ,
    n.prototype.bl = function() {
        return new e(this.tl.x,this.br.y)
    }
    ,
    n.prototype.intersectionPoint = function(t, n, r) {
        var i = function(e, t) {
            var n = t.y - e.y
              , r = e.x - t.x
              , i = n * e.x + r * e.y;
            return {
                A: n,
                B: r,
                C: i,
                point1: e,
                point2: t
            }
        }
          , s = function(e, t) {
            return e.A * t.B - t.A * e.B
        }
          , o = function(t, n) {
            var i = s(t, n);
            if (i == 0)
                return !1;
            var o = function(e, t) {
                var n = Math.min(t.point1.x, t.point2.x)
                  , i = Math.max(t.point1.x, t.point2.x)
                  , s = Math.min(t.point1.y, t.point2.y)
                  , o = Math.max(t.point1.y, t.point2.y);
                return e.x >= n - r && e.x <= i + r && e.y >= s - r && e.y <= o + r
            }
              , u = new e((n.B * t.C - t.B * n.C) / i,(t.A * n.C - n.A * t.C) / i);
            return !o(u, t) || !o(u, n) ? !1 : u
        }
          , u = this.tl
          , a = this.tr()
          , f = this.bl()
          , l = this.br
          , c = i(t, n)
          , h = o(i(u, a), c);
        return h !== !1 ? h : (h = o(i(a, l), c),
        h !== !1 ? h : (h = o(i(f, l), c),
        h !== !1 ? h : (h = o(i(u, f), c),
        h !== !1 ? h : !1)))
    }
    ,
    n.prototype.clone = function() {
        return new n(this.tl.clone(),this.br.clone())
    }
    ,
    n.prototype.toString = function() {
        return "Bounds(" + this.tl + ", " + this.br + ")"
    }
    ,
    n.prototype.positionAbove = function(e) {
        e instanceof n && this.translateY(e.tl.y - this.br.y)
    }
    ,
    n.prototype.positionBelow = function(e) {
        e instanceof n && this.translateY(e.br.y - this.tl.y)
    }
    ,
    n.prototype.positionLeft = function(e) {
        e instanceof n && this.translateX(e.tl.x - this.br.x)
    }
    ,
    n.prototype.positionRight = function(e) {
        e instanceof n && this.translateX(e.br.x - this.tl.x)
    }
    ,
    n.prototype.alignTop = function(e) {
        e instanceof n && this.translateY(e.tl.y - this.tl.y)
    }
    ,
    n.prototype.positionTopLeftX = function(e) {
        var t = this.width();
        this.tl.x = e,
        this.width(t)
    }
    ,
    n.prototype.positionTopLeftY = function(e) {
        var t = this.height();
        this.tl.y = e,
        this.height(t)
    }
    ,
    n.prototype.positionAtXCenter = function(e) {
        e instanceof n && this.positionTopLeftX(e.tl.x + e.width() / 2 - this.width() / 2)
    }
    ,
    n.prototype.positionAtYCenter = function(e) {
        e instanceof n && this.positionTopLeftY(e.tl.y + e.height() / 2 - this.height() / 2)
    }
    ,
    n.prototype.positionAtRightEdge = function(e) {
        e instanceof n && this.positionTopLeftX(e.tl.x + e.width() - this.width())
    }
    ,
    n.prototype.positionInsideLeftEdge = function(e) {
        var n = t.getBoundsOffset(this, e);
        if (n.left >= 0)
            return;
        this.translateX(-n.left)
    }
    ,
    n.prototype.positionInsideRightEdge = function(e) {
        var n = t.getBoundsOffset(this, e);
        if (n.right <= 0)
            return;
        this.translateX(-n.right)
    }
    ,
    n.prototype.positionInsideTopEdge = function(e) {
        var n = t.getBoundsOffset(this, e);
        if (n.top >= 0)
            return;
        this.translateY(-n.top)
    }
    ,
    n.prototype.positionInsideBottomEdge = function(e) {
        var n = t.getBoundsOffset(this, e);
        if (n.bottom >= 0)
            return;
        this.translateY(-n.bottom)
    }
    ,
    n.prototype.fitsAbove = function(e, n) {
        var r = t.getBoundsOffset(e, n);
        return r.top >= this.height() && n.width() >= this.width()
    }
    ,
    n.prototype.fitsRight = function(e, n) {
        var r = t.getBoundsOffset(e, n);
        return -r.right >= this.width() && n.height() >= this.height()
    }
    ,
    n.prototype.fitsLeft = function(e, n) {
        var r = t.getBoundsOffset(e, n);
        return r.left >= this.width() && n.height() >= this.height()
    }
    ,
    n.prototype.fitsBelow = function(e, n) {
        var r = t.getBoundsOffset(e, n);
        return -r.bottom >= this.height() && n.width() >= this.width()
    }
    ,
    n.prototype.draw = function(e) {
        var t = this.clone();
        setTimeout(function() {
            var e = $("<div></div>").css("position", "absolute").width(t.width()).height(t.height()).css("top", t.top()).css("left", t.left()).css("background", "#33a").css("border", "1px solid #a33").css("opacity", ".6").css("z-index", 5e3);
            $("body").append(e),
            setTimeout(function() {
                e.fadeOut(3e3, function() {
                    $(this).remove()
                })
            }, 3e3)
        }, 500)
    }
    ,
    n.prototype.eq = function(e) {
        return this.tl.eq(e.tl) && this.br.eq(e.br)
    }
    ,
    n.prototype.neq = function(e) {
        return !this.eq(e)
    }
    ,
    n
}),
define("PoE/Layout", ["PoE/Geom/Point", "PoE/Geom/Bounds", "PoE/Layout/Popup"], function(e, t, n) {
    var r = {
        smartPositionNextTo: function(e, t) {
            var n = r.getViewportBounds()
              , i = e.fitsAbove(t, n);
            i ? (e.positionAbove(t),
            e.positionAtXCenter(t),
            e.positionInsideLeftEdge(n),
            e.positionInsideRightEdge(n)) : e.fitsRight(t, n) ? (e.positionAbove(t),
            e.positionRight(t),
            e.positionInsideTopEdge(n)) : e.fitsLeft(t, n) ? (e.positionAbove(t),
            e.positionLeft(t),
            e.positionInsideTopEdge(n)) : e.fitsBelow(t, n) ? (e.positionBelow(t),
            e.positionAtXCenter(t),
            e.positionInsideLeftEdge(n),
            e.positionInsideRightEdge(n)) : "pointerEvents"in document.body.style ? (e.positionInsideTopEdge(n),
            e.positionAtRightEdge(n)) : (e.positionBelow(t),
            e.positionAtXCenter(t),
            e.positionInsideLeftEdge(n),
            e.positionInsideRightEdge(n))
        },
        getElementBounds: function(n) {
            var r = n.offset();
            return new t(new e(r.left,r.top),new e(r.left + n.outerWidth(!1),r.top + n.outerHeight(!1)))
        },
        getViewportBounds: function() {
            var n = $(window)
              , r = n.scrollLeft()
              , i = n.scrollTop();
            return new t(new e(r,i),new e(r + n.width(),i + n.height()))
        },
        positionPopups: function(e, i, s) {
            var o = null
              , u = new t;
            s && s.mode !== undefined && (o = s.mode);
            var a = r.getElementBounds(i)
              , f = r.getElementBounds(n.popupContainerEl);
            for (var l = 0, c = e.length; l < c; ++l) {
                var h = e[l]
                  , p = h.el.outerWidth(!0)
                  , d = h.el.outerHeight(!0);
                u.height(Math.max(d, u.height())),
                u.width(u.width() + p)
            }
            switch (o) {
            case "smart":
            default:
                r.smartPositionNextTo(u, a);
                break;
            case "below":
                u.positionBelow(a),
                u.positionAtXCenter(a);
                break;
            case "left":
                u.positionLeft(a),
                u.positionAtYCenter(a);
                break;
            case "rightTop":
                u.positionRight(a),
                u.alignTop(a);
                break;
            case "center":
                u.positionAtXCenter(a),
                u.positionAtYCenter(a)
            }
            u.translateX(-f.left()),
            u.translateY(-f.top());
            var v = u.left();
            for (var l = 0, c = e.length; l < c; ++l) {
                var h = e[l];
                h.el.css("left", v).css("top", u.top()),
                v += h.el.outerWidth(!0)
            }
        }
    };
    return r
}),
define("PoE/Layout/Popup/Popup", ["PoE/Geom/Point", "PoE/Geom/Offset", "PoE/Layout/Popup", "PoE/Layout"], function(e, t, n, r) {
    var i = function(e, t) {
        this.init = function() {
            this.el = e instanceof jQuery ? e : $(e),
            this.events = {
                prePosition: function() {}
            },
            this.isPopup = !1,
            this.widthFunc = t && t.widthFunc ? t.widthFunc : null,
            this.visible = !1
        }
        ,
        this.create = function() {
            if (this.isPopup)
                return;
            n.makePopup(this.el),
            this.el.css("position", "absolute"),
            this.el.hide(),
            this.visible = !1,
            this.isPopup = !0
        }
        ,
        this.manualPosition = function(e) {
            this.create(),
            this.show(),
            this.events.prePosition(this);
            var t = $("#passiveSkillTree").offset()
              , n = $("#poe-popup-container").offset()
              , r = $("#poe-popup-container").width()
              , i = $("#poe-popup-container").height() + n.top
              , s = e.x
              , o = e.y
              , u = t.top + o - i - 50
              , a = t.left + s + r;
            this.el.css({
                top: u + "px",
                left: a + "px",
                position: "absolute"
            });
            var f = this
        }
        ,
        this.positionCenterEl = function(e) {
            this.create(),
            this.show(),
            this.events.prePosition(this),
            r.positionPopups([this], e, {
                mode: "center"
            })
        }
        ,
        this.smartPositionByEl = function(e) {
            this.create(),
            this.show(),
            this.events.prePosition(this),
            this.el.css("position", "absolute");
            var t = this;
            r.positionPopups([this], e, {
                mode: "smart"
            })
        }
        ,
        this.positionBelowEl = function(e) {
            this.create(),
            this.show(),
            this.events.prePosition(this),
            this.el.css("position", "absolute"),
            r.positionPopups([this], e, {
                mode: "below"
            })
        }
        ,
        this.positionLeftEl = function(e) {
            this.create(),
            this.show(),
            this.events.prePosition(this),
            this.el.css("position", "absolute"),
            r.positionPopups([this], e, {
                mode: "left"
            })
        }
        ,
        this.positionRightTopEl = function(e) {
            this.create(),
            this.show(),
            this.events.prePosition(this),
            this.el.css("position", "absolute"),
            r.positionPopups([this], e, {
                mode: "rightTop"
            })
        }
        ,
        this.isVisible = function() {
            return this.visible
        }
        ,
        this.show = function() {
            this.visible = !0,
            this.el.show()
        }
        ,
        this.hide = function() {
            this.visible = !1,
            this.el.hide()
        }
        ,
        this.init()
    };
    return i
}),
define("PoE/Layout/Popup/PopupGroup", ["PoE/Layout", "PoE/Geom/Offset"], function(e) {
    var t = function(e, t) {};
    return function(t) {
        this.popups = t,
        this.smartPositionByEl = function(n) {
            for (var r = 0, i = this.popups.length; r < i; ++r) {
                var s = this.popups[r];
                s.el.show(),
                s.events.prePosition(s),
                s.el.css("position", "absolute")
            }
            e.positionPopups(t, n, {
                mode: "smart"
            })
        }
    }
}),
define("PoE/DOM/Util", ["jquery"], function(e) {
    return {
        isNextSiblingTextNode: function(t) {
            if (t instanceof e) {
                if (t.length == 0)
                    return !1;
                t = t[0]
            }
            var n = t.nextSibling;
            return n && n.nodeType == 3
        },
        isPrevSiblingTextNode: function(t) {
            if (t instanceof e) {
                if (t.length == 0)
                    return !1;
                t = t[0]
            }
            var n = t.previousSibling;
            return n && n.nodeType == 3
        },
        getSelectedText: function(t) {
            t instanceof e && (t = t[0]);
            if ("selectionStart"in t) {
                var n = t.selectionStart
                  , r = t.selectionEnd
                  , i = r - n;
                return t.value.substr(n, i)
            }
            if (document.selection) {
                t.focus();
                var s = document.selection.createRange();
                return null == s ? "" : s.text
            }
            return ""
        }
    }
}),
define("PoE/Item/Item", ["Handlebars", "Backbone", "jquery", "./Popup", "PoE/Layout/Popup/Popup", "PoE/Layout/Popup/PopupGroup", "PoE/Layout", "PoE/DOM/Util", "./DivinationCard", "./Markup"], function(e, t, n, r, i, s, o, u, a, f) {
    var l = t.View.extend({
        initialize: function() {
            l.template === null && (l.template = e.compile(this.tpl)),
            this.template = l.template,
            this.state = {
                itemHovered: !1,
                inSocketHover: !1,
                showSocketKeyDown: !1
            },
            this.options.manualPosition === !0 && (this.manualPosition = !0),
            this.options.enableVerified === undefined && (this.options.enableVerified = !1),
            this.options.enableLeague === undefined && (this.options.enableLeague = !1),
            this.options.showSockets === undefined && (this.options.showSockets = !1),
            this.leaguePopup = null,
            this.options.showSockets && this.$el.addClass("showSockets"),
            this.options.scale = !!this.options.scale,
            this.divinationLayout = !!this.options.divinationLayout
        },
        events: {
            click: "itemClick"
        },
        itemClick: function(e) {
            this.trigger("itemClick", this.model)
        },
        render: function() {
            var t = this.model.toJSON()
              , o = this;
            t.enableVerified = this.options.enableVerified,
            t.enableLeague = this.options.enableLeague,
            t.sockets = [];
            var u = this.model.get("sockets");
            t.numSockets = u.length;
            for (var l = 0, c = u.length - 1; l <= c; ++l) {
                var h = u[l]
                  , p = {
                    index: l,
                    str: h.attr == "S",
                    dex: h.attr == "D",
                    "int": h.attr == "I",
                    gen: h.attr == "G",
                    linkNext: l < c && h.group == u[l + 1].group,
                    rightAlign: l >= 2 && l <= 3
                };
                t.sockets.push(p)
            }
            this.model.get("socketedItems").forEach(function(e) {
                var n = e.get("socket");
                t.sockets[n].socketed = !0,
                t.sockets[n].support = e.get("support");
                var r = e.get("colour");
                switch (r) {
                case "S":
                    r = "strGem";
                    break;
                case "D":
                    r = "dexGem";
                    break;
                case "I":
                    r = "intGem";
                    break;
                case "G":
                    r = "genGem";
                    break;
                default:
                    r = !1
                }
                t.sockets[n].gemColour = r
            }),
            this.$el.addClass("newItemContainer").addClass("iW" + this.model.get("w")).addClass("iH" + this.model.get("h"));
            if (this.divinationLayout) {
                this.$el.addClass("divinationCard"),
                this.$el.css("width", "172px"),
                this.$el.css("height", "261px");
                var d = n.extend(!0, {}, t);
                this.model.get("stackSize") >= this.model.get("maxStackSize") && this.$el.addClass("completeStack");
                var v = function(t) {
                    if (d[t]) {
                        var n = []
                          , r = d[t];
                        while (r.length > 0) {
                            var i = r.shift();
                            i instanceof e.SafeString && (i = i.string);
                            var s = i.split("\n");
                            n = n.concat(s)
                        }
                        d[t] = n
                    }
                };
                d.explicitMods && v("explicitMods"),
                d = f.recMarkup(d),
                d.panelLayout = !0;
                var m = new a(d);
                m.render().done(function(e) {
                    o.$el.empty().html(e),
                    f.PoEMarkup(o.$el, .35)
                })
            } else
                this.$el.empty().html(this.template(t));
            var g = new r({
                model: this.model
            });
            g.render();
            var y = this.$el.find(".popupPlaceholder:first");
            y.replaceWith(g.$el),
            this.$socketsEl = this.$el.find(".sockets"),
            this.socketEls = this.$socketsEl.children(".socket"),
            this.socketPopups = [],
            this.options.enableLeague && (this.leaguePopup = new i(this.$el.find(".itemLeaguePopup:first")),
            this.leaguePopup.events.prePosition = function(e) {
                e.el.css("position", "relative"),
                e.el.css("float", "left"),
                e.el.width(e.el.width()),
                e.el.css("float", "none")
            }
            ),
            this.model.get("socketedItems").forEach(function(e, t) {
                var s = new r({
                    model: e
                })
                  , u = e.get("socket");
                s.render(),
                o.$el.find(".socketPopups").append(s.$el);
                var a = new i(s.$el);
                a.events.prePosition = function(e) {
                    return function() {
                        e.updatePopupWidth()
                    }
                }(s),
                o.socketPopups.push({
                    view: s,
                    popup: a,
                    $socketEl: n(o.socketEls.get(u))
                })
            }),
            this.mainPopup = {
                view: g,
                popup: new i(g.$el)
            },
            this.mainPopup.popup.events.prePosition = function() {
                return function() {
                    o.mainPopup.view.updatePopupWidth()
                }
            }(),
            this.mainPopup.popup.create(),
            this.itemIconEl = this.$el.find(".icon:first"),
            this.$el.mouseover(function() {
                o.handleItemMouseover()
            }).mouseout(function() {
                o.handleItemMouseout()
            }),
            n(document).keydown(function(e) {
                return o.handleKeyDown(e)
            }).keyup(function(e) {
                return o.handleKeyUp(e)
            });
            for (var l = 0, b = o.socketPopups.length; l < b; ++l) {
                var w = o.socketPopups[l];
                w.popup.create(),
                w.$socketEl.mouseover(function(e) {
                    return function(t) {
                        o.state.inSocketHover = !0,
                        n(this).addClass("socketHover"),
                        o.hoverStart();
                        var r = new s([o.mainPopup.popup, e.popup]);
                        r.smartPositionByEl(o.$el)
                    }
                }(w)).mouseout(function(e) {
                    return function(t) {
                        o.state.inSocketHover = !1,
                        n(this).removeClass("socketHover"),
                        e.popup.hide(),
                        o.hoverEnd()
                    }
                }(w))
            }
            this.$el.addClass("itemRendered"),
            this.trigger("render")
        },
        handleKeyDown: function(e) {
            if (e.which == 18) {
                this.state.showSocketKeyDown = !0;
                if (this.state.itemHovered)
                    return;
                return this.hideSockets(!1),
                !1
            }
        },
        handleKeyUp: function(e) {
            if (e.which == 18) {
                this.state.showSocketKeyDown = !1;
                if (this.state.itemHovered)
                    return;
                this.hideSockets(!0)
            }
        },
        handleItemMouseover: function(e) {
            this.hoverStart(),
            this.hideSockets(!1);
            if (this.state.inSocketHover)
                return;
            this.manualPosition ? this.mainPopup.popup.manualPosition(e) : this.divinationLayout ? this.mainPopup.popup.positionCenterEl(this.$el) : this.mainPopup.popup.smartPositionByEl(this.$el)
        },
        handleItemMouseout: function() {
            !this.state.inSocketHover && !this.state.showSocketKeyDown && this.hideSockets(!0),
            this.mainPopup.popup.hide(),
            this.hoverEnd()
        },
        hoverStart: function() {
            this.state.itemHovered = !0,
            this.$el.addClass("hovered"),
            this.options.enableLeague && this.leaguePopup.positionBelowEl(this.$el)
        },
        hoverEnd: function() {
            this.state.itemHovered = !1,
            this.$el.removeClass("hovered"),
            this.options.enableLeague && this.leaguePopup.hide()
        },
        hideSockets: function(e) {
            e ? this.$socketsEl.hide() : this.$socketsEl.show()
        },
        setPlaced: function(e, t) {
            this.$el.addClass("itemPlaced").addClass("ipW" + e).addClass("ipH" + t),
            this.model.get("identified") || this.$el.addClass("unidentified"),
            this.model.get("corrupted") && this.$el.addClass("corrupted"),
            this.model.get("lockedToCharacter") && this.$el.addClass("lockedToCharacter")
        },
        close: function() {
            this.remove(),
            this.off(),
            this.mainPopup.view.close();
            for (var e = 0, t = this.socketPopups.length; e < t; ++e)
                this.socketPopups[e].view.close()
        }
    });
    return l.template = null,
    l.prototype.tpl = ' 	<div class="popupPlaceholder"></div> 	<div class="socketPopups"></div> 	<div class="iconContainer"> 	 	<div class="icon"> 	 		<img src="{{icon}}" alt="" /> 			<div class="sockets numSockets{{numSockets}}"> 			{{#each sockets}} 			{{#if linkNext}}<div class="socketLink socketLink{{index}}"></div>{{/if}} 			<div class="socket{{#if rightAlign}} socketRight{{/if}}{{#if socketed}} socketed{{/if}}{{#if support}} socketSupport{{/if}}{{#if gemColour}} {{gemColour}}{{/if}}{{#if str}} socketStr{{/if}}{{#if dex}} socketDex{{/if}}{{#if int}} socketInt{{/if}}{{#if gen}} socketGen{{/if}}"></div> 			{{/each}} 			</div> 	 	</div> 		{{#if enableVerified}}{{#if verified}}<div class="verifiedStatus">{{translate "Verified"}}</div>{{/if}}{{/if}} 		{{#if enableLeague}}<div class="itemLeaguePopup">{{league}} {{translate "League"}}</div>{{/if}} 	</div> 	',
    l
}),
define("PoE/BetaCountdown", ["plugins"], function(e) {
    return function(t, n) {
        this.countdownContEl = e(t),
        this.loadingEl = this.countdownContEl.find(".loading:first"),
        this.activeContainerEl = this.countdownContEl.find(".activeContainer:first"),
        this.countdownEl = this.countdownContEl.find(".countdown:first"),
        this.countdownLastEl = this.countdownContEl.find(".p1Status .lastInvite:first"),
        this.countdownNextEl = this.countdownContEl.find(".p1Status .nextInvite:first"),
        this.countdownLastNameEl = this.countdownLastEl.find(".name:first"),
        this.countdownNextNameEl = this.countdownNextEl.find(".name:first"),
        this.P2countdownLastEl = this.countdownContEl.find(".p2Status .lastInvite:first"),
        this.P2countdownNextEl = this.countdownContEl.find(".p2Status .nextInvite:first"),
        this.P2countdownLastNameEl = this.P2countdownLastEl.find(".name:first"),
        this.P2countdownNextNameEl = this.P2countdownNextEl.find(".name:first"),
        this.boxContainerEl = e(n),
        this.id = 0,
        this.intervalId = null,
        this.XHR = null,
        this.hasCountdown = !1,
        this.latestName = "",
        this.nextName = "",
        this.upcoming = [],
        this.upcomingIndex = 0,
        this.upcomingLen = 0,
        this.P2latestName = "",
        this.P2nextName = "",
        this.P2upcoming = [],
        this.P2upcomingIndex = 0,
        this.P2upcomingLen = 0;
        var r = this;
        this.init = function() {
            this.loading(!0),
            this.next(),
            setInterval(this.showNextUpcoming, 1500)
        }
        ,
        this.showNextUpcoming = function() {
            if (r.upcoming === !1)
                return;
            var e = r.upcoming[r.upcomingIndex];
            if (e === undefined)
                return;
            r.nextName != e.name && (r.countdownNextNameEl.empty().hide().append(e.name).slideDown("fast"),
            r.nextName = e.name),
            ++r.upcomingIndex,
            r.upcomingIndex == r.upcomingLen && (r.upcomingIndex = 0);
            if (r.P2upcoming === !1)
                return;
            e = r.P2upcoming[r.P2upcomingIndex];
            if (e === undefined)
                return;
            r.P2nextName != e.name && (r.P2countdownNextNameEl.empty().hide().append(e.name).slideDown("fast"),
            r.P2nextName = e.name),
            ++r.P2upcomingIndex,
            r.P2upcomingIndex == r.P2upcomingLen && (r.P2upcomingIndex = 0)
        }
        ,
        this.loading = function(t) {
            t ? (this.loadingEl.show(),
            this.activeContainerEl.hide()) : (this.loadingEl.hide(),
            this.boxContainerEl.slideDown("fast"),
            e("#betaInviteTimer").css("cursor", "pointer"),
            e("#betaInviteTimer").click(function() {
                var t = e("#betaInviteTimer").data("url");
                document.location = t
            }),
            this.activeContainerEl.show())
        }
        ,
        this.expiry = function() {
            this.countdownEl.fadeOut(),
            this.countdownEl.countdown("destroy"),
            this.countdownEl.fadeIn(),
            this.next()
        }
        ,
        this.startInterval = function() {
            if (this.intervalId !== null)
                return;
            this.intervalId = setInterval(function(e) {
                return function() {
                    e.next()
                }
            }(this), 3e3)
        }
        ,
        this.endInterval = function() {
            if (this.intervalId === null)
                return;
            clearInterval(this.intervalId),
            this.intervalId = null
        }
        ,
        this.countdown = function(e, t, n) {
            var r = 0;
            e !== !1 && this.latestName != e["name"] && (this.countdownLastNameEl.empty().hide().append(e.name).fadeIn(),
            this.latestName = e.name),
            t === !1 ? (this.nextName != "**NONE**" && (this.countdownNextNameEl.empty().hide().append('<span class="none">None</span>').fadeIn(),
            this.nextName = "**NONE**"),
            this.upcoming = !1,
            this.upcomingIndex = 0,
            this.upcomingLen = 0,
            this.startInterval()) : (this.upcomingIndex = 0,
            this.upcoming = t,
            this.upcomingLen = t.length,
            r += n),
            r <= 0 && (r = 1),
            this.hasCountdown ? this.countdownEl.countdown({
                until: r,
                layout: '<div class="minutes">{mn}</div><div class="seconds">{sn}</div>',
                onExpiry: function(e) {
                    return function() {
                        e.expiry()
                    }
                }(this)
            }) : (this.countdownEl.countdown({
                until: r,
                layout: '<div class="minutes">{mn}</div><div class="seconds">{sn}</div>',
                onExpiry: function(e) {
                    return function() {
                        e.expiry()
                    }
                }(this)
            }),
            this.hasCountdown = !0)
        }
        ,
        this.next = function() {
            if (this.XHR !== null)
                return;
            var t = this;
            this.XHR = e.ajax({
                url: "/scripts/beta-invite-query.php?mode=next",
                async: !0,
                cache: !1,
                dataType: "json",
                data: {
                    id: this.id
                },
                success: function(e) {
                    t.endInterval();
                    switch (e.action) {
                    case "end":
                        t.end();
                        break;
                    case "update":
                        t.countdown(e.p1.last, e.p1.upcoming, e.p1.next_s),
                        t.loading(!1)
                    }
                    t.XHR = null
                },
                error: function(e, n, r) {
                    t.endInterval(),
                    t.end(),
                    t.XHR = null
                }
            })
        }
        ,
        this.end = function() {
            this.boxContainerEl.slideUp("fast", function() {
                e(this).remove()
            })
        }
        ,
        this.checkName = function() {}
        ,
        this.serverSync = function() {
            var t = null;
            return e.ajax({
                url: "/index/beta-invite-query/mode/sync",
                async: !1,
                dataType: "json",
                success: function(e) {
                    t = new Date(e)
                },
                error: function(e, n, r) {
                    t = new Date
                }
            }),
            t
        }
        ,
        this.init()
    }
}),
define("PoE/Backbone/Model/Item/SocketedItem", ["Backbone"], function(e) {
    return e.RelationalModel.extend({
        idAttribute: "_id"
    })
}),
define("PoE/Backbone/Collection/Item/SocketedItemCollection", ["Backbone", "PoE/Backbone/Model/Item/SocketedItem"], function(e, t) {
    return e.Collection.extend({
        model: t
    })
}),
define("PoE/Backbone/Model/Item/Item", ["Backbone", "./SocketedItem", "PoE/Backbone/Collection/Item/SocketedItemCollection"], function(e, t, n) {
    return e.RelationalModel.extend({
        idAttribute: "_id",
        relations: [{
            type: e.HasMany,
            key: "socketedItems",
            relatedModel: t,
            collectionType: n
        }]
    })
}),
define("PoE/DOM/DeferredLoader", [], function() {
    var e = function(e) {
        this.threshold = e && e.threshold ? e.threshold : 0,
        this.jobs = [],
        this.$window = $(window),
        this.viewPort = {
            top: null,
            bottom: null
        };
        var t = this;
        this.updatePositions(),
        this.jobTimer = !1,
        this.$window.scroll(function() {
            this.jobTimer && clearTimeout(this.jobTimer),
            this.jobTimer = setTimeout(function() {
                t.processJobs()
            }, 500)
        })
    };
    return e.prototype.processJobs = function() {
        this.updatePositions();
        for (var e = this.jobs.length - 1; e >= 0; --e) {
            var t = this.jobs[e];
            this.processJob(t) && this.jobs.splice(e, 1)
        }
    }
    ,
    e.prototype.updatePositions = function() {
        this.viewPort.top = this.$window.scrollTop(),
        this.viewPort.bottom = this.viewPort.top + this.$window.height()
    }
    ,
    e.prototype.processJob = function(e) {
        if (e.acceptFunc && e.acceptFunc(e.element)) {
            var t = e.element.offset().top
              , n = t + e.element.height();
            if (t >= this.viewPort.top - this.threshold && n <= this.viewPort.bottom + this.threshold)
                return e.callback(),
                !0
        }
        return !1
    }
    ,
    e.prototype.deferLoad = function(e, t, n) {
        var r = {
            element: e instanceof $ ? e : $(e),
            callback: t
        };
        n && n.acceptFunc && (r.acceptFunc = n.acceptFunc);
        if (this.processJob(r))
            return;
        this.jobs.push(r)
    }
    ,
    e
}),
define("PoE/Util/ThrottledExecutor", [], function() {
    var e = function(e) {
        this.throttle = e && e.throttle ? e.throttle : 1,
        this.threads = e && e.threads ? e.threads : 1,
        this.jitter = e && e.jitter ? e.jitter : 0,
        this.jobs = [],
        this.numThreads = 0
    };
    return e.prototype.execute = function(e) {
        this.numThreads < this.threads ? this.runThread(e) : this.jobs.push(e)
    }
    ,
    e.prototype.processNextJob = function(e) {
        this.jobs.length > 0 && this.runThread(this.jobs.shift())
    }
    ,
    e.prototype.runThread = function(e) {
        ++this.numThreads;
        var t = e()
          , n = this
          , r = $.Deferred();
        r.done(function() {
            setTimeout(function() {
                --n.numThreads,
                n.processNextJob()
            }, n.throttle + (n.jitter == 0 ? 0 : Math.floor(Math.random() * n.jitter + 1)))
        }),
        t && t.promise ? t.done(function() {
            r.resolve()
        }) : r.resolve()
    }
    ,
    e
}),
define("PoE/Item/LayoutManager", ["PoE/DOM/Util"], function(e) {
    var t = function() {
        var n = function(n) {
            var r = n.offset(), i = n.prev(), s = n.next(), o, u = function(e) {
                return e.hasClass("newItemContainer") || e.hasClass("itemFragment")
            }, a = function(e) {
                return e.hasClass("itemFragment")
            }, f = function(e) {
                return e.hasClass("itemRendered")
            }, l = function(e) {
                return e.hasClass("itemSmartLayoutStop")
            }, c = function(e) {
                return e.hasClass("itemSmartLayoutBreak")
            }, h = function(e, t) {
                e.attr("data-last-offset-top", t.top),
                e.attr("data-last-offset-left", t.left)
            }, p = function() {
                var e = $('<div class="itemSmartLayoutBreak itemSmartLayoutStop"></div>');
                return t.debug && e.css("background", "cyan").css("height", "2px"),
                e
            }, d = function() {
                var e = $('<div class="itemSmartLayoutBreak"></div>');
                return t.debug && e.css("background", "red").css("height", "2px"),
                e
            }, v = function(e, t) {
                return t.top > e.top || t.left < e.left
            }, m = function(e) {
                var n = e, r;
                for (; ; ) {
                    t.debug && (n.css("background", "green"),
                    setTimeout(function(e) {
                        return function() {
                            e.css("background", "")
                        }
                    }(n), 5e3)),
                    r = n.next();
                    if (r.length == 0) {
                        n.after(p());
                        return
                    }
                    if (l(r))
                        return;
                    if (c(r)) {
                        var i = n.offset()
                          , s = n.data("last-offset-top")
                          , o = n.data("last-offset-left")
                          , a = r
                          , m = a.data("last-offset-top");
                        if (i.top == s && i.left == o)
                            return;
                        if (i.left == o)
                            return;
                        r = a.next();
                        var g = r.offset();
                        a.remove();
                        var y = r.offset();
                        if (g.top == y.top && g.left == y.left) {
                            h(n, i);
                            var b = d();
                            r.before(b),
                            h(b, b.offset());
                            return
                        }
                        r = n
                    } else {
                        if (!u(r)) {
                            r.before(p());
                            return
                        }
                        if (!f(r))
                            return;
                        var i = n.offset()
                          , g = r.offset();
                        if (v(i, g)) {
                            h(n, i);
                            var b = d();
                            r.before(b),
                            h(b, b.offset());
                            var w = r.offset();
                            if (w.top == g.top && w.left == g.top)
                                return
                        }
                    }
                    n = r
                }
            };
            if (e.isPrevSiblingTextNode(n)) {
                n.before(p()),
                m(n);
                return
            }
            if (e.isNextSiblingTextNode(n)) {
                n.after(p()),
                m(n);
                return
            }
            if (i.length == 0) {
                m(n);
                return
            }
            if (!u(i) && !c(i)) {
                n.before(p()),
                m(n);
                return
            }
            m(i)
        };
        this.smartLayout = function(e) {
            e.on("render", function() {
                n(e.$el)
            })
        }
    };
    return t.debug = !1,
    t
}),
define("PoE/Backbone/EventBus", ["Backbone", "Underscore"], function(e, t) {
    return t.extend({}, e.Events)
}),
define("PoE/Item/DeferredItemRenderer", ["PoE/Backbone/Model/Item/Item", "PoE/Item/Item", "PoE/DOM/DeferredLoader", "PoE/Util/ThrottledExecutor", "PoE/Item/LayoutManager", "PoE/Backbone/EventBus"], function(e, t, n, r, i, s) {
    var o = function(e) {
        this.config = e || []
    };
    return o.prototype.run = function() {
        var o = new n({
            threshold: 200
        })
          , u = new r({
            throttle: 4,
            threads: 6,
            jitter: 3
        })
          , a = new i;
        s.on("spoilerShow", function() {
            o.processJobs()
        });
        for (var f = 0, l = this.config.length; f < l; ++f) {
            var c = $("#item-fragment-" + this.config[f][0])
              , h = this.config[f][2]
              , p = typeof h.enableSmartLayout == "undefined" ? !0 : h.enableSmartLayout
              , d = new t({
                el: c,
                enableVerified: typeof h.enableVerified == "undefined" ? !0 : h.enableVerified,
                enableLeague: typeof h.enableLeague == "undefined" ? !0 : h.enableLeague,
                showSockets: typeof h.showSockets == "undefined" ? !1 : h.showSockets,
                model: new e(this.config[f][1])
            });
            p && a.smartLayout(d),
            o.deferLoad(c, function(e) {
                return function() {
                    u.execute(function() {
                        e.render(),
                        e.$el.removeClass("itemFragment")
                    })
                }
            }(d), {
                acceptFunc: function(e) {
                    return e.is(":visible")
                }
            })
        }
    }
    ,
    o
}),
define("PoE/Forum", ["jquery", "PoE/Backbone/EventBus", "PoE/Helpers"], function(e, t, n) {
    window.POE = window.POE || {};
    var r = window.POE;
    r.Forum = {},
    r.Forum.SpoilerClick = function(n) {
        var r = e(n)
          , i = e(n).parent()
          , s = i.parent()
          , o = s.children(".spoilerContent:first");
        return s.hasClass("spoilerHidden") ? (r.val("Hide"),
        o.hide(),
        s.removeClass("spoilerHidden").addClass("spoilerVisible"),
        o.slideDown(400, function() {
            t.trigger("spoilerShow")
        })) : (r.val("Show"),
        o.fadeOut("fast", function() {
            s.removeClass("spoilerVisible").addClass("spoilerHidden")
        })),
        !1
    }
    ,
    e(".report-post a").click(function(t) {
        var n = e(t.target).parent().data();
        e('#forum-report-box #forum-report-form input[name="reported_name"]').val(n.name),
        e('#forum-report-box #forum-report-form input[name="forum_post_id"]').val(n.postid),
        e("#forum-report-box #forum-report-form .reported_name").text(n.name),
        e('#forum-report-box #forum-report-form textarea[name="description"]').val(""),
        e('#forum-report-box #forum-report-form select[name="type"]').val(""),
        e(this).colorbox({
            width: "650px",
            height: "380px",
            href: "#forum-report-box",
            inline: !0,
            className: "colorBoxTheme1",
            onComplete: function(t) {
                e("#forum-report-box").show()
            },
            onCleanup: function() {
                e("#forum-report-box").hide()
            }
        })
    }),
    e("#forum-report-form").submit(function(t) {
        var n = e(this).find('input[type="submit"]')
          , r = n.css("background")
          , i = n.css("color")
          , s = n.css("border-color")
          , o = n.css("padding-left")
          , u = n.val();
        n.prop("disabled", !0),
        n.css("background", "#1f202c url('/image/UI/loader/loading-1.gif?1375395152') no-repeat 3px 3px"),
        n.css("padding-left", "25px"),
        n.val("Submitting...");
        var a = e(this).serialize();
        e(this).find('select[name="type"]').val() ? e.ajax({
            url: "/api/report",
            type: "POST",
            dataType: "json",
            data: a,
            success: function(t) {
                n.css("background", "#173517"),
                n.css("color", "#86ff4d"),
                n.css("border-color", "#647a64"),
                n.css("padding-left", o),
                n.val("Submitted"),
                setTimeout(function() {
                    e.colorbox.close(),
                    n.css("background", r),
                    n.css("color", i),
                    n.css("border-color", s),
                    n.val(u)
                }, 1500)
            },
            complete: function() {
                setTimeout(function() {
                    n.prop("disabled", !1)
                }, 1500)
            }
        }) : (alert("Please select a Report Type"),
        n.css("background", r),
        n.css("color", i),
        n.css("border-color", s),
        n.css("padding-left", o),
        n.val(u),
        n.prop("disabled", !1)),
        t.preventDefault()
    }),
    e(".uiBumpButton").click(function(t) {
        t.preventDefault();
        var r = e(this).data("thread")
          , i = e(this)
          , s = e(this).parentsUntil(".post_info").last().find(".bump-thread-result");
        e.ajax({
            url: "/api/forum-bump",
            method: "POST",
            dataType: "json",
            data: {
                id: r
            },
            success: function(e) {
                if (e.result)
                    i.addClass("disabled"),
                    s.addClass("success"),
                    s.html(n.translate("Thread Bumped"));
                else {
                    i.addClass("disabled"),
                    s.addClass("error");
                    var t = "Thread Already bumped";
                    e.error && e.error.message && (t = e.error.message),
                    s.html(n.translate(t))
                }
                setTimeout(function() {
                    s.fadeOut(500)
                }, 1e3)
            },
            error: function(e) {
                s.html(n.translate("Failed to Bump Thread"))
            }
        })
    }),
    e(".forumTable .points").on("click", function(t) {
        if (!e(this).hasClass("disabled") && !e(this).hasClass("voted")) {
            var r = e(this)
              , i = e(this).data("post");
            e.ajax({
                url: "/api/forum-points",
                method: "POST",
                dataType: "json",
                data: {
                    post: i
                },
                success: function(t) {
                    r.addClass("disabled");
                    if (t.result) {
                        t.points && r.find(".points-value").html(t.points);
                        if (!t.pointsRemaining)
                            e(".points:not(.disabled):not(.voted)").addClass("disabled").attr("title", n.translate("You don't have enough points!"));
                        else {
                            var i = n.translate("Give this post a point if you think they did a good job.");
                            e(".points:not(.disabled):not(.voted)").attr("title", i)
                        }
                        r.removeClass("disabled").addClass("voted").attr("title", n.translate("Good job!"))
                    } else
                        alert(t.message)
                },
                error: function(e) {
                    r.addClass("disabled"),
                    alert(e.message)
                }
            })
        } else
            alert(e(this).attr("title")),
            e(this).hasClass("guest") && window.TencentLogin();
        t.preventDefault()
    });
    var i = function(e) {
        var t = e.parents("table:first")
          , r = t.find("tr:not(.heading)")
          , i = t.find("tr.heading");
        return i.find("th:not(.forum)").find("img").hide(),
        r.addClass("hidden").hide(),
        i.find("div.view-more-button").html(n.translate("[ Expand ]")),
        !1
    }
      , s = function(e) {
        var t = e.parents("table:first")
          , r = t.find("tr:not(.heading)")
          , i = t.find("tr.heading");
        return i.find("th:not(.forum)").find("img").show(),
        r.removeClass("hidden").show(),
        i.find("div.view-more-button").html(n.translate("[ Collapse ]")),
        !1
    }
      , o = function() {
        var t = [];
        e(".forumIndexTable:has(tr.expand-category) > tbody").each(function() {
            var n = e(this).parent(".forumIndexTable")
              , r = 0;
            e(this).children("tr").each(function() {
                e(this).toggleClass("even", ++r % 2 === 0)
            });
            var i = e(this).sortable("toArray", {
                attribute: "data-id"
            });
            i = e.map(i, function(e, t) {
                return +e
            }),
            t.push({
                id: n.data("id"),
                collapsed: !n.find(".expand-category").first().data("toggled"),
                forums: i
            })
        }),
        e.ajax({
            url: "/api/forum/preferences?type=categories-layout",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(t)
        })
    };
    e(document).ready(function() {
        var t = !0;
        e(".forumIndexTable > thead > .expand-category").on("click", function(n) {
            var r = e(this).data("toggled");
            if (r)
                i(e(this));
            else {
                var u = e(this), a = u.parents("table:first"), f = a.find("tr:not(.heading)"), l = a.find("tr.heading"), c;
                t && (l.find("img.hidden").hide().removeClass("hidden").fadeIn("slow"),
                t = !1),
                s(e(this))
            }
            e(this).data("toggled", !r),
            o(),
            n.preventDefault()
        }),
        e(".forumIndexTable:has(tr.expand-category) > tbody").each(function(t) {
            e(this).sortable({
                containment: e(this),
                tolerance: "pointer",
                items: "tr",
                axis: "y",
                placeholder: "ui-state-highlight",
                cancel: "a,button",
                cursor: "move",
                opacity: .8,
                delay: 150,
                start: function(e, t) {
                    t.placeholder.height(t.item.height())
                },
                update: o
            })
        })
    }),
    e("#search-button").click(function() {
        e(".forumSearchForm form").submit()
    }),
    e(".clear_viewed").on("click", function() {
        var t = e(this)
          , r = t.data("id")
          , i = t.data("type")
          , s = "";
        switch (i) {
        case "f":
            s = "/forum/clear-forum-viewed/";
            break;
        case "t":
            s = "/forum/set-thread-read/"
        }
        e.ajax({
            url: s + r,
            type: "GET",
            dataType: "json",
            data: {},
            success: function(r) {
                var s = e("<img>")
                  , o = e("<div></div>")
                  , u = t.parent().children(".status")
                  , a = ""
                  , f = "";
                if (i == "f")
                    a = "/image/forum/old.png",
                    f = n.translate("No new posts");
                else {
                    if (i != "t" || r != "R")
                        return;
                    a = "/image/forum/read-no-new.png",
                    f = n.translate("No new posts since you last read this thread.")
                }
                u.find("a").attr("title", f),
                s.attr("src", a),
                o.append(s).hide(),
                u.children("div").append(o),
                o.fadeIn(500, function() {
                    u.find("img").attr("src", a),
                    o.remove()
                }),
                t.fadeOut("slow")
            },
            failure: function(e) {
                alert("There was a problem processing your request. Please try again later")
            }
        })
    })
}),
define("PoE/Forum/AutosaveWatcher", ["require", "jquery"], function(e) {
    var t = e("jquery");
    return function(e, n, r, i) {
        var s = this;
        this.$el = t(e),
        this.lastSaveCharLength = this.$el.val().length,
        this.currentCharLength = this.lastSaveCharLength,
        this.forceSaveChars = 5,
        this.forceSaveInterval = 1e4,
        this.dirty = !1,
        this.inputTimeout = null,
        this.inputSaveTimeout = 1e3,
        this.doSave = function() {
            s.lastSaveCharLength = s.currentCharLength,
            s.dirty = !1,
            r()
        }
        ,
        this.$el.on("input", function() {
            n(),
            s.dirty = !0,
            s.currentCharLength = s.$el.val().length,
            s.inputTimeout !== null && clearTimeout(s.inputTimeout),
            s.inputTimeout = setTimeout(function() {
                Math.abs(s.currentCharLength - s.lastSaveCharLength) >= s.forceSaveChars && s.doSave(),
                s.inputTimeout = null
            }, s.inputSaveTimeout)
        }),
        setInterval(function() {
            s.dirty && s.doSave()
        }, this.forceSaveInterval)
    }
}),
define("PoE/Forum/Autosave", ["require", "jquery", "moment-tz", "./AutosaveWatcher", "PoE/Helpers"], function(e) {
    var t = e("jquery")
      , n = e("moment-tz")
      , r = e("./AutosaveWatcher")
      , i = e("PoE/Helpers");
    return function(e, s, o, u) {
        this.$status = t(e),
        this.$status.addClass("forumDraftStatus");
        var a = this;
        this.saving = !1,
        this.repeatSave = !1,
        this.$savingStatus = t('<div class="savingStatus">' + i.translate("Saving draft") + '.<span class="loading-inline"></span></div>'),
        this.$lastSaved = t('<div class="lastSave"></div>').hide(),
        this.$revertible = t('<a class="revertible" href="#">' + i.translate("You are editing a saved draft. Click here to edit the original.") + "</div>"),
        this.$savingStatus.hide(),
        u.revertible && (this.$status.append(this.$revertible),
        this.$revertible.on("click", function(e) {
            e.preventDefault(),
            u.revertible() && a.$revertible.remove()
        })),
        this.$status.append(this.$savingStatus).append(this.$lastSaved),
        this.modified = !1,
        this.lastSaveTime = null,
        this.showSaving = function(e) {
            return
        }
        ,
        this.setLastSaved = function() {}
        ,
        this.updateLastSaved = function() {
            a.$lastSaved.show(),
            a.$lastSaved.text(i.translate("Draft " + (this.modified ? "out of sync" : "up to date")) + "." + (this.lastSaveTime === null ? "" : i.translate(" Saved at ") + this.lastSaveTime.format("h:mm:ss a, MMMM Do YYYY")))
        }
        ,
        this.save = function() {
            if (a.saving) {
                a.repeatSave = !0;
                return
            }
            a.modified = !1,
            a.showSaving(!0);
            var e = u.dataFactory();
            return a.saving = !0,
            t.ajax({
                url: u.url,
                type: "PUT",
                dataType: "json",
                data: JSON.stringify(e),
                contentType: "application/json",
                success: function(e) {
                    a.lastSaveTime = n(),
                    a.updateLastSaved()
                },
                error: function() {}
            }).always(function() {
                a.showSaving(!1),
                a.saving = !1,
                a.repeatSave && (a.repeatSave = !1,
                a.save())
            })
        }
        ,
        this.watchers = [];
        for (var f = 0, l = u.watch.length; f < l; ++f)
            this.watchers.push(new r(u.watch[f],function() {
                a.modified = !0,
                a.updateLastSaved()
            }
            ,function() {
                return function() {
                    a.save()
                }
            }(),{}))
    }
}),
define("PoE/Forum/Thread/Autosave", ["require", "jquery", "moment-tz", "PoE/Forum/Autosave"], function(e) {
    var t = e("jquery")
      , n = e("moment-tz")
      , r = e("PoE/Forum/Autosave");
    return function(e, n, i, s, o, u) {
        var a = t(n), f = t(e), l, c;
        switch (s) {
        case "new":
            l = "forumId";
            break;
        case "edit":
            l = "threadId";
            break;
        default:
            return
        }
        c = {
            url: "/api/forum/thread/draft",
            watch: [a, f],
            dataFactory: function() {
                var e = {};
                return e.content = a.val(),
                e.title = f.val(),
                e[l] = o,
                e
            }
        },
        u.revertible && (c.revertible = function() {
            return confirm("Revert to original thread content?") ? (f.val(u.revertible.title),
            a.val(u.revertible.content),
            !0) : !1
        }
        ),
        this.autosave = new r(i,s,o,c)
    }
}),
define("PoE/Forum/Thread/Tags", ["plugins"], function(e) {
    return function(t, n) {
        var r = e("select#tags");
        r.parent().addClass("bootstrap"),
        r.select2({
            theme: "bootstrap",
            language: n,
            tags: !0,
            createTag: function(e) {
                return !1
            },
            maximumSelectionLength: t,
            tokenSeparators: [","]
        })
    }
}),
define("PoE/View/Profile/Badges", ["require", "plugins", "PoE/Helpers"], function(e) {
    var t = e("plugins")
      , n = e("PoE/Helpers");
    return function(e, r) {
        this.updateAvailableBadges = function() {
            t(".badges > .showcase-badge:gt(" + (r - 1).toString() + ")").remove();
            var i = t(".badges > .showcase-badge").map(function() {
                return t(this).data("id")
            })
              , s = i.length >= r
              , o = t(".badge-category").each(function(n, r) {
                var s = !1
                  , o = function(e, n) {
                    n || n === undefined ? (t(e).removeClass("disabled"),
                    t(e).draggable("option", "disabled", !1)) : (t(e).addClass("disabled"),
                    t(e).draggable("option", "disabled", !0))
                }
                  , u = t(r).find(".badge");
                u.each(function(e, n) {
                    var r = t(n).data("id");
                    t.inArray(r, i) >= 0 ? (s = !0,
                    o(n, !1)) : o(n, !0)
                }),
                s && e && u.each(function(e, n) {
                    t(n).hasClass("custom") || o(n, !1)
                })
            });
            t(".profile-badges-showcase").toggleClass("full", s);
            var u = "";
            s ? u = n.translate("Limit reached!") : (u = e ? "You may have up to {MAX} forum supporter titles." : "You may have up to {MAX} forum badges.",
            u = n.translate(u, {
                hash: {
                    MAX: r
                }
            })),
            t(".profile-badges-showcase > .message").html(u)
        }
        ,
        this.submitBadges = function() {
            var e = t(".badges").sortable("toArray", {
                attribute: "data-id"
            });
            t.ajax({
                url: "/api/badges",
                type: "POST",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify({
                    badges: e
                }),
                success: function(e) {}
            })
        }
        ,
        this.render = function() {
            var n = this;
            t(document).ready(function() {
                var r = e ? "badge roleLabel" : "badge";
                t(".badges").sortable({
                    items: "> .badge",
                    placeholder: r,
                    update: function(e, r) {
                        t(r.item).removeClass("ui-draggable").removeClass("ui-draggable-handle"),
                        t(".badges > .badge").addClass("showcase-badge").removeAttr("style"),
                        t(this).sortable("refresh"),
                        n.updateAvailableBadges(),
                        n.submitBadges()
                    },
                    start: function(e, n) {
                        t(".badges").addClass("highlight")
                    },
                    stop: function(e, n) {
                        t(".badges").removeClass("highlight")
                    }
                }).disableSelection(),
                t(".badge-category > .badge").draggable({
                    connectToSortable: ".badges",
                    revert: "invalid",
                    revertDuration: 0,
                    helper: "clone",
                    appendTo: "body",
                    zIndex: 100,
                    drag: function(e, n) {
                        t(".badges").addClass("highlight")
                    },
                    stop: function(e, n) {
                        t(".badges").removeClass("highlight")
                    }
                }).disableSelection(),
                t(".profile-badges-available").droppable({
                    accept: ".showcase-badge",
                    over: function(e, n) {
                        t(".trash-overlay").show(),
                        t(".badges").removeClass("highlight")
                    },
                    out: function(e, n) {
                        t(".trash-overlay").hide(),
                        t(".badges").addClass("highlight")
                    },
                    drop: function(e, r) {
                        t(r.draggable).removeClass("showcase-badge"),
                        t(r.draggable).remove(),
                        t(r.helper).remove(),
                        t(".trash-overlay").hide(),
                        n.updateAvailableBadges()
                    }
                }).disableSelection(),
                n.updateAvailableBadges()
            })
        }
        ,
        this.render()
    }
}),
define("PoE/Forum/Post/Autosave", ["require", "jquery", "moment-tz", "PoE/Forum/Autosave"], function(e) {
    var t = e("jquery")
      , n = e("moment-tz")
      , r = e("PoE/Forum/Autosave");
    return function(e, n, i, s, o) {
        var u = t(e), a, f;
        switch (i) {
        case "new":
            a = "threadId";
            break;
        case "edit":
            a = "postId";
            break;
        default:
            return
        }
        f = {
            url: "/api/forum/post/draft",
            watch: [u],
            dataFactory: function() {
                var e = {};
                return e.content = u.val(),
                e[a] = s,
                e
            }
        },
        o.revertible && (f.revertible = function() {
            return confirm("Revert to original post content?") ? (u.val(o.revertible.content),
            !0) : !1
        }
        ),
        this.autosave = new r(n,i,s,f)
    }
}),
define("PoE/Form", ["jquery"], function(e) {
    window.POE = window.POE || {};
    var t = window.POE;
    t.Form = function(t, n, r) {
        this.formEl = t,
        this.submit = function() {
            this.formEl.submit()
        }
        ,
        this.init = function() {
            var t = this;
            this.opts = {
                successFunc: function(e) {},
                dataPreSubmitFunc: function(e) {},
                url: "/"
            },
            e.extend(this.opts, r),
            this.formEl.submit(function() {
                t.clearMessages();
                var r = {};
                for (var i = 0, s = n.length; i < s; ++i) {
                    var o = n[i]
                      , u = t.getValue(o);
                    if (u === null)
                        continue;
                    r[o] = u
                }
                return t.opts.dataPreSubmitFunc(r),
                e.ajax({
                    url: t.opts.url,
                    type: "POST",
                    dataType: "json",
                    data: r,
                    success: function(e) {
                        return function(t) {
                            t.status ? e.opts.successFunc(t) : e.addMessages(t.messages)
                        }
                    }(t)
                }),
                !1
            })
        }
        ,
        this.clearMessages = function() {
            this.formEl.find(".errors").remove()
        }
        ,
        this.addMessages = function(t) {
            for (var r = 0, i = n.length; r < i; ++r) {
                var s = n[r]
                  , o = "";
                if (t[s] === undefined)
                    continue;
                for (var u in t[s])
                    o += "<li>" + t[s][u] + "</li>";
                var a = this.formEl.find('[name="' + s + '"]')
                  , f = e('<ul class="errors">' + o + "</ul>").hide();
                a.parents("div.form-text-l:first").after(f)
            }
            this.formEl.find("ul.errors").fadeIn("fast")
        }
        ,
        this.getValue = function(t) {
            var n = this.formEl.find('[name="' + t + '"]')
              , r = n.length
              , i = null;
            return r > 1 ? n.each(function(t, n) {
                n = e(n),
                n.is(":checkbox") ? n.is(":checked") && (i === null && (i = []),
                i.push(n.val())) : i.push(n.val())
            }) : i = n.val(),
            i
        }
        ,
        this.init()
    }
}),
define("PoE/PublicGameAccessCountdown", ["plugins"], function(e) {
    return function(t, n, r, i) {
        this.init = function() {
            this.containerEl = e(t),
            this.timerEl = e(n),
            this.preEl = e(r),
            this.activeEl = e(i),
            this.preActive = !1
        }
        ,
        this.run = function(t, n) {
            var r = this
              , i = function(e, t) {
                e > 0 ? r.startPreCountdown(e, t) : t > 0 ? r.startActiveCountdown(t) : r.accessEnded()
            };
            t === undefined || n === undefined ? e.ajax({
                url: "/index/public-game-access-countdown-query",
                async: !0,
                cache: !1,
                dataType: "json",
                data: {},
                success: function(e) {
                    e.success && i(e.ss, e.es)
                }
            }) : i(t, n)
        }
        ,
        this.startPreCountdown = function(e, t) {
            this.preEl.show(),
            this.activeEl.hide(),
            this.timerEl.show(),
            this.containerEl.show(),
            this.containerEl.css("display", "inline-block"),
            this.preActive = !0,
            this.timerEl.countdown({
                until: e,
                layout: '<div class="days">{dn}</div><div class="hours">{hn}</div><div class="minutes">{mn}</div><div class="seconds">{sn}</div>',
                onExpiry: function(n) {
                    return function() {
                        n.startActiveCountdown(t - e)
                    }
                }(this)
            })
        }
        ,
        this.startActiveCountdown = function(e) {
            this.activeEl.show(),
            this.preEl.hide(),
            this.containerEl.show(),
            this.containerEl.css("display", "inline-block"),
            this.timerEl.show();
            var t = function(e) {
                return function() {
                    e.accessEnded()
                }
            }(this);
            this.preActive ? this.timerEl.countdown("change", {
                until: e,
                onExpiry: t
            }) : this.timerEl.countdown({
                layout: '<div class="days">{dn}</div><div class="hours">{hn}</div><div class="minutes">{mn}</div><div class="seconds">{sn}</div>',
                until: e,
                onExpiry: t
            }),
            this.preActive = !1
        }
        ,
        this.accessEnded = function() {
            this.activeEl.hide(),
            this.timerEl.hide(),
            this.preEl.show(),
            this.containerEl.slideUp()
        }
        ,
        this.init()
    }
}),
define("PoE/Widget/YoutubeVideo", ["require", "jquery"], function(e) {
    var t = e("jquery")
      , n = function(e) {
        var n = e instanceof t ? e : t(e);
        if (!n.length)
            return;
        var r = n.attr("src");
        if (r)
            return;
        var i = n.data("src");
        i && n.attr("src", i)
    };
    return n
}),
define("PoE/Shop", ["require", "plugins", "PoE/Helpers", "PoE/Widget/YoutubeVideo"], function(e) {
    var t = e("plugins")
      , n = e("PoE/Helpers")
      , r = e("PoE/Widget/YoutubeVideo")
      , i = {
        toggleWatchlistItem: function(e, r) {
            var i = !r.hasClass("added");
            r.addClass("disabled"),
            t.ajax({
                url: "/shop/watchlist-item",
                type: "POST",
                dataType: "json",
                data: {
                    item: e,
                    watch: i
                },
                success: function(e) {
                    return e ? (r.addClass("added"),
                    r.html(n.translate("Remove from Watchlist"))) : (r.removeClass("added"),
                    r.html(n.translate("Add to Watchlist"))),
                    r.removeClass("disabled"),
                    !0
                },
                error: function(e) {
                    return r.removeClass("disabled"),
                    !1
                }
            })
        },
        showBuyItemModal: function(e, n) {
            if (t("#colorbox").is(":visible"))
                return;
            n = t(n),
            window.location.hash = "microtransaction-" + e;
            var i = n.closest(".shopItemBase")
              , s = i.find(".shopBuyItemModal:first")
              , o = i.find(".video");
            if (o.length)
                var u = new r(o);
            return t(document).bind("cbox_open", function() {
                s.show(),
                t("#colorbox").addClass("colorBoxTheme1"),
                t(".buy-for-friend-checkbox").prop("checked", !1),
                t(".shopBuyItemModal .content, .shopBuyPackageModal .content").css("right", "0px"),
                t(".shopBuyItemModal .buy-for-friend, .shopBuyPackageModal .buy-for-friend").css("left", "650px"),
                t(".buy-for-friend").show()
            }),
            t(document).bind("cbox_cleanup", function() {
                s.hide(),
                window.location.hash = "/",
                t(document).unbind("cbox_open"),
                t(document).unbind("cbox_cleanup")
            }),
            t(document).bind("cbox_close", function() {
                t("#colorbox").removeClass("colorBoxTheme1"),
                t(document).unbind("cbox_close")
            }),
            t.colorbox({
                inline: !0,
                href: s
            }),
            !1
        },
        showVideoPreviewModal: function(e) {
            e = t(e);
            var n = e.parent().find(".shopPreviewModal")
              , i = new r(n.find(".video"));
            return t(document).bind("cbox_open", function() {
                n.show(),
                t("#colorbox").addClass("colorBoxTheme1")
            }),
            t(document).bind("cbox_cleanup", function() {
                n.hide(),
                t(document).unbind("cbox_open"),
                t(document).unbind("cbox_cleanup")
            }),
            t(document).bind("cbox_close", function() {
                t("#colorbox").removeClass("colorBoxTheme1"),
                t(document).unbind("cbox_close")
            }),
            t.colorbox({
                inline: !0,
                href: n
            }),
            !1
        },
        buyItem: function(e, n, r) {
            n = t(n);
            var i = n.closest(".purchaseOptions")
              , s = n.closest(".shopBuyItemModal")
              , o = s.find(".buyButton")
              , u = s.find(".buyButtonDisabled")
              , a = s.find(".purchasingInfo")
              , f = s.find(".backButton")
              , l = s.find(".purchasedInfo")
              , c = s.find(".errorInfo")
              , h = c.find(".message")
              , p = s.find(".totalCost")
              , d = "";
            l.hide(),
            a.hide(),
            n.closest(".shopBuyItemModal").find(".buy-for-friend-checkbox").prop("checked") && (d = n.closest(".shopBuyItemModal").find(".friend-selector .row.selected").html());
            if (!d || confirm("Are you sure you want to buy this item for " + d + "?"))
                o.hide(),
                a.show(),
                p.hide(),
                u.show(),
                t(".buy-for-friend").hide(),
                t(".buy-for-friend").prop("checked", !1),
                t(".shopBuyItemModal .content, .shopBuyPackageModal .content").animate({
                    right: "0px"
                }, 600),
                t(".shopBuyItemModal .buy-for-friend, .shopBuyPackageModal .buy-for-friend").animate({
                    left: "650px"
                }, 600),
                t.fn.colorbox.resize(),
                t.ajax({
                    url: "/shop/buy-item",
                    type: "POST",
                    dataType: "json",
                    data: {
                        itemID: e,
                        friendName: d
                    },
                    success: function(e) {
                        a.hide(),
                        r ? o.show() : f.css("display", "block"),
                        u.hide();
                        if (e === !1)
                            h.text("An error has occurred."),
                            c.show();
                        else
                            switch (e.status) {
                            case "success":
                                l.show();
                                break;
                            case "error":
                                h.text(e.message),
                                c.show()
                            }
                        POE.Shop.updatePage(),
                        t.fn.colorbox.resize()
                    },
                    error: function(e) {
                        return a.hide(),
                        f.css("display", "block"),
                        u.hide(),
                        h.text("An error has occurred."),
                        c.show(),
                        !1
                    }
                });
            return !1
        },
        toggleFriend: function(e) {
            e = t(e),
            e.prop("checked") ? (t(".friend-selector .row").removeClass("selected"),
            e.closest(".shopBuyItemModal").find(".friend-selector .row:first-child").addClass("selected"),
            t(".shopBuyItemModal .content, .shopBuyPackageModal .content").animate({
                right: "200px"
            }, 600),
            t(".shopBuyItemModal .buy-for-friend, .shopBuyPackageModal .buy-for-friend").animate({
                left: "450px"
            }, 600)) : (t(".shopBuyItemModal .content, .shopBuyPackageModal .content").animate({
                right: "0px"
            }, 600),
            t(".shopBuyItemModal .buy-for-friend, .shopBuyPackageModal .buy-for-friend").animate({
                left: "650px"
            }, 600))
        },
        selectFriend: function(e) {
            e = t(e),
            t(".friend-selector .row").removeClass("selected"),
            e.addClass("selected")
        },
        cancelBuyItem: function() {
            return t.colorbox.close(),
            !1
        },
        redirPurchaseFromBuyItem: function(e) {
            return POE.Shop.rememberRecent(e, function() {
                window.location.href = "/purchase"
            }),
            !1
        },
        rememberRecent: function(e, n) {
            t.ajax({
                url: "/shop/remember-recently-viewed-item",
                type: "POST",
                dataType: "json",
                data: {
                    itemID: e
                },
                success: n,
                error: function(e) {
                    return !1
                }
            })
        },
        updatePage: function() {
            var e = {
                items: []
            }
              , n = t(".shopCurrentCoinValue.account")
              , r = t(".shopCurrentCoinValue.guild")
              , i = t(".shopHideDuringReload")
              , s = t(".shopShowDuringReload");
            t(".shopItemBase").each(function() {
                var n = t(this)
                  , r = n.data("item-id");
                e.items.push({
                    id: n.attr("id"),
                    itemID: r
                });
                var i = n.find(".disablingLoadingContainer:first")
                  , s = i.find(".loading");
                s.width(n.width()).height(n.height()),
                i.width(n.width()).height(n.height())
            }),
            i.hide(),
            s.show(),
            n.text("Loading..."),
            r.text("Loading..."),
            t.ajax({
                url: "/shop/xhr-update-page",
                type: "POST",
                dataType: "json",
                data: e,
                success: function(e) {
                    if (e === !1)
                        return;
                    for (var o = 0, u = e.items.length; o < u; ++o) {
                        var a = t("#" + e.items[o].id)
                          , f = e.items[o].itemID;
                        a.replaceWith(e.items[o].html),
                        a = t("#" + e.items[o].id)
                    }
                    n.text(e.accountPoints),
                    r.text(e.guildPoints),
                    i.show(),
                    s.hide()
                },
                error: function(e) {
                    return !1
                }
            })
        },
        loadHashTag: function() {
            var e = "#microtransaction-"
              , n = this;
            if (window.location.hash.indexOf(e) === -1) {
                window.location.hash = "";
                return
            }
            var r = window.location.hash.substr(e.length - 1)
              , i = null
              , s = r.indexOf(",");
            s === -1 ? i = r.substr(1) : i = r.substring(1, s);
            var o = !1;
            t(".shopItemBase").each(function(e, r) {
                r = t(r);
                if (r.data("item-id") !== i)
                    return;
                return o = !0,
                n.showBuyItemModal(i, r),
                !1
            }),
            o || (window.location.hash = "")
        }
    };
    return t(document).on("click", ".shopItemBase a.watchlist", function(e) {
        var n = t(this).parents(".shopItemBase").data("item-id");
        i.toggleWatchlistItem(n, t(this)),
        e.preventDefault()
    }),
    i
}),
define("PoE/View/Widget/Pagination", ["plugins", "Backbone", "Handlebars", "PoE/Loader", "PoE/Handlebars/Helpers"], function(e, t, n, r) {
    return t.View.extend({
        initialize: function() {
            this.collection.on("reset", this.doReset, this),
            this.collection.on("change", this.render, this),
            this.xhr = null
        },
        events: {
            "click a.gotoPage": "gotoPage",
            "change .perPageOptions": "changePerPage"
        },
        gotoPage: function(t) {
            var n = e(t.target)
              , r = n.data("gotopage");
            this.doGoToPage(r),
            t.preventDefault()
        },
        doGoToPage: function(e) {
            var t = this;
            this.xhr && (this.xhr.abort(),
            this.xhr = null),
            r.start(),
            t.trigger("loadStart");
            var n = this.collection.goTo(e);
            this.xhr = n,
            n.always(function(e) {
                return function() {
                    t.trigger("loadEnd"),
                    t.xhr = null
                }
            }(n))
        },
        changePerPage: function(e) {
            var t = this;
            r.start(),
            this.xhr && (this.xhr.abort(),
            this.xhr = null),
            t.trigger("loadStart"),
            this.collection.howManyPer(parseInt(this.$perPageOptions.find("option:selected").val(), 10))
        },
        doReset: function() {
            r.done(),
            this.render()
        },
        render: function() {
            var e = n.compile("{{pagination2}}")
              , t = this.collection.info()
              , r = {
                info: t,
                perPageOptions: this.collection.perPageOptions
            };
            t.totalRecords <= t.perPage && this.collection.perPageOptions.length === 0 ? this.$el.addClass("hidden") : this.$el.removeClass("hidden"),
            this.$el.html(e(r)),
            this.$perPageOptions = this.$el.find(".perPageOptions")
        }
    })
}),
define("PoE/Backbone/Paginator", ["jquery", "Backbone"], function(e, t) {
    return t.Paginator.requestPager.extend({
        resetPaginator: function(e) {
            var t = this;
            _.defaults(t.paginator_ui, {
                firstPage: 0,
                currentPage: 1,
                perPage: 5,
                totalPages: 10
            }),
            _.each(t.paginator_ui, function(e, n) {
                _.isUndefined(t[n]) && (t[n] = t.paginator_ui[n])
            });
            var n = {};
            _.each(t.server_api, function(e, r) {
                _.isFunction(e) && (e = _.bind(e, t),
                e = e()),
                n[r] = e
            }),
            this.reset(this.parse(e))
        },
        perPageOptions: []
    })
}),
define("text!PoE/Profile/SelectAvatar.hbt", [], function() {
    return '<div class="links">\r\n    <div class="header">{{translate "Choose Avatar"}}<span class="separator">&raquo;</span></div>\r\n    <div class="selection{{#unless custom}} selected{{/unless}}"><a href="#public">{{translate "Public Avatars"}}</a></div>\r\n    {{#if hasCustom }}\r\n    <div class="selection{{#if custom}} selected{{/if}}"><a href="#custom">{{translate "Custom Avatars"}}</a></div>\r\n    {{/if}}\r\n    <div class="clearfix"></div>\r\n</div>\r\n<div class="clear"></div>\r\n<div class="avatars">\r\n{{#each avatars}}\r\n    <a href="#" class="avatar{{#if custom}} custom{{/if}}{{#if current}} current{{/if}}" data-id="{{ avatar_id }}">\r\n        <div class="content">\r\n            <img class="avatar-img" src="{{ image }}" />\r\n            {{#if custom }}\r\n            <strong class="bright2">{{ name }}</strong>\r\n            {{/if}}\r\n        </div>\r\n        <span class="control">{{#if current}}{{translate "Current Avatar"}}{{else}}{{translate "Use Avatar"}}{{/if}}</span>\r\n    </a>\r\n{{/each}}\r\n</div>\r\n<div class="clear"></div>\r\n<div class="pagination"></div>\r\n'
}),
define("PoE/Profile/SelectAvatar", ["require", "plugins", "Backbone", "PoE/Handlebars/TemplateCollection", "PoE/View/Widget/Pagination", "PoE/Backbone/Paginator", "PoE/Helpers", "text!PoE/Profile/SelectAvatar.hbt"], function(e) {
    var t = e("plugins")
      , n = e("Backbone")
      , r = e("PoE/Handlebars/TemplateCollection")
      , i = e("PoE/View/Widget/Pagination")
      , s = e("PoE/Backbone/Paginator")
      , o = e("PoE/Helpers");
    e("text!PoE/Profile/SelectAvatar.hbt");
    var u = n.Model.extend({})
      , a = s.extend({
        model: u,
        paginator_ui: {
            firstPage: 1,
            currentPage: 1,
            perPage: 8,
            totalPages: 1,
            custom: !1
        },
        firstPage: 1,
        currentPage: 1,
        perPage: 8,
        totalPages: 1,
        custom: !1,
        paginator_core: {
            url: "/my-account/get-avatars",
            dataType: "json"
        },
        perPageOptions: [],
        server_api: {
            page: function() {
                return this.currentPage
            },
            perPage: function() {
                return this.perPage
            },
            custom: function() {
                return this.custom
            }
        },
        parse: function(e) {
            return this.totalRecords = e.total,
            this.totalPages = Math.ceil(e.total / this.perPage),
            e.collection
        }
    });
    return n.View.extend({
        initialize: function(e) {
            var t = this;
            this.hasCustom = e.hasCustom,
            this.collection = new a,
            this.pagination = new i({
                collection: this.collection
            }),
            this.collection.on("reset", function() {
                t.render()
            }),
            this.fetch()
        },
        events: {
            "click .selection a": "changeType",
            "click .avatar": "changeAvatar"
        },
        changeType: function(e) {
            var n = t(e.currentTarget);
            t(".selection a").removeClass("selected"),
            n.addClass("selected"),
            this.collection.currentPage = 1,
            this.fetch(n.attr("href") === "#custom"),
            e.preventDefault()
        },
        changeAvatar: function(e) {
            var n = t(e.currentTarget);
            if (!n.hasClass("current")) {
                var r = n.data("id")
                  , i = n.hasClass("custom");
                this.submitChangeAvatar(n, r, i)
            }
            e.preventDefault()
        },
        submitChangeAvatar: function(e, n, r) {
            var i = this
              , s = t(".avatar.current").first();
            t.ajax({
                url: "/my-account/set-avatar-image-id",
                contentType: "json",
                dataType: "json",
                data: {
                    id: n,
                    custom: r
                },
                success: function() {
                    var u = function(e, t, n) {
                        var r = i.collection.where(e);
                        return r.length > 0 ? (r[0].set(t, n),
                        r[0]) : undefined
                    }
                      , a = u({
                        current: !0
                    }, "current", !1)
                      , f = u({
                        avatar_id: n,
                        custom: r
                    }, "current", !0);
                    a && i.collection.add(a),
                    f && i.collection.add(f),
                    s.removeClass("current").find(".control").html(o.translate("Use Avatar")),
                    e.addClass("current").find(".control").html(o.translate("Current Avatar"));
                    var l = e.find(".avatar-img").attr("src");
                    t("#avatar-image-container .avatar").toggleClass("frame1", !r),
                    t("#avatar-image-container .avatar img").attr("src", l)
                }
            })
        },
        attach: function(e) {
            var n = this;
            this.button = t(e),
            this.button.colorbox({
                inline: !0,
                scrolling: !1,
                className: "inventoryManagerColorbox",
                onLoad: function() {
                    n.render()
                }
            })
        },
        fetch: function(e) {
            var t = this;
            this.collection.custom = e,
            this.collection.perPage = e ? 8 : 16,
            this.collection.fetch().done(function() {
                t.render()
            })
        },
        render: function() {
            var e = this;
            r.load("PoE/Profile/SelectAvatar.hbt").done(function(t) {
                var n = {
                    hasCustom: e.hasCustom,
                    custom: e.collection.custom,
                    avatars: e.collection.toJSON()
                };
                e.$el.html(t(n)),
                e.button.colorbox.resize(),
                e.pagination.render(),
                e.$el.find(".pagination").replaceWith(e.pagination.$el),
                e.button.colorbox.resize(),
                e.pagination.delegateEvents(),
                e.delegateEvents()
            })
        }
    })
}),
define("PoE/Ladder/Ladder", ["plugins"], function(e) {
    return function() {
        var t = e("#ladderStatusContainer")
          , n = e("#leagueStatus")
          , r = e("#leagueCountdownBox")
          , i = r.find(".countdownLabel:first")
          , s = r.find(".timer:first")
          , o = e("#leagueBeginLabel")
          , u = e("#leagueEndLabel");
        this.status = null,
        this.init = function() {
            switch (LADDER_STATUS.status) {
            case "waitStart":
                this.startWait();
                break;
            case "inProgress":
                this.startActive();
                break;
            case "complete":
                this.complete();
                return
            }
        }
        ,
        this.startWait = function() {
            LADDER_STATUS.startSecFromNow == 0 ? this.startActive() : (this.status = "waitStart",
            s.countdown({
                until: LADDER_STATUS.startSecFromNow,
                onExpiry: function(e) {
                    return function() {
                        e.startActive()
                    }
                }(this)
            }))
        }
        ,
        this.startActive = function() {
            var e = function(e) {
                return function() {
                    e.complete()
                }
            }(this);
            this.status == "waitStart" ? (this.status = "inProgress",
            this.updateStatus(),
            s.countdown("change", {
                until: LADDER_STATUS.endSecFromStart,
                onExpiry: e
            })) : (LADDER_STATUS.endSecFromNow == 0 && this.complete(),
            s.countdown({
                until: LADDER_STATUS.endSecFromNow,
                onExpiry: e
            }))
        }
        ,
        this.updateStatus = function() {
            n.text(LADDER_STATUS[this.status].message).removeClass().addClass(LADDER_STATUS[this.status]["class"]),
            o.text(LADDER_STATUS[this.status].beginLabel),
            u.text(LADDER_STATUS[this.status].endLabel),
            i.text(LADDER_STATUS[this.status].countdownLabel).removeClass([LADDER_STATUS.waitStart["class"], LADDER_STATUS.inProgress["class"]]).addClass(LADDER_STATUS[this.status]["class"])
        }
        ,
        this.complete = function() {
            this.status = "complete",
            this.updateStatus(),
            r.fadeOut("slow", function() {
                e(this).remove(),
                t.removeClass("ladderStatusCountdownActive")
            })
        }
        ,
        this.init()
    }
}),
define("PoE/Util/Date", ["jquery", "moment-tz"], function(e, t) {
    return {
        Countdown: function(n, r, i) {
            t.isMoment(n) ? n = n.unix() * 1e3 : n = n.getTime();
            var s = e.Deferred()
              , o = setInterval(function() {
                i && i(),
                (new Date).getTime() > n && (clearInterval(o),
                s.resolve())
            }, 1e3);
            return r && s.done(r),
            s.promise()
        },
        getTimezone: function() {
            var t = new Date, n = new Date, r = new Date, i, s, o, u, a = e("#create_account");
            n.setDate(1),
            n.setMonth(1),
            r.setDate(1),
            r.setMonth(7),
            i = parseInt(t.getTimezoneOffset()),
            s = parseInt(n.getTimezoneOffset()),
            o = parseInt(r.getTimezoneOffset());
            if (s == o)
                u = !1;
            else {
                var f = s - o < 0;
                f && i == s || !f && i == o ? u = !0 : u = !1
            }
            return {
                offset: i,
                dst: u
            }
        }
    }
}),
define("PoE/Model/Account/Account", ["Backbone"], function(e) {
    return e.RelationalModel.extend({
        relations: []
    })
}),
define("PoE/Model/League/LadderEntry", ["Backbone", "PoE/Util/Date", "PoE/Model/Account/Account"], function(e, t, n) {
    return e.RelationalModel.extend({
        relations: [{
            type: e.HasOne,
            key: "account",
            relatedModel: n
        }],
        initialize: function() {}
    })
}),
define("PoE/Collection/League/LadderEntries", ["jquery", "Backbone", "PoE/Model/League/LadderEntry", "PoE/Backbone/Paginator"], function(e, t, n, r) {
    return r.extend({
        model: n,
        paginator_core: {
            url: "/api/ladders",
            dataType: "json"
        },
        paginator_ui: {
            firstPage: 1,
            currentPage: 1,
            perPage: 5,
            totalPages: 10
        },
        server_api: {
            offset: function() {
                return (this.currentPage - 1) * this.perPage
            },
            limit: function() {
                return this.perPage
            },
            id: function() {
                return this.id
            },
            type: "league"
        },
        perPageOptions: [5, 20, 50, 100],
        parse: function(e) {
            return e.limit && (this.perPage = parseInt(e.limit, 10)),
            e.leagueId && (this.id = e.leagueId),
            e.pvpMatchId && (this.id = e.pvpMatchId),
            e.disableAccountNames && (this.disableAccountNames = !0),
            this.totalRecords = e.total,
            this.totalPages = Math.ceil(e.total / this.perPage),
            e.entries
        }
    })
}),
define("PoE/Widget/ProfileLink/ProfileLink", ["require", "jquery", "Backbone", "PoE/Layout/Popup/Popup", "PoE/Deployment/Config"], function(e) {
    var t = e("jquery")
      , n = e("Backbone")
      , r = e("PoE/Layout/Popup/Popup")
      , i = e("PoE/Deployment/Config")
      , s = {}
      , o = {};
    return n.View.extend({
        initialize: function() {
            var e = this
              , n = t.Deferred();
            this.loaded = n.promise();
            if (i.twitchClientId && this.hasTwitch()) {
                this.$twitch = this.$el.find(".twitch"),
                this.loadTwitch().done(function() {
                    n.resolve()
                }),
                this.options.twitchClickHandler && this.$twitch.on("click", function(t) {
                    if (!e.result)
                        return;
                    e.options.twitchClickHandler(t, e.result)
                }),
                this.$twitch.on("mouseover", function(n) {
                    e.isStreaming() && (e.twitchPopup = new r(t('<div class="twitchProfilePopup"><div class="name"></div><img></div>')),
                    e.twitchPopup.el.find("img").attr("src", e.result.stream.preview.medium),
                    e.twitchPopup.el.find(".name").text(e.result.stream.channel.display_name),
                    e.twitchPopup.smartPositionByEl(e.$twitch))
                }),
                this.$twitch.on("mouseout", function(n) {
                    e.twitchPopup && t(".twitchProfilePopup").hide()
                });
                if (this.isTwitchAutoRefresh()) {
                    var u = e.$el.attr("data-twitch-user");
                    clearTimeout(o[u]),
                    o[u] = setTimeout(function() {
                        delete s[u],
                        e.initialize()
                    }, 6e4 + Math.round(Math.random() * 60) * 1e3)
                }
            } else
                n.resolve()
        },
        loadPromise: function() {
            return this.loaded
        },
        hasTwitch: function() {
            return this.$el.hasClass("hasTwitch") && this.$el.attr("data-twitch-user")
        },
        isTwitchAutoRefresh: function() {
            return this.$el.hasClass("twitchAutoRefresh")
        },
        isStreaming: function() {
            return this.hasTwitch() && this.result && this.result.stream && this.result.stream.game === "Path of Exile"
        },
        getTwitchStream: function() {
            return this.result
        },
        handleResponse: function(e) {
            var t = "https://api.twitch.tv/kraken/streams/";
            if (e && e._links && e._links.self) {
                var n = e._links.self.substr(t.length).toLowerCase();
                s[n].resolve(e)
            }
        },
        loadTwitch: function() {
            var e = this.$el.attr("data-twitch-user")
              , n = this;
            e = e.toLowerCase(),
            window.twcb || (window.twcb = function(e) {
                n.handleResponse(e)
            }
            );
            var r = t.Deferred();
            return s[e] = r,
            t.ajax({
                url: "https://api.twitch.tv/kraken/streams/" + encodeURI(e) + "?callback=twcb&client_id=" + i.twitchClientId,
                dataType: "script",
                cache: !0
            }),
            n.twitchPopup = !1,
            s[e].done(function(e) {
                n.result = e;
                var r = t('.profile-link[data-twitch-user="' + n.$el.attr("data-twitch-user").replace('"', '"') + '"]');
                n.isStreaming() ? (r.find(".twitch").attr("title", e.stream.channel.status ? e.stream.channel.status : "Streaming Now!"),
                r.addClass("twitchOnline twitchShow"),
                r.removeClass("twitchOffline")) : (r.find(".twitch").attr("title", "Offline"),
                r.addClass("twitchOffline"),
                r.removeClass("twitchOnline"),
                r.removeClass("twitchShow"),
                n.options.showOffline && n.$el.addClass("twitchShow"))
            }),
            s[e]
        }
    })
}),
define("text!PoE/Widget/League/Ladder/LadderEntry.hbt", [], function() {
    return '<td class="onlineStatus"><img class="onlineStatus" src="/image/ladder/{{#if online}}online{{else}}offline{{/if}}.png" alt="{{#if online}}{{translate "Online"}}{{else}}{{translate "Offline"}}{{/if}}" title="{{#if online}}{{translate "Online"}}{{else}}{{translate "Offline"}}{{/if}}" /></td>\n<td class="rank">{{rank}}</td>\n{{#if account.name}}\n    <td class="account">{{profileLink account manualInit=true}}</td>\n    <td class="character">{{character.name}}{{#if dead}} (<span class="deadText">{{translate "Dead"}}</span>){{/if}} {{#if retired}} (<span class="deadText">{{translate "Retired"}}</span>) {{/if}}</td>\n{{else}}\n    <td class="character">{{profileLink account characterName=character.name garena=true}}{{#if dead}} (<span class="deadText">{{translate "Dead"}}</span>){{/if}}{{#if retired}} (<span class="deadText">{{translate "Retired"}}</span>) {{/if}}</td>\n{{/if}}\n<td class="class">{{translate character.class}}</td>\n<td class="level">{{character.level}}</td>\n{{#if character.time}}\n<td class="experience">{{elapsed character.time}}</td>\n{{else}}\n<td class="experience">{{character.experience}}</td>\n{{/if}}'
}),
define("text!PoE/Widget/League/Ladder/PVPLadderEntry.hbt", [], function() {
    return '<td class="rank">{{rank}}</td>\n<td class="members">\n    {{#if rating}}\n        {{#each members}}\n            {{#if account.name}}\n                {{profileLink account manualInit=true}} - {{character_name}}\n            {{else}}\n                {{profileLink account characterName=character_name garena=true}}\n            {{/if}}\n        {{/each}}\n    {{else}}\n        <ul>\n            {{#each members}}\n            <li>\n                {{#if account.name}}\n                    {{profileLink account manualInit=true}} - {{character_name}}\n                {{else}}\n                    {{profileLink account characterName=character_name garena=true}}\n                {{/if}}\n                {{#if source_league_id}}\n                    ({{source_league_id}})\n                {{/if}}\n            </li>\n            {{/each}}\n        </ul>\n    {{/if}}\n</td>\n\n{{#if rating}}\n    <td class="rating">{{rating}}</td>\n{{else}}\n    {{#ifCond style "===" "Swiss"}}\n        <td class="gamesPlayed">{{games_played}}</td>\n        <td class="points">{{points}}</td>\n    {{else}}\n        <td class="points">{{points}}</td>\n        <td class="gamesPlayed">{{games_played}}</td>\n    {{/ifCond}}\n    <td class="tiebreaker">{{cumulative_opponent_points}}</td>\n{{/if}}'
}),
define("text!PoE/Widget/League/Ladder/LabyrinthLadderEntry.hbt", [], function() {
    return '<td class="onlineStatus"><img class="onlineStatus" src="/image/ladder/{{#if online}}online{{else}}offline{{/if}}.png" alt="{{#if online}}{{translate "Online"}}{{else}}{{translate "Offline"}}{{/if}}" title="{{#if online}}{{translate "Online"}}{{else}}{{translate "Offline"}}{{/if}}" /></td>\r\n<td class="rank">{{rank}}</td>\r\n{{#if account.name}}\r\n<td class="account">{{profileLink account manualInit=true}}</td>\r\n<td class="character">{{character.name}}{{#if dead}} (<span class="deadText">{{translate "Dead"}}</span>){{/if}} {{#if retired}} (<span class="deadText">{{translate "Retired"}}</span>) {{/if}}</td>\r\n{{else}}\r\n<td class="character">{{profileLink account characterName=character.name garena=true}}{{#if dead}} (<span class="deadText">{{translate "Dead"}}</span>){{/if}} {{#if retired}} (<span class="deadText">{{translate "Retired"}}</span>) {{/if}}</td>\r\n{{/if}}\r\n<td class="class">{{translate character.class}}</td>\r\n<td class="experience">{{elapsed time}}</td>\r\n'
}),
define("text!PoE/Widget/League/Ladder/PathOfEnduranceLadderEntry.hbt", [], function() {
    return '<td class="onlineStatus"><img class="onlineStatus" src="/image/ladder/{{#if online}}online{{else}}offline{{/if}}.png" alt="{{#if online}}{{translate "Online"}}{{else}}{{translate "Offline"}}{{/if}}" title="{{#if online}}{{translate "Online"}}{{else}}{{translate "Offline"}}{{/if}}" /></td>\r\n<td class="rank">{{rank}}</td>\r\n<td class="account wide">{{profileLink account manualInit=true}}</td>\r\n<td class="class wide">{{translate class}}</td>\r\n<td class="score">{{score}}</td>'
}),
define("PoE/Widget/League/Ladder/LadderEntry", ["plugins", "Backbone", "PoE/Handlebars/TemplateCollection", "PoE/Widget/ProfileLink/ProfileLink", "text!PoE/Widget/League/Ladder/LadderEntry.hbt", "text!PoE/Widget/League/Ladder/PVPLadderEntry.hbt", "text!PoE/Widget/League/Ladder/LabyrinthLadderEntry.hbt", "text!PoE/Widget/League/Ladder/PathOfEnduranceLadderEntry.hbt"], function(e, t, n, r) {
    return t.View.extend({
        tagName: "tr",
        initialize: function() {
            this.$el.addClass("entry"),
            this.type = this.options.type ? this.options.type : "league",
            this.pvp = this.options.pvp ? !0 : !1,
            this.style = this.options.style ? this.options.style : "",
            this.newRound = this.options.newRound ? !0 : !1,
            this.options.altRow && this.$el.addClass("even")
        },
        twitchClicked: function(e, t) {
            if (document.location.protocol === "https:" || !t.stream)
                return;
            e.preventDefault(),
            this.trigger("twitchProfileClicked", t)
        },
        getProfileLink: function() {
            return this.profileLink
        },
        render: function() {
            var t = this
              , i = e.Deferred()
              , s = "PoE/Widget/League/Ladder/LadderEntry.hbt";
            return this.type == "pvp" ? s = "PoE/Widget/League/Ladder/PVPLadderEntry.hbt" : this.type == "labyrinth" ? s = "PoE/Widget/League/Ladder/LabyrinthLadderEntry.hbt" : this.type == "path-of-endurance" && (s = "PoE/Widget/League/Ladder/PathOfEnduranceLadderEntry.hbt"),
            n.load(s).then(function(e) {
                var n = t.model.toJSON();
                n.pvp = t.pvp,
                n.style = t.style,
                (n.dead || n.retired) && t.$el.addClass("dead"),
                n.character && n.character.time && t.$el.addClass("finishTime"),
                t.newRound && t.$el.addClass("newRound"),
                t.$el.html(e(n)),
                t.profileLink = new r({
                    el: t.$el.find(".profile-link"),
                    showOffline: !0,
                    twitchClickHandler: function(e, n) {
                        t.twitchClicked(e, n)
                    }
                }),
                t.profileLink.loadPromise().done(function() {
                    i.resolve()
                })
            }, function() {}),
            i.promise()
        }
    })
}),
define("text!PoE/Widget/League/Ladder/Ladder.hbt", [], function() {
    return '{{#if options.title}}\n    <h2>{{options.title}}</h2>\n{{else}}\n    {{#unless options.hideTitle}}\n        <h2>{{translate "Ladder"}}</h2>\n    {{/unless}}\n{{/if}}\n\n<div class="controls">\n    <label for="autoRefresh">{{translate "Auto refresh"}}</label>\n    <input type="checkbox" value="1" name="autoRefresh" />\n    <input type="button" class="refresh button1" value="{{translate "Refresh"}}" />\n    {{#if league}}\n        <a class="exportCsv button1" href="/ladder/export-csv/league/{{uc league.id}}/index/1">{{translate "Export CSV"}}</a>\n    {{/if}}\n</div>\n<div class="loading"></div>\n<table>\n    <thead>\n            <tr>\n                <th></th>\n                <th>{{translate "Rank"}}</th>\n                {{#unless disableAccountNames}}<th>{{translate "Account"}}</th>{{/unless}}\n                <th>{{translate "Character"}}</th>\n                <th>{{translate "Class"}}</th>\n                <th>{{translate "Level"}}</th>\n                {{#if league.timedEvent}}\n                <th>{{translate "Time"}}</th>\n                {{else}}\n                <th>{{translate "Experience"}}</th>\n                {{/if}}\n            </tr>\n    </thead> \n    <tbody class="entries"></tbody>\n</table>\n<div class="pagination"></div>\n'
}),
define("text!PoE/Widget/League/Ladder/PVPLadder.hbt", [], function() {
    return '{{#if options.title}}\r\n<h2>{{options.title}}</h2>\r\n{{else}}\r\n{{#unless options.hideTitle}}\r\n<h2>{{translate "Ladder"}}</h2>\r\n{{/unless}}\r\n{{/if}}\r\n\r\n<div class="controls">\r\n    <label for="autoRefresh">{{translate "Auto refresh"}}</label>\r\n    <input type="checkbox" value="1" name="autoRefresh" />\r\n    <input type="button" class="refresh button1" value="{{translate "Refresh"}}" />\r\n    {{#if league}}\r\n    <a class="exportCsv button1" href="/ladder/export-csv/league/{{uc league.id}}/index/1">{{translate "Export CSV"}}</a>\r\n    {{/if}}\r\n</div>\r\n<div class="loading"></div>\r\n<table>\r\n    <thead>\r\n    <tr>\r\n        <th>{{translate "Rank"}}</th>\r\n        <th>{{translate "Members"}}</th>\r\n\r\n        {{#if league.glickoRatings}}\r\n        <th>{{translate "Rating"}}</th>\r\n        {{else}}\r\n\r\n        {{#ifCond league.style "===" "Swiss"}}\r\n        <th>{{translate "Games Played"}}</th>\r\n        <th>{{translate "Points"}}</th>\r\n        {{else}}\r\n        <th>{{translate "Points"}}</th>\r\n        <th>{{translate "Games Played"}}</th>\r\n        {{/ifCond}}\r\n        <th class="tiebreaker-hover">{{translate "Resistance"}}</th>\r\n        {{/if}}\r\n    </tr>\r\n    </thead>\r\n    <tbody class="entries"></tbody>\r\n</table>\r\n<div class="pagination"></div>\r\n'
}),
define("text!PoE/Widget/League/Ladder/LabyrinthLadder.hbt", [], function() {
    return '<div class="labyrinth-ladder-controls">\r\n    <div class="poeForm">\r\n        <button id="ladder-prev" class="button1">{{translate "Prev"}}</button>\r\n        <select class="league">\r\n            {{#each league.leagueOps}}\r\n            <option value="{{this}}" {{#ifCond this "==" ../league.leagueId}} selected {{/ifCond}}>{{this}}</option>\r\n            {{/each}}\r\n        </select>\r\n        <select class="difficulty">\r\n            {{#each league.difficultyOps}}\r\n            <option value="{{@key}}" {{#ifCond @key "==" ../league.difficulty}} selected {{/ifCond}}>{{this}}</option>\r\n            {{/each}}\r\n        </select>\r\n        <button id="ladder-next" class="button1">{{translate "Next"}}</button>\r\n    </div>\r\n</div>\r\n\r\n{{#if options.title}}\r\n<h2 id="ladder-title">{{options.title}}</h2>\r\n{{else}}\r\n{{#unless options.hideTitle}}\r\n<h2>{{translate "Ladder"}}</h2>\r\n{{/unless}}\r\n{{/if}}\r\n\r\n<div class="controls">\r\n    <label for="autoRefresh">{{translate "Auto refresh"}}</label>\r\n    <input type="checkbox" value="1" name="autoRefresh" />\r\n    <input type="button" class="refresh button1" value="{{translate \'Refresh\'}}" />\r\n    {{#if false}}\r\n    <a class="exportCsv button1" href="/ladder/export-csv/league/{{uc league.id}}/index/1">{{translate "Export CSV"}}</a>\r\n    {{/if}}\r\n</div>\r\n<div class="clear"></div>\r\n{{#if league.startTime}}\r\n<h2 id="ladder-time">{{translate "Start"}}: {{unixMoment league.startTime format=\'lll\'}}</h2>\r\n{{/if}}\r\n<div class="loading"></div>\r\n<table>\r\n    <thead>\r\n    <tr>\r\n        <th></th>\r\n        <th>{{translate "Rank"}}</th>\r\n        {{#unless disableAccountNames}}<th>{{translate "Account"}}</th>{{/unless}}\r\n        <th>{{translate "Character"}}</th>\r\n        <th>{{translate "Class"}}</th>\r\n        <th>{{translate "Time"}}</th>\r\n    </tr>\r\n    </thead>\r\n    <tbody class="entries"></tbody>\r\n</table>\r\n<div class="pagination"></div>'
}),
define("text!PoE/Widget/League/Ladder/PathOfEnduranceLadder.hbt", [], function() {
    return '<div class="labyrinth-ladder-controls">\r\n    <div class="poeForm">\r\n        <button id="ladder-prev" class="button1" style="display: {{#if league.prev}}inline-block{{else}}none{{/if}};">{{translate "Prev"}}</button>\r\n        <select class="league">\r\n            {{#each league.leagueOps}}\r\n            <option value="{{this}}" {{#ifCond this "==" ../league.leagueName}} selected {{/ifCond}}>{{this}}</option>\r\n            {{/each}}\r\n        </select>\r\n        <button id="ladder-next" class="button1" style="display: {{#if league.next}}inline-block{{else}}none{{/if}};">{{translate "Next"}}</button>\r\n\r\n    </div>\r\n</div>\r\n\r\n{{#if options.title}}\r\n<h2 id="ladder-title">{{options.title}}</h2>\r\n{{else}}\r\n{{#unless options.hideTitle}}\r\n<h2>{{translate "Ladder"}}</h2>\r\n{{/unless}}\r\n{{/if}}\r\n\r\n<div class="controls">\r\n    <label for="autoRefresh">{{translate "Auto refresh"}}</label>\r\n    <input type="checkbox" value="1" name="autoRefresh" />\r\n    <input type="button" class="refresh button1" value="{{translate \'Refresh\'}}" />\r\n</div>\r\n<div class="clear"></div>\r\n{{#if league.date}}\r\n<h2 id="ladder-time">{{translate "Start"}}: {{unixMoment league.startTime format=\'lll\'}}</h2>\r\n{{/if}}\r\n<div class="loading"></div>\r\n<table>\r\n    <thead>\r\n    <tr>\r\n        <th></th>\r\n        <th>{{translate "Rank"}}</th>\r\n        {{#unless disableAccountNames}}<th>{{translate "Account"}}</th>{{/unless}}\r\n        <th>{{translate "Class"}}</th>\r\n        <th>{{translate "Score"}}</th>\r\n    </tr>\r\n    </thead>\r\n    <tbody class="entries"></tbody>\r\n</table>\r\n<div class="pagination"></div>'
}),
define("PoE/Widget/League/Ladder/Ladder", ["plugins", "Backbone", "moment-tz", "PoE/Handlebars/TemplateCollection", "PoE/Collection/League/LadderEntries", "./LadderEntry", "PoE/View/Widget/Pagination", "PoE/Helpers", "text!PoE/Widget/League/Ladder/Ladder.hbt", "text!PoE/Widget/League/Ladder/PVPLadder.hbt", "text!PoE/Widget/League/Ladder/LabyrinthLadder.hbt", "text!PoE/Widget/League/Ladder/PathOfEnduranceLadder.hbt"], function(e, t, n, r, i, s, o, u) {
    return t.View.extend({
        initialize: function() {
            var e = this;
            this.$el.attr("class", "ladderView"),
            this.type = this.options.type,
            !this.collection && this.model && (this.collection = this.model.get("ladder")),
            this.type == "path-of-endurance" && (this.collection.server_api.id = this.model.get("id"),
            this.collection.server_api.leagueName = this.model.get("leagueName"),
            this.collection.server_api.startTime = this.model.get("startTime"),
            this.$el.addClass("path-of-endurance")),
            this.options.type == "labyrinth" && this.model.get("difficulty") && (this.collection.server_api.difficulty = this.model.get("difficulty")),
            this.pagination = new o({
                collection: this.collection
            }),
            this.pagination.render(),
            this.collection.on("change", function() {
                this.render()
            }),
            this.collection.on("reset", function() {
                e.hideLoader(),
                e.addAll()
            }),
            this.pagination.on("loadStart", function() {
                e.showLoader()
            }),
            this.pagination.on("loadEnd", function() {
                e.hideLoader()
            }),
            this.autoRefreshInterval = null,
            this.ladderEntries = []
        },
        showLoader: function() {
            this.$entries.css("opacity", .5),
            this.$loading.show(),
            this.$loading.css("top", this.$entries.offset().top - this.$el.offset().top),
            this.$loading.height(this.$entries.height() > 0 ? this.$entries.height() : 38)
        },
        hideLoader: function() {
            this.$entries.css("opacity", 1),
            this.$loading.hide()
        },
        initElementRefs: function() {
            this.$entries = this.$el.find(".entries"),
            this.$loading = this.$el.find(".loading"),
            this.$autoRefresh = this.$el.find('input[name="autoRefresh"]'),
            this.$prev = this.$el.find("#ladder-prev"),
            this.$next = this.$el.find("#ladder-next")
        },
        events: {
            "click .refresh": "refresh",
            'change input[name="autoRefresh"]': "autoRefresh",
            'change select[class="league"]': "changeOps",
            'change select[class="difficulty"]': "changeOps",
            "click button#ladder-prev": "prev",
            "click button#ladder-next": "next"
        },
        autoRefresh: function(e) {
            var t = this;
            e.preventDefault(),
            this.$autoRefresh.is(":checked") && this.autoRefreshInterval === null ? this.autoRefreshInterval = setInterval(function() {
                t.refresh()
            }, 3e4) : this.autoRefreshInterval !== null && (clearInterval(this.autoRefreshInterval),
            this.autoRefreshInterval = null)
        },
        refresh: function(t) {
            var r = this;
            t && t.preventDefault(),
            this.showLoader(),
            this.collection.fetch().done(function(t) {
                t.title && t.title != "" && e("#ladder-title").text(t.title),
                t.startTime && (r.model.set("startTime", t.startTime),
                e("#ladder-time").text(u.translate("Start: ") + n.unix(t.startTime).format("lll"))),
                r.type == "labyrinth" ? window.history && window.history.pushState && window.history.pushState({}, "", "/labyrinth/" + r.model.get("leagueId") + "/" + r.model.get("difficulty") + "/" + t.startTime) : r.type == "path-of-endurance" && (t.start && r.model.set("startTime", t.start),
                t.next === !1 ? e("#ladder-next").hide() : e("#ladder-next").show(),
                r.model.set("next", t.next),
                t.prev === !1 ? e("#ladder-prev").hide() : e("#ladder-prev").show(),
                r.model.set("prev", t.prev),
                window.history && window.history.pushState && window.history.pushState({}, "", "/path-of-endurance/" + r.model.get("leagueName") + "/" + t.start))
            }).fail(function(e) {
                r.type == "path-of-endurance" && (r.collection.models = {},
                r.collection.totalRecords = 0,
                r.$el.find(".pagination").empty(),
                r.addAll())
            }).always(function() {
                r.hideLoader()
            })
        },
        changeOps: function(t) {
            var n = this;
            if (this.type == "labyrinth" || this.type == "path-of-endurance") {
                var r = e('select[class="league"]').first().val();
                this.collection.currentPage = 1,
                this.type == "path-of-endurance" ? (n.model.set("leagueName", r),
                this.collection.server_api.leagueName = r) : (n.model.set("leagueId", r),
                this.collection.server_api.id = r)
            }
            if (this.type == "labyrinth") {
                var i = e('select[class="difficulty"]').first().val();
                n.model.set("difficulty", i),
                this.collection.server_api.difficulty = i
            }
            this.refresh(t)
        },
        prev: function(e) {
            if (this.type == "labyrinth") {
                var t = this.model.get("startTime")
                  , n = this.model.get("ladderOffset");
                this.collection.server_api.start = t - n
            } else
                this.type == "path-of-endurance" && (this.collection.server_api.startTime = this.model.get("prev"));
            this.collection.currentPage = 1,
            this.refresh(e)
        },
        next: function(e) {
            if (this.type == "labyrinth") {
                var t = this.model.get("startTime")
                  , n = this.model.get("ladderOffset");
                this.collection.server_api.start = t + n
            } else
                this.type == "path-of-endurance" && (this.collection.server_api.startTime = this.model.get("next"));
            this.collection.currentPage = 1,
            this.refresh(e)
        },
        addAll: function() {
            var t = this
              , n = [];
            this.$entries.empty(),
            this.ladderEntries = [];
            var r = !1;
            return this.collection.each(function(e, i) {
                var o = e.get("games_played")
                  , u = t.model && t.model.get("style") === "Swiss" && r !== !1 && o !== r
                  , e = new s({
                    model: e,
                    altRow: i % 2 == 1,
                    type: t.type,
                    style: t.model ? t.model.get("style") : !1,
                    newRound: u
                });
                n.push(e.render()),
                t.$entries.append(e.el),
                r = o,
                e.on("twitchProfileClicked", function(e) {
                    t.trigger("twitchProfileClicked", e)
                }),
                t.ladderEntries.push(e)
            }),
            (this.collection.info().totalRecords == 0 || this.collection.length == 0) && t.$entries.append('<tr><td colspan="7">' + u.translate("No results found") + "</td></tr>"),
            e.when.apply(null, n)
        },
        render: function() {
            var e = this
              , t = "PoE/Widget/League/Ladder/Ladder.hbt";
            return this.type == "pvp" ? t = "PoE/Widget/League/Ladder/PVPLadder.hbt" : this.type == "labyrinth" ? t = "PoE/Widget/League/Ladder/LabyrinthLadder.hbt" : this.type == "path-of-endurance" && (t = "PoE/Widget/League/Ladder/PathOfEnduranceLadder.hbt"),
            r.load(t).done(function(t) {
                var n = {
                    options: {}
                };
                e.model && (n.league = e.model.toJSON(),
                n.league.startTime && (e.collection.startTime = n.league.startTime)),
                e.options.hideTitle && (n.options.hideTitle = !0),
                e.options.title && (n.options.title = e.options.title),
                e.collection.disableAccountNames && (n.disableAccountNames = !0),
                n.type = e.type,
                e.$el.html(t(n)),
                e.initElementRefs(),
                e.$loading.hide(),
                e.$el.find(".pagination").replaceWith(e.pagination.el),
                e.addAll().done(function() {
                    e.collection.every(function(t, n) {
                        var r = e.ladderEntries[n].getProfileLink();
                        return r.isStreaming() ? (e.trigger("foundInitialLivestream", r.getTwitchStream()),
                        !1) : !0
                    })
                })
            })
        }
    })
}),
define("PoE/Polyfill/Placeholder", ["jquery"], function(e) {
    Modernizr.input.placeholder || (e("[placeholder]").focus(function() {
        var t = e(this);
        t.val() == t.attr("placeholder") && (t.val(""),
        t.removeClass("placeholder"))
    }).blur(function() {
        var t = e(this);
        if (t.val() == "" || t.val() == t.attr("placeholder"))
            t.addClass("placeholder"),
            t.val(t.attr("placeholder"))
    }).blur(),
    e("[placeholder]").parents("form").submit(function() {
        e(this).find("[placeholder]").each(function() {
            var t = e(this);
            t.val() == t.attr("placeholder") && t.val("")
        })
    }))
}),
define("PoE/Layout/MenuPopupDelay", ["jquery"], function(e) {
    e("#siteNav>li").hover(function(t) {
        t = e(t.delegateTarget),
        t.addClass("hoverHide");
        var n = setTimeout(function() {
            t.addClass("hoverShow").removeClass("hoverHide"),
            t.data("timer", null)
        }, 150);
        t.data("timer", n)
    }, function(t) {
        t = e(t.delegateTarget),
        t.removeClass("hoverShow").removeClass("hoverHide");
        var n = t.data("timer");
        n && (clearTimeout(n),
        t.data("timer", null))
    })
}),
define("PoE/Backbone/Collection/Item/ItemCollection", ["Backbone", "PoE/Backbone/Model/Item/Item"], function(e, t) {
    return e.Collection.extend({
        model: t
    })
}),
define("PoE/API/Character", ["jquery", "PoE/Backbone/Collection/Item/ItemCollection"], function(e, t) {
    return {
        getItems: function(n) {
            var r = e.Deferred()
              , i = {
                character: n.characterName,
                account: n.accountName,
                level: n.characterLevel
            };
            return n.accountName && (i.accountName = n.accountName),
            e.ajax({
                url: "/character-window/get-items",
                type: "GET",
                dataType: "json",
                data: i,
                success: function(e) {
                    r.resolve(new t(e.items))
                }
            }),
            r.promise()
        }
    }
}),
define("PoE/Inventory/Constants", [], function() {
    return {
        gridSize: 47.464503042596,
        inventoryWidth: .60851926977688,
        inventory: {
            bodyArmour: {
                x: 247.05882352941,
                y: 124.13793103448
            },
            weapon: {
                x: 60.851926977688,
                y: 29.20892494929
            },
            offhand: {
                x: 433.26572008114,
                y: 29.20892494929
            },
            boots: {
                x: 363.89452332657,
                y: 230.62880324544
            },
            ring: {
                x: 177.68762677485,
                y: 171.60243407708
            },
            ring2: {
                x: 363.89452332657,
                y: 171.60243407708
            },
            amulet: {
                x: 363.89452332657,
                y: 112.57606490872
            },
            gloves: {
                x: 130.22312373225,
                y: 230.62880324544
            },
            belt: {
                x: 247.05882352941,
                y: 278.09330628803
            },
            helm: {
                x: 247.05882352941,
                y: 17.647058823529
            },
            flask: {
                x: 181.33874239351,
                y: 336.51115618661
            },
            stash: {
                x: 15.212981744422,
                y: 97.3630831643
            },
            main: {
                x: 9,
                y: 449.56795131846
            }
        },
        stashBounds: {
            w: 600,
            h: 778.9046653144
        },
        inventoryBounds: {
            w: 600,
            h: 781.33874239351
        },
        achievementVersion: 12
    }
}),
define("PoE/Inventory/MainInventoryPanel", ["plugins", "Backbone", "PoE/API/Character", "PoE/Item/Item", "PoE/Backbone/EventBus", "./Constants"], function(e, t, n, r, i, s) {
    return t.View.extend({
        initialize: function() {
            var e = this;
            this.$el.addClass("mainInventoryPanel"),
            this.renderedItems = [],
            this.activeCharacter = this.options.activeCharacter,
            this.accountName = this.options.accountName || null,
            this.equippedOnly = this.options.equippedOnly || null,
            this.weaponSlot = 1,
            i.on("activeCharacterChanged", function(t) {
                e.activeCharacter = t,
                e.render()
            })
        },
        events: {
            "click .weaponSwap1.left": "swapWeaponSlot",
            "click .weaponSwap2.left": "swapWeaponSlot",
            "click .weaponSwap1.right": "swapWeaponSlot",
            "click .weaponSwap2.right": "swapWeaponSlot",
            "click .weaponSwapMini.left": "swapWeaponSlot",
            "click .weaponSwapMini.right": "swapWeaponSlot"
        },
        showCharacterItems: function() {
            var e = this
              , t = {
                characterName: this.activeCharacter.get("name"),
                characterLevel: this.activeCharacter.get("level")
            };
            this.accountName && (t.accountName = this.accountName),
            n.getItems(t).done(function(t) {
                e.collection = t,
                e.showItems()
            })
        },
        showItems: function() {
            var e = this;
            this.clearItems(),
            this.weapon1 = null,
            this.weapon2 = null,
            this.offhand1 = null,
            this.offhand2 = null,
            this.collection.each(function(t) {
                var n = 0
                  , i = 0
                  , o = 1
                  , u = 1
                  , a = t.get("x")
                  , f = t.get("y")
                  , l = t.get("w")
                  , c = t.get("h")
                  , h = l
                  , p = c
                  , d = t.get("inventoryId")
                  , v = new r({
                    model: t
                });
                if (d !== "Cursor" && d !== "Map" && d.indexOf("Crafting") === -1 && (!e.equippedOnly || d !== "MainInventory")) {
                    switch (d) {
                    case "MainInventory":
                        n = s.inventory.main.x + s.gridSize * a,
                        i = s.inventory.main.y + s.gridSize * f;
                        break;
                    case "BodyArmour":
                        n = s.inventory.bodyArmour.x,
                        i = s.inventory.bodyArmour.y,
                        h = 2,
                        p = 3;
                        break;
                    case "Weapon":
                        e.weapon1 = v,
                        n = s.inventory.weapon.x,
                        i = s.inventory.weapon.y,
                        h = 2,
                        p = 4;
                        break;
                    case "Weapon2":
                        e.weapon2 = v,
                        n = s.inventory.weapon.x,
                        i = s.inventory.weapon.y,
                        h = 2,
                        p = 4;
                        break;
                    case "Offhand":
                        e.offhand1 = v,
                        n = s.inventory.offhand.x,
                        i = s.inventory.offhand.y,
                        h = 2,
                        p = 4;
                        break;
                    case "Offhand2":
                        e.offhand2 = v,
                        n = s.inventory.offhand.x,
                        i = s.inventory.offhand.y,
                        h = 2,
                        p = 4;
                        break;
                    case "Boots":
                        n = s.inventory.boots.x,
                        i = s.inventory.boots.y,
                        h = 2,
                        p = 2;
                        break;
                    case "Ring":
                        n = s.inventory.ring.x,
                        i = s.inventory.ring.y;
                        break;
                    case "Ring2":
                        n = s.inventory.ring2.x,
                        i = s.inventory.ring2.y;
                        break;
                    case "Amulet":
                        n = s.inventory.amulet.x,
                        i = s.inventory.amulet.y;
                        break;
                    case "Gloves":
                        n = s.inventory.gloves.x,
                        i = s.inventory.gloves.y;
                        break;
                    case "Belt":
                        n = s.inventory.belt.x,
                        i = s.inventory.belt.y;
                        break;
                    case "Helm":
                        n = s.inventory.helm.x,
                        i = s.inventory.helm.y;
                        break;
                    case "Flask":
                        n = s.inventory.flask.x + a * s.gridSize,
                        i = s.inventory.flask.y
                    }
                    n += 5,
                    i += 82;
                    var m = {
                        character: e.activeCharacter.get("name"),
                        item: t,
                        inventory: d
                    };
                    e.renderedItems.push(v),
                    v.render(),
                    v.setPlaced(h, p),
                    v.on("itemClick", function(t) {
                        return function() {
                            e.itemClicked(t)
                        }
                    }(m)),
                    e.$el.append(v.$el),
                    v.$el.css("position", "absolute"),
                    v.$el.css("left", n),
                    v.$el.css("top", i)
                }
            }),
            this.showActiveWeaponSlots()
        },
        swapWeaponSlot: function(e) {
            this.weaponSlot === 1 ? this.weaponSlot = 2 : this.weaponSlot = 1,
            this.showActiveWeaponSlots()
        },
        showActiveWeaponSlots: function() {
            this.$weaponSwapMiniL.empty(),
            this.$weaponSwapMiniR.empty(),
            this.showMiniSlots(!1),
            this.weaponSlot === 1 ? (this.weapon1 && this.weapon1.$el.show(),
            this.offhand1 && this.offhand1.$el.show(),
            this.weapon2 && (this.showMiniSlots(!0),
            this.populateSwapMini(this.weapon2, this.$weaponSwapMiniL),
            this.weapon2.$el.hide()),
            this.offhand2 && (this.showMiniSlots(!0),
            this.populateSwapMini(this.offhand2, this.$weaponSwapMiniR),
            this.offhand2.$el.hide()),
            this.$weaponSwap1.show(),
            this.$weaponSwap2.hide()) : (this.weapon2 && this.weapon2.$el.show(),
            this.offhand2 && this.offhand2.$el.show(),
            this.weapon1 && (this.showMiniSlots(!0),
            this.populateSwapMini(this.weapon1, this.$weaponSwapMiniL),
            this.weapon1.$el.hide()),
            this.offhand1 && (this.showMiniSlots(!0),
            this.populateSwapMini(this.offhand1, this.$weaponSwapMiniR),
            this.offhand1.$el.hide()),
            this.$weaponSwap2.show(),
            this.$weaponSwap1.hide())
        },
        showMiniSlots: function(e) {
            e ? (this.$weaponSwapMiniL.show(),
            this.$weaponSwapMiniR.show()) : (this.$weaponSwapMiniL.hide(),
            this.$weaponSwapMiniR.hide())
        },
        populateSwapMini: function(e, t) {
            var n = e.$el
              , r = n.find(".iconContainer")
              , i = (4 - e.model.get("h")) * s.gridSize / 2
              , o = s.gridSize * 2
              , u = s.gridSize * 4
              , a = n.find(".icon").width()
              , f = u - 2 * i
              , l = 6
              , c = t.width() - 2 * l
              , h = t.height() - 2 * l
              , p = n.find(".icon img").clone();
            p.width(a * (c / o)),
            p.height(f * (h / u)),
            p.css("top", (h - p.height()) / 2 + l),
            p.css("left", (c - p.width()) / 2 + l),
            t.append(p)
        },
        clearItems: function() {
            for (var e = 0, t = this.renderedItems.length; e < t; ++e)
                this.renderedItems[e].close();
            this.renderedItems = []
        },
        itemClicked: function(e) {
            i.trigger("inventoryItem.click", e)
        },
        show: function() {
            this.$el.show()
        },
        hide: function() {
            this.$el.hide()
        },
        close: function() {
            this.remove(),
            this.unbind()
        },
        render: function() {
            var t = e.Deferred();
            return this.$el.empty().append('<div class="weaponSwap1 left"></div><div class="weaponSwap2 left"></div><div class="weaponSwap1 right"></div><div class="weaponSwap2 right"></div><div class="weaponSwapMini left"></div><div class="weaponSwapMini right"></div>'),
            this.$weaponSwap1 = this.$el.find(".weaponSwap1"),
            this.$weaponSwap2 = this.$el.find(".weaponSwap2"),
            this.$weaponSwapMiniL = this.$el.find(".weaponSwapMini.left"),
            this.$weaponSwapMiniR = this.$el.find(".weaponSwapMini.right"),
            this.showCharacterItems(),
            t.resolve(),
            this.delegateEvents(),
            t.promise()
        }
    })
}),
define("PoE/API/League", ["jquery", "PoE/Backbone/Collection/Item/ItemCollection"], function(e, t) {
    return {
        getStashItems: function(n) {
            var r = e.Deferred()
              , i = {};
            i.league = n.league,
            i.tabs = n.tabs ? 1 : 0,
            i.tabIndex = n.tabIndex,
            n.accountName && (i.accountName = n.accountName);
            var s = "/character-window/get-stash-items";
            return n.accountName && (s += "?accountName=" + n.accountName),
            s += "&tabIndex=" + (n.tabIndex ? n.tabIndex : 0),
            n.league && (s += "&league=" + n.league),
            s += "&tabs=" + (n.tabs ? 1 : 0),
            n.public && (s += "&public=1"),
            e.ajax({
                url: s,
                type: "GET",
                dataType: "json",
                success: function(e) {
                    var n = {};
                    n = e,
                    r.resolve(new t(e.items), n)
                },
                error: function(e) {
                    r.reject()
                }
            }),
            r.promise()
        },
        getMTXStashItems: function(n) {
            var r = e.Deferred()
              , i = {};
            return i.league = n.league,
            i.tabs = n.tabs ? 1 : 0,
            i.tabIndex = n.tabIndex,
            n.accountName && (i.accountName = n.accountName),
            e.ajax({
                url: "/character-window/get-mtx-stash-items",
                type: "POST",
                dataType: "json",
                data: i,
                success: function(e) {
                    var n = {};
                    e.tabs && (n.tabs = e.tabs),
                    r.resolve(new t(e.items), n, e.selectedTab)
                }
            }),
            r.promise()
        }
    }
}),
define("PoE/CharacterWindow/Tab", ["require", "PoE/Environment/Font", "plugins"], function(e) {
    var t = e("PoE/Environment/Font")
      , n = e("plugins");
    n.loadImage = function(e) {
        var t = function(t) {
            function r() {
                s(),
                t.resolve(n)
            }
            function i() {
                s(),
                t.reject(n)
            }
            function s() {
                n.onload = null,
                n.onerror = null,
                n.onabort = null
            }
            var n = new Image;
            n.onload = r,
            n.onerror = i,
            n.onabort = i,
            n.src = e
        };
        return n.Deferred(t).promise()
    }
    ;
    var r = function(e, r, i, s, o, u, a, f, l) {
        this.init = function() {
            this.$el = n('<div class="tab"><div class="l"></div><div class="label"></div><div class="r"></div></div>'),
            this.srcL = i,
            this.srcC = s,
            this.srcR = o,
            this.$el.find(".label").text(e),
            this.onclick = a && a.onclick ? a.onclick : function() {}
            ,
            this.onload = a && a.onload ? a.onload : function() {}
            ,
            this.$el.on("click", this.onclick),
            this.$el.hide(),
            this.width = null,
            this.height = null,
            this.loaded = !1,
            this.selected = !1,
            this.name = e,
            this.index = r,
            this.pubIndex = l,
            this.colour = u;
            var t = (u.r * 299 + u.g * 587 + u.b * 114) / 1e3
              , c = t >= 128;
            this.textColour = c ? "rgb(59, 44, 27)" : "rgb(255, 192, 119)",
            this.textGlow = c ? "rgb(0, 0, 0)" : "rgb(118, 56, 0)",
            this.textOutline = "rgb(0, 0, 0)",
            this.hidden = f;
            var h = this;
            this.$el.click(function() {
                h.onclick()
            })
        }
        ,
        this.getColour = function() {
            return this.colour
        }
        ,
        this.refresh = function() {
            this.$el.children().css("background-position", "0px " + (this.selected || this.hovered ? this.height : 0) + "px")
        }
        ,
        this.select = function() {
            this.selected = !0,
            this.refresh()
        }
        ,
        this.deselect = function() {
            this.selected = !1,
            this.refresh()
        }
        ,
        this.isLoaded = function() {
            return this.loaded
        }
        ,
        this.show = function() {
            this.$el.show()
        }
        ,
        this.hide = function() {
            this.$el.hide()
        }
        ,
        this.init(),
        this.load = function() {
            var e = []
              , r = this;
            if (this.isLoaded()) {
                var i = n.Deferred();
                return i.resolve(),
                i
            }
            e.push(t.waitLoad("FontinRegular"));
            var s = n.loadImage(this.srcC).pipe(function(e) {
                r.imgC = e
            })
              , o = n.loadImage(this.srcL).pipe(function(e) {
                r.imgL = e
            })
              , u = n.loadImage(this.srcR).pipe(function(e) {
                r.imgR = e
            });
            return e.push(s),
            e.push(o),
            e.push(u),
            n.when.apply(n, e).done(function() {
                r.$el.show(),
                r.$el.find(".label").css("background-image", "url('" + r.srcC + "')").css("color", r.textColour).height(r.imgC.height / 2),
                r.$el.find(".l").css("background-image", "url('" + r.srcL + "')").width(r.imgL.width).height(r.imgL.height / 2),
                r.$el.find(".r").css("background-image", "url('" + r.srcR + "')").width(r.imgR.width).height(r.imgR.height / 2),
                r.width = r.$el.find(".label").width() + r.$el.find(".l").width() + r.$el.find(".r").width(),
                r.height = r.$el.find(".label").height(),
                r.$el.width(r.width),
                r.$el.height(r.height),
                r.$el.hide(),
                r.refresh(),
                r.onload(),
                r.loaded = !0
            }).promise()
        }
    };
    return r
}),
define("PoE/CharacterWindow/TabsControl", ["PoE/CharacterWindow/Tab", "PoE/Layout/Popup/Popup", "plugins"], function(e, t, n) {
    return function(r, i) {
        this.init = function() {
            var e = this;
            this.el = n(r),
            this.onTabClicked = function() {}
            ,
            this.controls = {},
            this.controls.leftControlsEl = this.el.find(".leftControls"),
            this.controls.leftButtonEl = this.controls.leftControlsEl.find(".leftButton"),
            this.controls.rightControlsEl = this.el.find(".rightControls"),
            this.controls.rightButtonEl = this.controls.rightControlsEl.find(".rightButton"),
            this.controls.tabSelectButtonEl = this.controls.rightControlsEl.find(".tabSelectButton"),
            this.controls.tabSelectEl = this.controls.rightControlsEl.find(".stashTabSelect"),
            this.controls.tabSelectWrapperEl = this.controls.rightControlsEl.find(".stashTabSelectWrapper"),
            this.controls.visible = !1,
            this.controls.tabsControl = this,
            this.controls.leftButtonDown = !1,
            this.controls.rightButtonDown = !1,
            this.controls.tabSelectPopup = null,
            this.organiseInterval = null,
            this.doOrganise = !1,
            this.controls.tabSelectScroll = !1,
            this.controls.tabSelectScrollConfig = {
                showArrows: !0,
                scrolly: "advanced",
                scrollx: "advanced",
                ignoreMobile: !0
            },
            this.controls.leftControlsWidth = function() {
                return this.leftControlsEl.width()
            }
            ,
            this.controls.rightControlsWidth = function() {
                return this.rightControlsEl.width()
            }
            ,
            this.controls.leftButtonOnclick = function() {}
            ,
            this.controls.rightButtonOnclick = function() {}
            ,
            this.controls.tabSelectButtonOnclick = function() {}
            ,
            this.controls.leftButtonEl.on("mousedown", function() {
                e.controls.leftButtonDown = !0,
                setTimeout(function() {
                    e.scrollTabsLeftRepeat()
                }, 50)
            }),
            this.controls.leftButtonEl.on("mouseup", function() {
                e.controls.leftButtonDown = !1,
                e.endScrollTabsLeftRepeat(),
                e.scrollTabsLeft()
            }),
            this.controls.rightButtonEl.on("mousedown", function() {
                e.controls.rightButtonDown = !0,
                setTimeout(function() {
                    e.scrollTabsRightRepeat()
                }, 50)
            }),
            this.controls.rightButtonEl.on("mouseup", function() {
                e.controls.rightButtonDown = !1,
                e.endScrollTabsRightRepeat(),
                e.scrollTabsRight()
            }),
            this.controls.tabSelectButtonEl.on("click", function() {
                e.controls.tabSelectButtonOnclick();
                if (e.controls.tabSelectPopup === null)
                    return;
                e.controls.tabSelectPopup.isVisible() ? e.controls.tabSelectPopup.hide() : (e.controls.tabSelectPopup.positionRightTopEl(e.controls.tabSelectButtonEl),
                e.controls.tabSelectScroll || (e.controls.tabSelectScroll = e.controls.tabSelectEl.scrollbar(e.controls.tabSelectScrollConfig)),
                e.controls.tabSelectScroll || e.controls.tabSelectEl.css("overflow-y", "auto"))
            }),
            this.controls.show = function() {
                this.leftControlsEl.show(),
                this.rightControlsEl.show(),
                this.tabsControl.tabsEl.css("left", this.leftControlsEl.width()),
                this.tabsControl.tabsEl.css("right", this.rightControlsEl.width()),
                this.tabSelectPopup === null && (this.tabSelectEl.width(this.tabSelectEl.width() + 16),
                e.controls.tabSelectScroll = e.controls.tabSelectEl.scrollbar(e.controls.tabSelectScrollConfig),
                e.controls.tabSelectScroll || e.controls.tabSelectEl.css("overflow-y", "auto"),
                this.tabSelectPopup = new t(this.tabSelectWrapperEl),
                this.tabSelectPopup.hide()),
                this.visible = !0
            }
            ,
            this.tabsEl = this.el.find(".tabs:first"),
            this.visibleTabsWidth = 0,
            this.visibleTabs = [],
            this.tabs = [],
            this.tabsAlign = "l",
            this.leftIndex = null,
            this.rightIndex = null,
            this.selectedTab = null,
            this.tabsOverflow = !1,
            this.leftIndex = 0;
            var e = this;
            this.width = function() {
                return 577
            }
            ,
            this.widthLessControls = this.width()
        }
        ,
        this.scrollTabsLeft = function() {
            (this.tabsAlign == "l" || this.visibleTabsWidth == this.tabsEl.width()) && this.leftIndex > 0 && --this.leftIndex,
            this.tabsAlign = "l",
            this.organise(),
            this.controls.leftButtonOnclick()
        }
        ,
        this.scrollTabsRight = function() {
            (this.tabsAlign == "r" || this.visibleTabsWidth == this.tabsEl.width()) && this.rightIndex < this.tabs.length - 1 && ++this.rightIndex,
            this.tabsAlign = "r",
            this.organise(),
            this.controls.rightButtonOnclick()
        }
        ,
        this.scrollTabsLeftRepeatInterval = null,
        this.scrollTabsLeftRepeat = function() {
            if (this.scrollTabsLeftRepeatInterval !== null || !this.controls.leftButtonDown)
                return;
            var e = this;
            this.scrollTabsLeftRepeatInterval = setInterval(function() {
                e.scrollTabsLeft()
            }, 100)
        }
        ,
        this.endScrollTabsLeftRepeat = function() {
            if (this.scrollTabsLeftRepeatInterval === null)
                return;
            clearInterval(this.scrollTabsLeftRepeatInterval),
            this.scrollTabsLeftRepeatInterval = null
        }
        ,
        this.scrollTabsRightRepeatInterval = null,
        this.scrollTabsRightRepeat = function() {
            if (this.scrollTabsRightRepeatInterval !== null || !this.controls.rightButtonDown)
                return;
            var e = this;
            this.scrollTabsRightRepeatInterval = setInterval(function() {
                e.scrollTabsRight()
            }, 100)
        }
        ,
        this.endScrollTabsRightRepeat = function() {
            if (this.scrollTabsRightRepeatInterval === null)
                return;
            clearInterval(this.scrollTabsRightRepeatInterval),
            this.scrollTabsRightRepeatInterval = null
        }
        ,
        this.getSelectedTabIndex = function() {
            return this.selectedTab === null ? 0 : this.selectedTab.index
        }
        ,
        this.getSelectedTab = function() {
            return this.selectedTab
        }
        ,
        this.tabLoaded = function(e) {
            this.organise()
        }
        ,
        this.tabClicked = function(e) {
            this.selectedTab.deselect(),
            e.select(),
            this.selectedTab = e,
            e.index == this.leftIndex && this.tabsAlign == "r" ? (this.tabsAlign = "l",
            this.organise()) : e.index == this.rightIndex && this.tabsAlign == "l" ? (this.tabsAlign = "r",
            this.organise()) : e.index < this.leftIndex ? (this.leftIndex = e.index,
            this.tabsAlign = "l",
            this.organise()) : e.index > this.rightIndex && (this.rightIndex = e.index,
            this.tabsAlign = "r",
            this.organise()),
            this.organise(),
            this.onTabClicked(e)
        }
        ,
        this.hide = function() {
            this.el.hide();
            if (this.controls.tabSelectPopup === null)
                return;
            this.controls.tabSelectPopup.hide()
        }
        ,
        this.show = function() {
            this.el.show()
        }
        ,
        this.close = function() {
            if (this.controls.tabSelectPopup === null)
                return;
            this.controls.tabSelectPopup.el.remove()
        }
        ,
        this.clearTabs = function() {
            this.tabsOverflow = !1,
            this.tabsEl.empty(),
            this.tabsEl.removeClass("tabsOverflow"),
            this.controls.tabSelectEl.empty(),
            this.controls.tabSelectScroll && this.controls.tabSelectScroll.scrollbar("destroy")
        }
        ,
        this.loadTabs = function(t) {
            this.clearTabs();
            var r = this;
            this.leftIndex = 0,
            this.tabsAlign = "l",
            this.tabs = [],
            this.controls.tabSelectPopup !== null && (this.controls.tabSelectPopup.el.remove(),
            this.controls.tabSelectPopup = null);
            for (var i = 0, s = t.length; i < s; ++i) {
                var o = new e(t[i].n,i,t[i].srcL,t[i].srcC,t[i].srcR,t[i].colour,null,t[i].hidden,t[i].pi)
                  , u = o.$el;
                o.onclick = function() {
                    r.tabClicked(this)
                }
                ,
                this.tabs[i] = o,
                this.tabsEl.append(u);
                if (!t[i].hidden) {
                    var a = n('<div class="option"></div>');
                    a.text(o.name);
                    if (t[i].colour.r !== 124 && t[i].colour.g !== 84 && t[i].colour.b !== 54) {
                        var f = "rgb(" + t[i].colour.r + "," + t[i].colour.g + "," + t[i].colour.b + ")"
                          , l = 40
                          , c = "rgb(" + Math.max(t[i].colour.r - l, 0) + "," + Math.max(t[i].colour.g - l, 0) + "," + Math.max(t[i].colour.b - l, 0) + ")";
                        a.css("background", c);
                        var h = (t[i].colour.r * 299 + t[i].colour.g * 587 + t[i].colour.b * 114) / 1e3
                          , p = h >= 128;
                        a.css("color", p ? "rgb(59, 44, 27)" : "rgb(255, 192, 119)"),
                        a.hover(function(e) {
                            return function() {
                                n(this).css("background", e)
                            }
                        }(f), function(e) {
                            return function() {
                                n(this).css("background", e)
                            }
                        }(c))
                    }
                    a.on("click", function(e) {
                        return function() {
                            r.tabClicked(e)
                        }
                    }(o)),
                    this.controls.tabSelectEl.append(a)
                }
                t[i].selected && (this.selectedTab = this.tabs[i],
                this.selectedTab.select())
            }
            this.organise()
        }
        ,
        this.organise = function() {
            var e = this;
            this.organiseInterval !== null && (clearInterval(this.organiseInterval),
            this.organiseInterval = null),
            this.doOrganise = !0,
            this.organiseInterval = setInterval(function() {
                if (!e.doOrganise)
                    return;
                var t = 0
                  , n = []
                  , r = []
                  , i = function(i) {
                    var s = e.tabs[i];
                    return s.isLoaded() ? (t += s.width,
                    r.push(s),
                    t > e.width() ? (e.tabsOverflow = !0,
                    !0) : !1) : (n.push(s),
                    !1)
                };
                if (e.tabsAlign == "l") {
                    for (var s = e.leftIndex, o = e.tabs.length - 1; s <= o; ++s)
                        if (i(s) || s == o) {
                            e.rightIndex = s;
                            break
                        }
                } else
                    for (var s = e.rightIndex; s >= 0; --s)
                        if (i(s) || s == 0) {
                            e.leftIndex = s;
                            break
                        }
                for (var s = 0, o = e.visibleTabs.length; s < o; ++s)
                    e.visibleTabs[s].hide();
                e.visibleTabsWidth = 0,
                e.visibleTabs = [];
                if (t > e.width()) {
                    e.tabsEl.css("self", e.controls.leftControlsWidth()),
                    e.controls.show(!0),
                    e.tabsEl.addClass("tabsOverflow");
                    var u = function(n, i) {
                        var s = r[n];
                        return s.hidden ? !1 : (s.$el.css("position", "absolute").css(i ? "right" : "left", "").css(i ? "left" : "right", t),
                        s.show(),
                        e.visibleTabs.push(s),
                        e.visibleTabsWidth += s.width,
                        t += s.width,
                        t >= e.widthLessControls ? !0 : !1)
                    };
                    t = 0;
                    if (e.tabsAlign == "l") {
                        for (var s = 0, o = r.length - 1; s <= o; ++s)
                            if (u(s, !0) || s == o) {
                                e.rightIndex = r[s].index;
                                break
                            }
                    } else
                        for (var s = 0, o = r.length - 1; s <= o; ++s)
                            if (u(s, !1) || s == o) {
                                e.leftIndex = r[s].index;
                                break
                            }
                } else
                    for (var s = 0, o = r.length; s < o; ++s) {
                        var a = r[s];
                        a.hidden || (e.visibleTabs.push(a),
                        e.visibleTabsWidth += a.width,
                        a.$el.css("position", "relative").css("display", "inline-block").css("left", "").css("right", ""),
                        a.show())
                    }
                this.doOrganise = !1;
                if (n.length > 0)
                    for (var s = 0, o = n.length; s < o; ++s) {
                        var f = n[s].load();
                        f.then(function() {
                            e.doOrganise = !0
                        }, function() {
                            console.warn("Failed to load tab", s),
                            clearInterval(e.organiseInterval),
                            e.organiseInterval = null
                        })
                    }
                else
                    clearInterval(e.organiseInterval),
                    e.organiseInterval = null,
                    setTimeout(function() {
                        for (var t = 0; t < e.visibleTabs.length; t++) {
                            var n = e.visibleTabs[t];
                            n.hidden || n.show(),
                            n.$el.find(".r").width(18)
                        }
                    }, 100)
            }, 50)
        }
        ,
        this.init()
    }
}),
define("PoE/Inventory/StashPanel", ["plugins", "Backbone", "PoE/API/League", "PoE/Item/Item", "PoE/Backbone/EventBus", "PoE/CharacterWindow/TabsControl", "./Constants", "PoE/Helpers", "jquery.scrollbar"], function(e, t, n, r, i, s, o, u) {
    return t.View.extend({
        initialize: function() {
            var e = this;
            this.$el.addClass("stashPanel"),
            this.stashType = this.options.stashType || "normal",
            this.renderedItems = [],
            this.activeLeague = this.options.activeLeague,
            this.accountName = this.options.accountName || null,
            this.tabIndex = this.options.tabIndex || null,
            this.pubIndex = this.options.pubIndex || !1,
            this.showTabs = this.options.tabs || !1,
            this.public = this.options.public || !1,
            this.currencyLayout = this.options.currencyLayout || !1,
            this.divinationLayout = this.options.divinationLayout || !1,
            this.mapLayout = this.options.mapLayout || !1,
            this.quadLayout = !!this.options.quadLayout,
            this.layoutType = this.options.layoutType || "default",
            this.currencyLayoutMap = this.options.currencyLayoutMap || !1,
            this.divinationLayoutMap = !1,
            this.essenceLayoutMap = this.options.essenceLayoutMap || !1,
            this.mapLayoutMap = !1,
            this.$panelContents = !1,
            this.scale = 1,
            this.panelContents = function() {
                return e.$el.find(".stashTabContents")
            }
            ,
            i.on("activeCharacterChanged", function(t) {
                if (e.public)
                    return;
                if (e.activeLeague == t.get("league"))
                    return;
                e.activeLeague = t.get("league"),
                e.clear(),
                e.showStashItems(e.showTabs === !0, 1)
            })
        },
        events: {
            "click div.stashTabLinkOne": "tabLinkOne",
            "click div.stashTabLinkAll": "tabLinkAll"
        },
        initElementRefs: function() {
            this.$borderTop = this.$el.find(".border.t"),
            this.$borderTopRight = this.$el.find(".border.tr"),
            this.$borderRight = this.$el.find(".border.r"),
            this.$borderBottomRight = this.$el.find(".border.br"),
            this.$borderBottom = this.$el.find(".border.b"),
            this.$borderBottomLeft = this.$el.find(".border.bl"),
            this.$borderLeft = this.$el.find(".border.l"),
            this.$borderTopLeft = this.$el.find(".border.tl")
        },
        initCurrencyLayout: function(e) {
            return e.currencyLayout ? (this.currencyLayout = !0,
            this.currencyLayoutMap = e.currencyLayout,
            this.$panelContents.addClass("currencyStash"),
            !0) : (this.removeCurrencyLayout(),
            !1)
        },
        removeCurrencyLayout: function() {
            this.$panelContents.removeClass("currencyStash")
        },
        initMapLayout: function(t) {
            var n = this
              , r = n.mapLayoutMap;
            if (t.mapLayout) {
                if (!r) {
                    r = {
                        levels: [],
                        visibleMapControls: []
                    },
                    this.mapLayout = !0,
                    this.mapLayoutMap = t.mapLayout,
                    this.$panelContents.addClass("mapStash");
                    var i = '                    <div class="mapStashControls">                        <div class="mapStashControlLevels"></div>                        <div class="mapStashControlNames"></div>                    </div>                    <div class="mapStashInventory"></div>"                    ';
                    r.$mapStashControls = e(i),
                    r.$mapStashControlLevels = e(r.$mapStashControls.find(".mapStashControlLevels")),
                    r.$mapStashControlNames = e(r.$mapStashControls.find(".mapStashControlNames")),
                    r.$mapStashInventory = e(r.$mapStashControls.find(".mapStashInventory"));
                    var s = 16
                      , o = 68;
                    for (var a = 0; a < s; a++) {
                        var f = '<div class="mapStashControlLevel grid level_' + a + '">' + (o + a) + "</div>";
                        a == s - 1 && (f = '<div class="mapStashControlLevel grid level_unique">U</div>');
                        var l = e(f);
                        l.data("level", a),
                        l.click(function(t, n) {
                            r.$mapStashControlLevels.find(".active").removeClass("active");
                            var i = e(this).data("level");
                            while (r.visibleMapControls.length > 0) {
                                var s = r.visibleMapControls.pop()
                                  , o = s.$el;
                                o.hide()
                            }
                            for (var u in r.levels[i].maps) {
                                var o = r.levels[i].maps[u].$el;
                                o.show(),
                                r.visibleMapControls.push(r.levels[i].maps[u])
                            }
                            e(this).addClass("active")
                        }),
                        r.levels[a] = {
                            $el: l,
                            maps: {}
                        };
                        for (var c in t.mapLayout[a + 1]) {
                            var h = {}
                              , p = '<div class="mapStashControlName grid"><image src="' + u.imageUrl(t.mapLayout[a + 1][c].image + ".png?scale=1&w=1&h=1") + '" alt="' + t.mapLayout[a + 1][c].name + '" /></div>';
                            h.$el = e(p),
                            h.$el.hide(),
                            h.$el.click(function(t) {
                                r.$mapStashControlNames.find(".active").removeClass("active"),
                                e(this).addClass("active")
                            }),
                            r.$mapStashControlNames.append(h.$el),
                            r.levels[a].maps[c + 1] = h
                        }
                        r.$mapStashControlLevels.append(l)
                    }
                    n.mapLayoutMap = r,
                    n.$panelContents.append(r.$mapStashControls)
                } else
                    this.$panelContents.addClass("mapStash"),
                    this.mapLayoutMap.$mapStashControls.show(),
                    this.mapLayoutMap.$mapStashInventory.show();
                return !0
            }
            return this.removeMapLayout(),
            !1
        },
        removeMapLayout: function() {
            this.mapLayoutMap && (this.mapLayoutMap.$mapStashControls.hide(),
            this.mapLayoutMap.$mapStashInventory.hide()),
            this.$panelContents.removeClass("mapStash")
        },
        initDivinationLayout: function(t) {
            var n = new e.Deferred
              , r = this
              , i = r.divinationLayoutMap;
            this.removeDivinationLayout();
            if (t.divinationLayout) {
                this.$panelContents.addClass("divinationStash");
                if (!i) {
                    i = {
                        offx: 62,
                        offy: 131,
                        cards: {}
                    };
                    for (var s in t.divinationLayout.cards) {
                        var o = t.divinationLayout.cards[s].name.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"\s]/g, "")
                          , u = '                            <div class="stashPanelDivinationCard ' + o + '" style="width: ' + t.divinationLayout.w + "px; height: " + t.divinationLayout.h + 'px;">                              <div class="stashPanelDivinationCardName FontinSmallCaps">' + t.divinationLayout.cards[s].name + "</div>                            </div>"
                          , a = e(u);
                        i.cards[o] = {
                            name: t.divinationLayout.cards[s].name,
                            $el: a
                        }
                    }
                }
                var f = e.isEmptyObject(e.find(".stashPanelDivinationCard"));
                for (var s in i.cards) {
                    var l = i.cards[s].$el;
                    l.show(),
                    f && r.$panelContents.append(l)
                }
                if (!i.scrollPane) {
                    var c = this.$panelContents.scrollbar({
                        showArrows: !0,
                        scrolly: "advanced"
                    });
                    c || r.$el.find(".stashTabContents").css("overflow-y", "scroll"),
                    i.scrollPane = c
                }
                return r.divinationLayoutMap = i,
                !0
            }
        },
        removeDivinationLayout: function() {
            var e = this;
            if (this.divinationLayoutMap) {
                var t = this.divinationLayoutMap;
                for (var n in t.cards)
                    t.cards[n].$el.hide();
                this.divinationLayoutMap.scrollPane && this.divinationLayoutMap.scrollPane.data("scrollbar") && this.divinationLayoutMap.scrollPane.data("scrollbar").destroy(),
                this.divinationLayoutMap.scrollPane = !1
            }
            this.$panelContents.removeClass("divinationStash")
        },
        initQuadLayout: function(e) {
            return e.quadLayout ? (this.quadLayout = !0,
            this.$panelContents.addClass("quadStash"),
            this.scale = .5,
            !0) : (this.removeQuadLayout(),
            !1)
        },
        removeQuadLayout: function() {
            this.quadLayout = !1,
            this.scale = 1,
            this.$panelContents.removeClass("quadStash")
        },
        initEssenceLayout: function(e) {
            var t = this
              , n = t.essenceLayoutMap;
            return e.essenceLayout ? (this.essenceLayout = !0,
            this.$panelContents.addClass("essenceStash"),
            t.essenceLayoutMap = e.essenceLayout,
            !0) : (this.removeEssenceLayout(),
            !1)
        },
        removeEssenceLayout: function() {
            this.essenceLayout = !1,
            this.$panelContents.removeClass("essenceStash")
        },
        showStashItems: function(t, r) {
            var i = new e.Deferred
              , s = this
              , o = {
                league: this.activeLeague,
                tabs: !!t,
                tabIndex: r ? r : this.tabsControl.getSelectedTabIndex(),
                accountName: this.accountName,
                "public": this.public
            };
            return this.clearItems(),
            s.$el.find(".loading").show(),
            n.getStashItems(o).done(function(e, t) {
                s.collection = e,
                t.tabs && s.createStashTabs(t.tabs),
                s.currencyLayout = s.initCurrencyLayout(t),
                s.divinationLayout = s.initDivinationLayout(t),
                s.mapLayout = s.initMapLayout(t),
                s.quadLayout = s.initQuadLayout(t),
                s.essenceLayout = s.initEssenceLayout(t),
                s.showItems().done(function() {
                    s.$el.find(".loading").hide(),
                    i.resolve()
                })
            }).fail(function() {
                i.reject()
            }),
            i.promise()
        },
        showItems: function() {
            var t = new e.Deferred
              , n = this;
            return this.clearItems(),
            this.collection.each(function(e, i) {
                var s = 0
                  , u = 0
                  , a = 1
                  , f = 1
                  , l = n.scale
                  , c = e.get("x")
                  , h = e.get("y")
                  , p = e.get("w")
                  , d = e.get("h")
                  , v = p
                  , m = d
                  , g = e.get("inventoryId");
                s = o.gridSize * l * c,
                u = o.gridSize * l * h;
                if (n.currencyLayout && n.currencyLayoutMap && typeof n.currencyLayoutMap[e.attributes.x] != "undefined") {
                    var y = n.currencyLayoutMap[e.attributes.x];
                    s = y.x,
                    u = y.y,
                    v = y.w,
                    m = y.h
                }
                n.divinationLayout && n.divinationLayoutMap && (s = 0,
                u = 0);
                if (n.essenceLayout && n.essenceLayoutMap && n.essenceLayoutMap.essences && typeof n.essenceLayoutMap.essences[e.attributes.x] != "undefined") {
                    var y = n.essenceLayoutMap.essences[e.attributes.x];
                    s = y.x * n.essenceLayoutMap.scale * l,
                    u = y.y * n.essenceLayoutMap.scale * l,
                    v = y.w,
                    m = y.h
                }
                a = p * l * o.gridSize,
                f = d * l * o.gridSize,
                clickCallbackData = {
                    league: n.activeLeague,
                    item: e,
                    inventory: g
                };
                var b = new r({
                    model: e,
                    enableLeague: !0,
                    divinationLayout: n.divinationLayout,
                    scale: l
                });
                b.render(),
                b.setPlaced(v, m),
                b.on("itemClick", function(e) {
                    return function() {
                        n.public || n.itemClicked(e)
                    }
                }(clickCallbackData)),
                b.$el.css("position", "absolute"),
                b.$el.css("left", s),
                b.$el.css("top", u);
                if (n.divinationLayout) {
                    var w = e.attributes.typeLine.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"\s]/g, "");
                    n.$panelContents.find("." + w).append(b.$el)
                } else
                    n.$el.find(".stashTabContents").append(b.$el);
                n.renderedItems.push(b),
                i == n.collection.length - 1 && t.resolve()
            }),
            this.collection.length == 0 && t.resolve(),
            t.promise()
        },
        clearItems: function() {
            for (var e = 0, t = this.renderedItems.length; e < t; ++e)
                this.renderedItems[e].close();
            this.renderedItems = []
        },
        createStashTabs: function(e) {
            this.tabsControl.loadTabs(e);
            var t = this.tabsControl.getSelectedTab(), n;
            if (!t)
                return;
            n = t.getColour(),
            this.setBorderColour(n.r, n.g, n.b)
        },
        itemClicked: function(e) {
            i.trigger("inventoryItem.click", e)
        },
        show: function() {
            this.tabsControl.show(),
            this.$el.show()
        },
        hide: function() {
            this.$el.hide(),
            this.tabsControl.hide()
        },
        clear: function() {
            this.removeCurrencyLayout(),
            this.removeDivinationLayout(),
            this.removeMapLayout()
        },
        close: function() {
            this.tabsControl.close(),
            this.remove(),
            this.unbind()
        },
        setBorderColour: function(e, t, n) {
            var r = 3;
            this.$borderTop.css("background", "url('" + u.imageUrl("inventory/stash/border-image-" + e + "-" + t + "-" + n + "-t.png") + "')"),
            this.$borderTopRight.css("background", "url('" + u.imageUrl("inventory/stash/border-image-" + e + "-" + t + "-" + n + "-tr.png") + "')"),
            this.$borderRight.css("background", "url('" + u.imageUrl("inventory/stash/border-image-" + e + "-" + t + "-" + n + "-r.png") + "')"),
            this.$borderBottomRight.css("background", "url('" + u.imageUrl("inventory/stash/border-image-" + e + "-" + t + "-" + n + "-br.png") + "')"),
            this.$borderBottom.css("background", "url('" + u.imageUrl("inventory/stash/border-image-" + e + "-" + t + "-" + n + "-b.png") + "')"),
            this.$borderBottomLeft.css("background", "url('" + u.imageUrl("inventory/stash/border-image-" + e + "-" + t + "-" + n + "-bl.png") + "')"),
            this.$borderLeft.css("background", "url('" + u.imageUrl("inventory/stash/border-image-" + e + "-" + t + "-" + n + "-l.png") + "')"),
            this.$borderTopLeft.css("background", "url('" + u.imageUrl("inventory/stash/border-image-" + e + "-" + t + "-" + n + "-tl.png") + "')"),
            this.$panelContents.css({
                border: r + "px solid rgb(" + e + "," + t + "," + n + ")",
                "border-radius": "5px",
                top: "-" + r + "px",
                left: "-" + r + "px",
                "z-index": 6
            })
        },
        tabLinkOne: function(e) {
            var t = this;
            if (t.pubIndex !== !1 && t.pubIndex >= 0) {
                var n = {
                    accountName: t.accountName,
                    league: t.activeLeague,
                    tabIndex: t.pubIndex,
                    multi: !1
                };
                i.trigger("linkStash", n)
            }
        },
        tabLinkAll: function(e) {
            var t = this;
            if (t.pubIndex !== !1 && t.pubIndex >= 0) {
                var n = {
                    accountName: t.accountName,
                    league: t.activeLeague,
                    tabIndex: t.pubIndex,
                    multi: !0
                };
                i.trigger("linkStash", n)
            }
        },
        render: function() {
            var t = e.Deferred();
            this.$el.html('                <div class="stashTabContainer tabControl">                    <div class="leftControls">                        <div class="leftButton"></div>                    </div>                    <div class="loading"></div>                    <div class="tabWindow">                        <div class="tabs"></div>                    </div>                    <div class="rightControls">                        <div class="rightButton"></div>                        <div class="tabSelectButton"></div>                        <div class="stashTabSelectWrapper">                            <div class="stashTabSelect poeScroll FontinRegular"></div>                        </div>                    </div>                    <div class="stashTabContents poeScroll">                    </div>                </div>                <div class="border tl"></div>                 <div class="border t"></div>                 <div class="border tr"></div>                 <div class="border r"></div>                 <div class="border br"></div>                 <div class="border b"></div>                 <div class="border bl"></div>                 <div class="border l"></div>             ');
            var n = this;
            this.$tabsControl = n.$el.find(".stashTabContainer"),
            this.$panelContents = n.$el.find(".stashTabContents");
            var r = o.inventory.stash.x
              , i = o.inventory.stash.y + 46;
            return this.$tabsControl.css({
                left: r,
                top: i
            }),
            this.tabsControl = new s(this.$tabsControl,this.options.tabControlConfig),
            this.tabsControl.onTabClicked = function(e) {
                n.tabIndex = e.index;
                var t = e.getColour();
                n.setBorderColour(t.r, t.g, t.b),
                n.showStashItems()
            }
            ,
            this.showStashItems(this.showTabs === !0, this.tabIndex).done(function() {
                t.resolve(n)
            }).fail(function() {
                t.reject()
            }),
            this.rendered = !0,
            this.initElementRefs(),
            t.promise()
        }
    })
}),
define("PoE/Inventory/MTXStashPanel", ["plugins", "Backbone", "PoE/API/League", "PoE/Item/Item", "PoE/Backbone/EventBus", "PoE/CharacterWindow/TabsControl", "./Constants", "PoE/Helpers"], function(e, t, n, r, i, s, o, u) {
    return t.View.extend({
        initialize: function() {
            var e = this;
            this.$el.addClass("stashPanel").addClass("mtxStashPanel"),
            this.renderedItems = [],
            this.activeLeague = this.options.activeLeague,
            this.accountName = this.options.accountName || null,
            i.on("activeCharacterChanged", function(t) {
                if (e.activeLeague == t.get("league"))
                    return;
                e.activeLeague = t.get("league"),
                e.render()
            })
        },
        initElementRefs: function() {
            this.$borderTop = this.$el.find(".border.t"),
            this.$borderTopRight = this.$el.find(".border.tr"),
            this.$borderRight = this.$el.find(".border.r"),
            this.$borderBottomRight = this.$el.find(".border.br"),
            this.$borderBottom = this.$el.find(".border.b"),
            this.$borderBottomLeft = this.$el.find(".border.bl"),
            this.$borderLeft = this.$el.find(".border.l"),
            this.$borderTopLeft = this.$el.find(".border.tl")
        },
        showMTXStashItems: function(e) {
            var t = this
              , r = {
                league: this.activeLeague,
                tabs: !!e,
                tabIndex: this.tabsControl.getSelectedTabIndex(),
                accountName: this.accountName
            };
            n.getMTXStashItems(r).done(function(e, n, r) {
                t.collection = e,
                n.tabs && t.createMTXStashTabs(n.tabs, r),
                t.showItems()
            })
        },
        showItems: function() {
            var e = this;
            this.clearItems(),
            this.collection.each(function(t) {
                var n = 0
                  , i = 0
                  , s = 1
                  , u = 1
                  , a = t.get("x")
                  , f = t.get("y")
                  , l = t.get("w")
                  , c = t.get("h")
                  , h = l
                  , p = c
                  , d = t.get("inventoryId");
                n = o.inventory.stash.x + o.gridSize + o.gridSize * a,
                i = o.inventory.stash.y + o.gridSize + o.gridSize * f,
                n -= 1,
                i += 46,
                s = l * o.gridSize,
                u = c * o.gridSize,
                clickCallbackData = {
                    league: e.activeLeague,
                    item: t,
                    inventory: d
                };
                var v = new r({
                    model: t
                });
                e.renderedItems.push(v),
                v.render(),
                v.setPlaced(h, p),
                v.on("itemClick", function(t) {
                    return function() {
                        e.itemClicked(t)
                    }
                }(clickCallbackData)),
                e.$el.append(v.$el),
                v.$el.css("position", "absolute"),
                v.$el.css("left", n),
                v.$el.css("top", i)
            })
        },
        clearItems: function() {
            for (var e = 0, t = this.renderedItems.length; e < t; ++e)
                this.renderedItems[e].close();
            this.renderedItems = []
        },
        createMTXStashTabs: function(e, t) {
            this.tabsControl.loadTabs(e, t != null ? t : 0);
            var n = this.tabsControl.getSelectedTab(), r;
            if (!n)
                return;
            r = n.getColour(),
            this.setBorderColour(r.r, r.g, r.b)
        },
        itemClicked: function(e) {
            i.trigger("inventoryItem.click", e)
        },
        show: function() {
            this.tabsControl.show(),
            this.$el.show()
        },
        hide: function() {
            this.$el.hide(),
            this.tabsControl.hide()
        },
        close: function() {
            this.tabsControl.close(),
            this.remove(),
            this.unbind()
        },
        setBorderColour: function(e, t, n) {
            this.$borderTop.css("background", "url('" + u.imageUrl("inventory/stash/border-image-" + e + "-" + t + "-" + n + "-t.png") + "')"),
            this.$borderTopRight.css("background", "url('" + u.imageUrl("inventory/stash/border-image-" + e + "-" + t + "-" + n + "-tr.png") + "')"),
            this.$borderRight.css("background", "url('" + u.imageUrl("inventory/stash/border-image-" + e + "-" + t + "-" + n + "-r.png") + "')"),
            this.$borderBottomRight.css("background", "url('" + u.imageUrl("inventory/stash/border-image-" + e + "-" + t + "-" + n + "-br.png") + "')"),
            this.$borderBottom.css("background", "url('" + u.imageUrl("inventory/stash/border-image-" + e + "-" + t + "-" + n + "-b.png") + "')"),
            this.$borderBottomLeft.css("background", "url('" + u.imageUrl("inventory/stash/border-image-" + e + "-" + t + "-" + n + "-bl.png") + "')"),
            this.$borderLeft.css("background", "url('" + u.imageUrl("inventory/stash/border-image-" + e + "-" + t + "-" + n + "-l.png") + "')"),
            this.$borderTopLeft.css("background", "url('" + u.imageUrl("inventory/stash/border-image-" + e + "-" + t + "-" + n + "-tl.png") + "')")
        },
        render: function() {
            var t = e.Deferred();
            this.$el.html('                <div id="stash-tab-container" class="stashTabContainer tabControl">                    <div class="leftControls">                        <div class="leftButton"></div>                    </div>                    <div class="tabs"></div>                    <div class="rightControls">                        <div class="rightButton"></div>                        <div class="tabSelectButton"></div>                        <div class="stashTabSelectWrapper">                            <div class="stashTabSelect poeScroll FontinRegular"></div>                        </div>                    </div>                </div>                <div class="border tl"></div>                 <div class="border t"></div>                 <div class="border tr"></div>                 <div class="border r"></div>                 <div class="border br"></div>                 <div class="border b"></div>                 <div class="border bl"></div>                 <div class="border l"></div>             ');
            var n = this;
            return n.$el.find("img").attr("src", n.options.stashImageSrc),
            this.$tabsControl = n.$el.find(".stashTabContainer"),
            this.tabsControl = new s(this.$tabsControl,this.options.tabControlConfig),
            this.tabsControl.onTabClicked = function(e) {
                var t = e.getColour();
                n.setBorderColour(t.r, t.g, t.b),
                n.showMTXStashItems()
            }
            ,
            this.showMTXStashItems(!0),
            this.rendered = !0,
            this.initElementRefs(),
            t.resolve(),
            t.promise()
        }
    })
}),
define("PoE/Backbone/Model/Character/Character", ["Backbone"], function(e) {
    return e.RelationalModel.extend({
        relations: []
    })
}),
define("PoE/Backbone/Collection/Character/CharacterCollection", ["Backbone", "PoE/Backbone/Model/Character/Character"], function(e, t) {
    return e.Collection.extend({
        model: t
    })
}),
define("PoE/API/Account", ["jquery", "PoE/Backbone/Collection/Character/CharacterCollection"], function(e, t) {
    return {
        getCharacters: function(n) {
            var r = e.Deferred()
              , i = {
                accountName: window.accountName
              };
            return n.accountName && (i.accountName = n.accountName),
            e.ajax({
                url: "/character-window/get-characters",
                type: "GET",
                dataType: "json",
                data: i,
                success: function(e) {
                    r.resolve(new t(JSON.parse(e)))
                }
            }),
            r.promise()
        }
    }
}),
define("text!PoE/Inventory/InventoryManagerMenuCharacter.hbt", [], function() {
    return '{{#with character}}\n<span data-class="{{class}}" data-ascendancyClass="{{ascendancyClass}}" data-classId="{{classId}}" data-league="{{league}}" data-level="{{level}}" data-levels="{{levels}}" data-name="{{name}}"><div class="icon {{class}}"></div>\n<div class="infoLine1">{{#if expired}}<div class="expired-character-flag">*</div>{{/if}}<span class="characterName">{{name}}</span></div>\n<div class="infoLine2">{{translate "Level"}} {{level}} {{translate class}}</div>\n<div class="infoLine3">{{league}} {{translate "League"}}</div>\n{{/with}}\n'
}),
define("PoE/Inventory/InventoryManagerMenuCharacter", ["jquery", "Backbone", "PoE/Handlebars/TemplateCollection", "PoE/Backbone/EventBus", "text!PoE/Inventory/InventoryManagerMenuCharacter.hbt"], function(e, t, n, r) {
    return t.View.extend({
        tagName: "li",
        initialize: function() {
            var e = this;
            this.$el.addClass("character"),
            this.active = e.options.active,
            this.model.get("expired") && this.$el.addClass("expired"),
            this.active && this.$el.addClass("active"),
            r.on("activeCharacterChanged", function(t) {
                t.get("name") == e.model.get("name") ? (e.active = !0,
                e.$el.addClass("active")) : (e.active = !1,
                e.$el.removeClass("active"))

                span = $($(e.$el).find('span')[0])
                if (typeof(span.data("levels")) == "string") {
                  levels = span.data('levels').split(",");
                } else {
                  levels = [span.data('levels')]
                }

                classs = span.data('class');
                ascendancyclass = span.data('ascendancyclass');
                classid = span.data('classid');
                league = span.data('league');
                name = span.data('name');
                accountName = "{{account.name}}"
                $.each(levels, function (i, item) {
                    $('#levelDropdown').append(
                      $('<option>', {
                        value: e.model.get("name"),
                        text : e.model.get("name") + "(" + item + ")"
                    }).attr({"data-level": item, "data-class": classs, "data-ascendancyclass": ascendancyclass, "data-classid": classid, "data-league": league, "data-name": name,}).addClass('levelLink')
                  );
                });

            })
        },
        events: {
            "click .icon": "characterClicked",
            "click .infoLine1": "characterClicked",
            "click .infoLine2": "characterClicked"
        },
        characterClicked: function() {
            this.model.get("expired") || r.trigger("activeCharacterChanged", this.model)
        },
        render: function() {
            var e = this;
            n.load("PoE/Inventory/InventoryManagerMenuCharacter.hbt").done(function(t) {
                var n = {
                    character: e.model.toJSON()
                };
                e.$el.html(t(n))
            })
        }
    })
}),
define("text!PoE/Inventory/InventoryManagerMenu.hbt", [], function() {
    return '{{#unless equippedOnly}}\n<div class="inventoryButton showInventoryButton active"></div>\n<div class="inventoryButton showSkillTreeButton"></div>\n<div class="inventoryButton showStashButton"></div>\n<div class="inventoryButton showMTXStashButton"></div>\n{{/unless}}\n<ul class="characters poeScroll">\n</ul>\n'
}),
define("PoE/Inventory/InventoryManagerMenu", ["jquery", "Backbone", "PoE/Handlebars/TemplateCollection", "PoE/API/Account", "./InventoryManagerMenuCharacter", "PoE/Backbone/EventBus", "jquery.mousewheel", "text!PoE/Inventory/InventoryManagerMenu.hbt", "jquery.scrollbar"], function(e, t, n, r, i, s) {
    return t.View.extend({
        initialize: function() {
            var e = this;
            this.accountName = this.options.accountName || null,
            this.equippedOnly = this.options.equippedOnly || null;
            var t = {};
            this.accountName && (t.accountName = this.accountName),
            this.charactersLoaded = r.getCharacters(t).done(function(t) {
                e.characters = t
            }),
            this.activeCharacter = this.options.activeCharacter,
            s.on("activeCharacterChanged", function(t) {
                e.activeCharacter = t
            })
        },
        initElementRefs: function() {
            this.$menu = this.$el.find("ul"),
            this.$characters = this.$el.find(".characters")
        },
        events: {
            "click .showInventoryButton": "showInventory",
            "click .showStashButton": "showStash",
            "click .showSkillTreeButton": "showSkillTree",
            "click .showMTXStashButton": "showMTXStash"
        },
        showInventory: function(t) {
            this.resetMenu(),
            this.trigger("showInventory"),
            e(".inventoryButton").removeClass("active"),
            e(t.target).addClass("active")
        },
        showStash: function(t) {
            this.resetMenu(),
            this.trigger("showStash"),
            e(".inventoryButton").removeClass("active"),
            e(t.target).addClass("active")
        },
        showSkillTree: function(t) {
            this.resetMenu(),
            window.enablePassiveLink = !0,
            this.trigger("showPassiveSkillTree"),
            e(".inventoryButton").removeClass("active"),
            e(t.target).addClass("active")
        },
        showMTXStash: function(t) {
            this.resetMenu(),
            this.trigger("showMTXStash"),
            e(".inventoryButton").removeClass("active"),
            e(t.target).addClass("active")
        },
        resetMenu: function() {
            this.$menu.find("input").removeClass("active")
        },
        render: function() {
            var e = this;
            n.load("PoE/Inventory/InventoryManagerMenu.hbt").done(function(t) {
                e.charactersLoaded.done(function(n) {
                    var r = {
                        equippedOnly: e.equippedOnly
                    };
                    e.$el.html(t(r)),
                    e.initElementRefs(),
                    n.each(function(t) {
                        var n = new i({
                            model: t,
                            active: t.get("name") == e.activeCharacter.get("name")
                        });
                        e.$characters.append(n.$el),
                        n.render()
                    });
                    if (n.size() > 9 || e.equippedOnly !== null && n.size() > 6) {
                        var s = e.$characters.scrollbar({
                            showArrows: !0,
                            scrollx: "advanced",
                            scrolly: "advanced",
                            ignoreMobile: !0
                        });
                        s || e.$characters.css("overflow-y", "auto")
                    }
                })
            })
        }
    })
}),
define("PoE/PassiveSkillTree/ByteEncoder", [], function() {
    return function() {
        this.init = function() {
            this.dataString = "",
            this.position = 0
        }
        ,
        this.int16ToBytes = function(e) {
            return this.intToBytes(e, 2)
        }
        ,
        this.intToBytes = function(e, t) {
            t = t || 4,
            e = parseInt(e);
            var n = []
              , r = t;
            do
                n[--r] = e & 255,
                e >>= 8;
            while (r > 0);return n
        }
        ,
        this.appendInt8 = function(e) {
            this.appendInt(e, 1)
        }
        ,
        this.appendInt16 = function(e) {
            this.appendInt(e, 2)
        }
        ,
        this.appendInt = function(e, t) {
            t = t || 4;
            var n = this.intToBytes(e, t);
            for (var r = 0; r < t; ++r)
                this.dataString += String.fromCharCode(n[r])
        }
        ,
        this.getDataString = function() {
            return this.dataString
        }
        ,
        this.init()
    }
}),
define("PoE/PassiveSkillTree/Version", [], function() {
    return 4
}),
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
        (o ? "http://poedb.tw/us/fullscreen-passive-skill-tree/" : "http://poedb.tw/us/passive-skill-tree/") + l
    }
}),
define("text!PoE/Inventory/InventoryManager.hbt", [], function() {
    return '<div class="inventoryManagerMenu"></div>\n<div class="activePanel"></div>\n{{#if equippedOnly}}\n<div class="characterPassiveSkillTree"></div>\n{{/if}}'
}),
define("PoE/Inventory/InventoryManager", ["plugins", "Backbone", "PoE/Handlebars/TemplateCollection", "./MainInventoryPanel", "./StashPanel", "./MTXStashPanel", "./InventoryManagerMenu", "PoE/PassiveSkillTree/GenerateLink", "PoE/Backbone/EventBus", "text!PoE/Inventory/InventoryManager.hbt"], function(e, t, n, r, i, s, o, u, a) {
    return t.View.extend({
        initialize: function() {
            var e = this;
            this.$el.addClass("inventoryManager"),
            this.activeCharacter = this.options.activeCharacter,
            this.accountName = this.options.accountName || null,
            this.equippedOnly = this.options.equippedOnly || null,
            a.on("activeCharacterChanged", function(t) {
                e.showPassiveSkillTree(t)
            })
        },
        open: function() {
            var t = this;
            e(document).bind("cbox_open", function() {
                t.show(),
                e("#colorbox").addClass("colorBoxPanelTheme")
            }),
            e(document).bind("cbox_cleanup", function() {
                t.hide(),
                e(document).unbind("cbox_open"),
                e(document).unbind("cbox_cleanup")
            }),
            this.show(),
            e.colorbox({
                inline: !0,
                href: this.$el
            }),
            this.$colorbox || (this.$colorbox = e("#colorbox"),
            this.$colorbox.addClass("inventoryManagerColorbox")),
            setTimeout(function() {
                e.colorbox.resize()
            }, 2e3)
        },
        createMainInventoryPanel: function() {
            if (this.mainInventoryPanel)
                return;
            this.mainInventoryPanel = new r({
                accountName: this.accountName,
                inventoryImageSrc: this.options.inventoryImageSrc,
                activeCharacter: this.options.activeCharacter,
                equippedOnly: this.equippedOnly
            })
        },
        createStashPanel: function() {
            if (this.stashPanel || this.equippedOnly)
                return;
            this.stashPanel = new i({
                accountName: this.accountName,
                stashImageSrc: this.options.stashImageSrc,
                activeLeague: this.options.activeCharacter.get("league"),
                tabs: !0
            })
        },
        createMTXStashPanel: function() {
            if (this.mtxStashPanel || this.equippedOnly)
                return;
            this.mtxStashPanel = new s({
                accountName: this.accountName,
                mtxStashImageSrc: this.options.mtxStashImageSrc,
                activeLeague: this.options.activeCharacter.get("league")
            })
        },
        showPassiveSkillTree: function(t) {
            var n = this;
            t && (n.activeCharacter = t);
            var r = n.activeCharacter.get("classId")
              , i = n.activeCharacter.get("name")
              , s = n.activeCharacter.get("ascendancyClass")
              , o = {
                reqData: 0,
                character: i,
                account: n.accountName,
                level: n.activeCharacter.attributes.level
            };
            n.accountName && (o.accountName = n.accountName),
            e.ajax({
                url: "/character-window/get-passive-skills",
                data: o,
                dataType: "json",
                success: function(e) {
                    var t = "";
                    if (e === !1)
                        return;
                    o.character && o.accountName && (t = "?accountName=" + o.accountName + "&characterName=" + o.character),
                    window.enablePassiveLink && (window.location.href = u(r, s, e.hashes, !1) + t),
                    n.equippedOnly && n.$passiveSkillTree.html('<iframe sandbox="allow-popups allow-scripts allow-forms allow-same-origin allow-top-navigation" src="' + u(r, s, e.hashes, !0) + '" width="903" height="630" scrolling="yes" frameborder="0"></iframe>')
                }
            })
        },
        createMenu: function() {
            var e = this;
            if (this.menu)
                return;
            this.menu = new o({
                el: this.$menu,
                activeCharacter: this.options.activeCharacter,
                accountName: this.accountName,
                equippedOnly: this.equippedOnly
            }),
            this.menu.on("showInventory", function() {
                e.showMainInventory()
            }),
            this.menu.on("showStash", function() {
                e.showStash()
            }),
            this.menu.on("showPassiveSkillTree", function() {
                e.showPassiveSkillTree()
            }),
            this.menu.on("showMTXStash", function() {
                e.showMTXStash()
            }),
            this.menu.render()
        },
        showMainInventory: function() {
            this.createMainInventoryPanel(),
            this.closeActivePanel(),
            this.currentPanel = this.mainInventoryPanel,
            this.renderActivePanel()
        },
        showStash: function() {
            this.createStashPanel(),
            this.closeActivePanel(),
            this.currentPanel = this.stashPanel,
            this.renderActivePanel()
        },
        showMTXStash: function() {
            this.createMTXStashPanel(),
            this.closeActivePanel(),
            this.currentPanel = this.mtxStashPanel,
            this.renderActivePanel()
        },
        closeActivePanel: function() {
            this.currentPanel && this.currentPanel.close()
        },
        renderActivePanel: function() {
            this.$activePanel.empty().append(this.currentPanel.$el),
            this.currentPanel.render().done(function() {
                e.colorbox.resize()
            })
        },
        show: function() {
            this.currentPanel && this.currentPanel.show(),
            this.$el.show()
        },
        hide: function() {
            this.currentPanel && this.currentPanel.hide(),
            this.$el.hide()
        },
        close: function() {
            this.closeActivePanel(),
            this.remove(),
            this.unbind()
        },
        render: function() {
            var t = this;
            return n.load("PoE/Inventory/InventoryManager.hbt").done(function(n) {
                var r = {
                    equippedOnly: t.equippedOnly
                };
                t.$el.html(n(r)),
                t.$el.find("img.inventoryImage").attr("src", t.options.inventoryImageSrc),
                t.$el.find("img.stashImage").attr("src", t.options.stashImageSrc),
                t.$activePanel = t.$el.find(".activePanel"),
                t.$passiveSkillTree = t.$el.find(".characterPassiveSkillTree"),
                t.$menu = t.$el.find(".inventoryManagerMenu"),
                t.currentPanel || (t.createMainInventoryPanel(),
                t.currentPanel = t.mainInventoryPanel),
                t.createMenu(),
                t.showPassiveSkillTree(),
                t.$activePanel.empty().append(t.currentPanel.el),
                t.currentPanel.render().done(function() {
                    e.colorbox.resize()
                })
            })
        }
    })
}),
define("text!PoE/Inventory/InventoryControls.hbt", [], function() {
    return '{{#with activeCharacter}}\n<div class="infoLine1"><span class="characterName">{{name}}</span></div>\n<div class="infoLine2">{{translate "Level"}} {{level}} {{translate class}}</div>\n<div class="infoLine3">{{translate league}} {{translate "League"}}</div>\n{{/with}}\n<div class="icon {{activeCharacter.class}}"></div>\n<a class="open" href="#">{{translate "SWITCH CHARACTER"}}</a>\n'
}),
define("PoE/Inventory/InventoryControls", ["jquery", "Backbone", "PoE/Handlebars/TemplateCollection", "./InventoryManager", "PoE/Backbone/Model/Character/Character", "PoE/Backbone/EventBus", "text!PoE/Inventory/InventoryControls.hbt"], function(e, t, n, r, i, s) {
    return t.View.extend({
        initialize: function() {
            var e = this;
            this.initElementRefs(),
            this.activeCharacter = new i(this.options.activeCharacter),
            this.accountName = this.options.accountName || null
        },
        initElementRefs: function() {
            this.$body = e("body")
        },
        events: {
            "click .open": "open",
            "click .icon": "open",
            "click .infoLine1": "open",
            "click .infoLine2": "open"
        },
        open: function(e) {
            e.preventDefault();
            var t = this;
            if (!this.inventoryManager) {
                var n = this.options.inventoryManager;
                n.id = "inventory-manager",
                n.activeCharacter = this.activeCharacter,
                n.accountName = this.accountName,
                this.inventoryManager = new r(n),
                this.$body.append(this.inventoryManager.$el),
                this.inventoryManagerRendered = this.inventoryManager.render()
            }
            this.inventoryManagerRendered.done(function() {
                t.inventoryManager.open()
            })
        },
        render: function() {
            var e = this
              , t = {
                activeCharacter: this.activeCharacter.toJSON()
            };
            n.load("PoE/Inventory/InventoryControls.hbt").done(function(n) {
                e.$el.html(n(t))
            })
        }
    })
}),
define("PoE/Model/Account/Guild/PointsTransaction", ["Backbone"], function(e) {
    return e.RelationalModel.extend({
        url: "/api/account/guild/point-transactions",
        relations: []
    })
}),
define("PoE/Model/Account/Guild/Guild", ["require", "Backbone"], function(e) {
    var t = e("Backbone");
    return t.RelationalModel.extend({
        url: "/api/guild",
        relations: []
    })
}),
define("PoE/Collection/Account/Guild/PointTransactions", ["require", "jquery", "Backbone", "PoE/Backbone/Paginator", "PoE/Model/Account/Guild/PointsTransaction"], function(e) {
    var t = e("jquery")
      , n = e("Backbone")
      , r = e("PoE/Backbone/Paginator")
      , i = e("PoE/Model/Account/Guild/PointsTransaction");
    return r.extend({
        model: i,
        paginator_core: {
            url: "/api/account/guild/point-transactions",
            dataType: "json"
        },
        paginator_ui: {
            firstPage: 1,
            currentPage: 1,
            perPage: 5,
            totalPages: 10
        },
        server_api: {
            offset: function() {
                return (this.currentPage - 1) * this.perPage
            },
            limit: function() {
                return this.perPage
            }
        },
        perPageOptions: [5, 20, 50, 100],
        parse: function(e) {
            return e.limit && (this.perPage = parseInt(e.limit, 10)),
            this.totalRecords = e.total,
            this.totalPages = Math.ceil(e.total / this.perPage),
            e.entries
        }
    })
}),
define("PoE/API/Error", ["require", "jquery"], function(e) {
    var t = e("jquery")
      , n = function() {
        this.message = null,
        this.code = null
    };
    return n.prototype.getMessage = function() {
        return this.message
    }
    ,
    n.prototype.setMessage = function(e) {
        this.message = e
    }
    ,
    n.prototype.setCode = function(e) {
        this.code = e
    }
    ,
    n.fromResponse = function(e) {
        var r = new n, i;
        return e.responseText && (i = t.parseJSON(e.responseText),
        r.setMessage(i.error.message),
        r.setCode(i.error.code)),
        r
    }
    ,
    n
}),
define("text!PoE/Widget/Guild/AccountTransaction.hbt", [], function() {
    return '<div class="txInfo">\r\n    <div class="left">\r\n        <span class="points">{{points}}<span class="pointsIcon" title="Points"></span></span>\r\n    </div>\r\n    <div class="createdAt">{{moment createdAt format="MMMM Do YYYY, h:mm:ss a"}}</div>\r\n</div>\r\n{{#ifCond status "===" "new"}}\r\n<div class="menu">\r\n    <button class="cancel button1 important">{{translate "Cancel"}}</button>\r\n</div>\r\n{{else}}\r\n<div class="status">\r\n    {{#ifCond status "===" "cancelled"}}{{translate "Cancelled"}}{{/ifCond}}\r\n    {{#ifCond status "===" "rejected"}}{{translate "Rejected"}}{{/ifCond}}\r\n    {{#ifCond status "===" "complete"}}{{translate "Complete"}}{{/ifCond}}\r\n</div>\r\n{{/ifCond}}\r\n<div class="error"></div>'
}),
define("PoE/Widget/Guild/AccountTransaction", ["require", "Backbone", "jquery", "PoE/Handlebars/TemplateCollection", "PoE/Model/Account/Guild/PointsTransaction", "PoE/Loader", "PoE/API/Error", "PoE/Helpers", "text!PoE/Widget/Guild/AccountTransaction.hbt"], function(e) {
    var t = e("Backbone")
      , n = e("jquery")
      , r = e("PoE/Handlebars/TemplateCollection")
      , i = e("PoE/Model/Account/Guild/PointsTransaction")
      , s = e("PoE/Loader")
      , o = e("PoE/API/Error")
      , u = e("PoE/Helpers");
    return e("text!PoE/Widget/Guild/AccountTransaction.hbt"),
    t.View.extend({
        initialize: function() {},
        events: {
            "click button.cancel": "cancel"
        },
        startAction: function() {
            s.start(),
            this.disableButtons(),
            this.clearError()
        },
        endAction: function() {
            s.done(),
            this.enableButtons()
        },
        disableButtons: function() {
            this.$cancelButton.attr("disabled", !0)
        },
        enableButtons: function() {
            this.$cancelButton.removeAttr("disabled")
        },
        cancel: function() {
            var e = this;
            return confirm(u.translate("Cancel transaction?")) && (this.startAction(),
            this.model.save({
                method: "cancel"
            }, {
                type: "post",
                success: function() {
                    e.render()
                },
                error: function(t, n) {
                    var r = o.fromResponse(n);
                    e.showError(r.getMessage())
                }
            }).always(function() {
                e.endAction()
            })),
            !1
        },
        clearError: function() {
            this.$error.hide()
        },
        showError: function(e) {
            this.$error.text(e),
            this.$error.show()
        },
        render: function() {
            var e = this;
            r.load("PoE/Widget/Guild/AccountTransaction.hbt").done(function(t) {
                var n = e.model.toJSON();
                e.$el.html(t(n)),
                e.$el.removeClass().addClass("transaction").addClass(e.model.get("status")),
                e.$cancelButton = e.$el.find("button.cancel"),
                e.$error = e.$el.find(".error")
            })
        }
    })
}),
define("text!PoE/Widget/Guild/Guild.hbt", [], function() {
    return '<div class="left balance">\r\n    <h2>{{translate "Guild Balance"}}</h2>\r\n    <div class="points" title="Guild Points">{{guild.points}}</div>\r\n</div>'
}),
define("PoE/Widget/Guild/Guild", ["require", "Backbone", "jquery", "PoE/Handlebars/TemplateCollection", "text!PoE/Widget/Guild/Guild.hbt"], function(e) {
    var t = e("Backbone")
      , n = e("jquery")
      , r = e("PoE/Handlebars/TemplateCollection");
    return e("text!PoE/Widget/Guild/Guild.hbt"),
    t.View.extend({
        initialize: function() {
            var e = this;
            this.$el.addClass("guild"),
            this.model.on("change", function() {
                e.render()
            })
        },
        render: function() {
            var e = this;
            r.load("PoE/Widget/Guild/Guild.hbt").done(function(t) {
                var n = {
                    guild: e.model.toJSON(),
                    identifyingMember: e.options.identifyingMember.toJSON()
                };
                e.$el.html(t(n))
            })
        }
    })
}),
define("text!PoE/Widget/Guild/MemberPanel.hbt", [], function() {
    return '<div class="frame">\r\n    <div class="background"></div>\r\n    <div class="top"></div>\r\n    <div class="bottom"></div>\r\n    <div class="content">\r\n        <div class="guild"></div>\r\n    </div>\r\n</div>\r\n<div class="memberPanel">\r\n    <div class="frame">\r\n        <div class="background"></div>\r\n        <div class="top"></div>\r\n        <div class="bottom"></div>\r\n        <div class="content">\r\n            <div class="createTransaction">\r\n                <h2>{{translate "Give Microtransaction Points to Guild"}}</h2>\r\n                <p>{{translate "Use this form to send points to your Guild to allow your Guild Leader to purchase Microtransactions. If the Guild Leader accepts your points you can not be kicked out for three months."}}</p>\r\n                <div class="formT1">\r\n                    <div class="row points">\r\n                        <label for="points">{{translate "Points Amount"}}:</label>\r\n                        <div class="element">\r\n                            <input type="text" name="points" class="points">\r\n                            <ul></ul>\r\n                            <div class="success message"></div>\r\n                        </div>\r\n                    </div>\r\n                    <div class="row"><div class="element"><button class="createTransaction button1 important">{{translate "Give Points"}}</button></div></div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <div class="frame">\r\n        <div class="background"></div>\r\n        <div class="top"></div>\r\n        <div class="bottom"></div>\r\n        <div class="content">\r\n            <div class="currentTransactions">\r\n                <h2>{{translate "Transaction History"}}</h2>\r\n                <div class="entries"></div>\r\n                <div class="pagination"></div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>'
}),
define("PoE/Widget/Guild/MemberPanel", ["require", "Backbone", "jquery", "PoE/Handlebars/TemplateCollection", "PoE/Model/Account/Guild/PointsTransaction", "PoE/Model/Account/Guild/Guild", "PoE/Collection/Account/Guild/PointTransactions", "PoE/View/Widget/Pagination", "./AccountTransaction", "./Guild", "PoE/API/Error", "PoE/Loader", "PoE/Helpers", "text!PoE/Widget/Guild/MemberPanel.hbt"], function(e) {
    var t = e("Backbone")
      , n = e("jquery")
      , r = e("PoE/Handlebars/TemplateCollection")
      , i = e("PoE/Model/Account/Guild/PointsTransaction")
      , s = e("PoE/Model/Account/Guild/Guild")
      , o = e("PoE/Collection/Account/Guild/PointTransactions")
      , u = e("PoE/View/Widget/Pagination")
      , a = e("./AccountTransaction")
      , f = e("./Guild")
      , l = e("PoE/API/Error")
      , c = e("PoE/Loader")
      , h = e("PoE/Helpers");
    return e("text!PoE/Widget/Guild/MemberPanel.hbt"),
    t.View.extend({
        initialize: function() {
            var e = this;
            this.accountTransactions = new o,
            this.fetchAccountTransactions(),
            this.accountTransactionsPagination = new u({
                collection: this.accountTransactions
            }),
            this.accountTransactions.on("reset", function() {
                e.addAccountTransactions()
            }),
            this.guildView = new f({
                model: this.model,
                identifyingMember: this.options.identifyingMember
            }),
            this.guildView.render()
        },
        events: {
            "click button.createTransaction": "create"
        },
        transactionCompleted: function() {
            c.start(),
            this.model.fetch().always(function() {
                c.done()
            })
        },
        fetchAccountTransactions: function() {
            var e = this;
            this.accountTransactions.fetch().done(function() {
                e.addAccountTransactions()
            })
        },
        create: function() {
            var e = parseInt(n.trim(this.$points.val()), 10)
              , t = this;
            if (isNaN(e))
                this.showPointsError(h.translate("Amount is not a number"));
            else if (e <= 0)
                this.showPointsError(h.translate("Amount must be greater than 0"));
            else if (confirm(h.translate("Transfer") + " " + e + " " + h.translate("point" + (e > 1 ? "s" : "") + " to your guild") + "?")) {
                this.clearPointsError(),
                this.$createButton.attr("disabled", !0);
                var r = new i({
                    points: e
                });
                c.start(),
                r.save().then(function() {
                    t.fetchAccountTransactions(),
                    t.showSuccessMessage(h.translate("Transaction created"))
                }, function(e) {
                    var n = l.fromResponse(e);
                    t.showPointsError(n.getMessage())
                }).always(function() {
                    c.done(),
                    t.$createButton.removeAttr("disabled")
                })
            }
        },
        showSuccessMessage: function(e) {
            var t = this;
            this.$successMessage.text(e),
            this.successTimeout && clearTimeout(this.successTimeout),
            this.successTimeout = setTimeout(function() {
                t.$successMessage.hide()
            }, 2e4)
        },
        showPointsError: function(e) {
            this.clearPointsError(),
            this.$pointsRow.addClass("error");
            var t = n("<li></li>").text(e);
            this.$pointsErrors.append(t)
        },
        clearPointsError: function() {
            this.$pointsRow.removeClass("error"),
            this.$pointsErrors.empty()
        },
        addAccountTransactions: function() {
            var e = this;
            this.$accountTransactions.empty(),
            this.accountTransactions.each(function(t) {
                var n = new a({
                    model: t
                });
                n.render(),
                e.$accountTransactions.append(n.el)
            })
        },
        render: function() {
            var e = this;
            r.load("PoE/Widget/Guild/MemberPanel.hbt").done(function(t) {
                var n = {
                    identifyingMember: e.options.identifyingMember.toJSON()
                };
                e.$el.html(t(n)),
                e.accountTransactionsPagination.render(),
                e.$el.find(".memberPanel .pagination").replaceWith(e.accountTransactionsPagination.el),
                e.accountTransactionsPagination.delegateEvents(),
                e.$accountTransactions = e.$el.find(".memberPanel .entries"),
                e.addAccountTransactions(),
                e.$pointsRow = e.$el.find(".createTransaction .row.points"),
                e.$points = e.$pointsRow.find("input.points"),
                e.$pointsErrors = e.$pointsRow.find("ul"),
                e.$createButton = e.$el.find("button.createTransaction"),
                e.$successMessage = e.$el.find(".success.message"),
                e.$el.find(".guild").replaceWith(e.guildView.el),
                e.guildView.delegateEvents(),
                e.delegateEvents()
            })
        }
    })
}),
define("PoE/Model/Guild/PointsTransaction", ["Backbone"], function(e) {
    return e.RelationalModel.extend({
        url: "/api/guild/point-transactions",
        relations: []
    })
}),
define("PoE/Collection/Guild/PointTransactions", ["require", "jquery", "Backbone", "PoE/Backbone/Paginator", "PoE/Model/Guild/PointsTransaction"], function(e) {
    var t = e("jquery")
      , n = e("Backbone")
      , r = e("PoE/Backbone/Paginator")
      , i = e("PoE/Model/Guild/PointsTransaction");
    return r.extend({
        model: i,
        paginator_core: {
            url: "/api/guild/point-transactions",
            dataType: "json"
        },
        paginator_ui: {
            firstPage: 1,
            currentPage: 1,
            perPage: 5,
            totalPages: 10
        },
        server_api: {
            offset: function() {
                return (this.currentPage - 1) * this.perPage
            },
            limit: function() {
                return this.perPage
            }
        },
        perPageOptions: [5, 20, 50, 100],
        parse: function(e) {
            return e.limit && (this.perPage = parseInt(e.limit, 10)),
            this.totalRecords = e.total,
            this.totalPages = Math.ceil(e.total / this.perPage),
            e.entries
        }
    })
}),
define("text!PoE/Widget/Guild/GuildTransaction.hbt", [], function() {
    return '<div class="txInfo">\r\n    <div class="left">\r\n        <span class="points">{{points}}<span class="pointsIcon" title="Points"></span></span>\r\n        {{#if manual}}\r\n        {{translate "Manual transfer"}}\r\n        {{else}}\r\n        {{translate "from"}} {{profileLink account}}\r\n        {{/if}}\r\n    </div>\r\n    <div class="createdAt">{{moment createdAt format="MMMM Do YYYY, h:mm:ss a"}}</div>\r\n</div>\r\n{{#ifCond status "===" "new"}}\r\n    <div class="menu">\r\n        <button class="accept button1 important">{{translate "Accept"}}</button>\r\n        <button class="reject button1 important">{{translate "Reject"}}</button>\r\n    </div>\r\n{{else}}\r\n    <div class="status">\r\n        {{#ifCond status "===" "cancelled"}}{{translate "Cancelled"}}{{/ifCond}}\r\n        {{#ifCond status "===" "rejected"}}{{translate "Rejected"}}{{/ifCond}}\r\n        {{#ifCond status "===" "complete"}}{{translate "Complete"}}{{/ifCond}}\r\n    </div>\r\n{{/ifCond}}\r\n<div class="error"></div>'
}),
define("PoE/Widget/Guild/GuildTransaction", ["require", "Backbone", "jquery", "PoE/Handlebars/TemplateCollection", "PoE/Model/Account/Guild/PointsTransaction", "PoE/Loader", "PoE/API/Error", "PoE/Helpers", "text!PoE/Widget/Guild/GuildTransaction.hbt"], function(e) {
    var t = e("Backbone")
      , n = e("jquery")
      , r = e("PoE/Handlebars/TemplateCollection")
      , i = e("PoE/Model/Account/Guild/PointsTransaction")
      , s = e("PoE/Loader")
      , o = e("PoE/API/Error")
      , u = e("PoE/Helpers");
    return e("text!PoE/Widget/Guild/GuildTransaction.hbt"),
    t.View.extend({
        initialize: function() {},
        events: {
            "click button.accept": "accept",
            "click button.reject": "reject"
        },
        startAction: function() {
            s.start(),
            this.disableButtons(),
            this.clearError()
        },
        endAction: function() {
            s.done(),
            this.enableButtons()
        },
        accept: function() {
            var e = this;
            confirm(u.translate("Accept transaction?")) && (this.startAction(),
            this.model.save({
                method: "accept"
            }, {
                type: "post",
                success: function() {
                    e.render(),
                    e.trigger("transactionComplete")
                },
                error: function(t, n) {
                    var r = o.fromResponse(n);
                    e.showError(r.getMessage())
                }
            }).always(function() {
                e.endAction()
            }))
        },
        reject: function() {
            var e = this;
            confirm(u.translate("Reject transaction?")) && (this.startAction(),
            this.model.save({
                method: "reject"
            }, {
                type: "post",
                success: function() {
                    e.render()
                },
                error: function(t, n) {
                    var r = o.fromResponse(n);
                    e.showError(r.getMessage())
                }
            }).always(function() {
                e.endAction()
            }))
        },
        clearError: function() {
            this.$error.hide()
        },
        showError: function(e) {
            this.$error.text(e),
            this.$error.show()
        },
        disableButtons: function() {
            this.$acceptButton.attr("disabled", !0),
            this.$rejectButton.attr("disabled", !0)
        },
        enableButtons: function() {
            this.$acceptButton.removeAttr("disabled"),
            this.$rejectButton.removeAttr("disabled")
        },
        render: function() {
            var e = this;
            r.load("PoE/Widget/Guild/GuildTransaction.hbt").done(function(t) {
                var n = e.model.toJSON();
                e.$el.html(t(n)),
                e.$el.removeClass().addClass("transaction").addClass(e.model.get("status")),
                e.$acceptButton = e.$el.find("button.accept"),
                e.$rejectButton = e.$el.find("button.reject"),
                e.$error = e.$el.find(".error")
            })
        }
    })
}),
define("text!PoE/Widget/Guild/LeaderPanel.hbt", [], function() {
    return '<div class="frame">\r\n    <div class="background"></div>\r\n    <div class="top"></div>\r\n    <div class="bottom"></div>\r\n    <div class="content">\r\n        <div class="guild"></div>\r\n    </div>\r\n</div>\r\n<div class="frame">\r\n    <div class="background"></div>\r\n    <div class="top"></div>\r\n    <div class="bottom"></div>\r\n    <div class="content">\r\n        <div class="leaderPanel">\r\n            <div class="transactions">\r\n                <h2>{{translate "Guild Transactions"}}</h2>\r\n                <p>{{translate "This is a list of points transfers from members of your Guild. Accept transactions to credit the points to your Guild. You will not be able to kick a player for three months if you accept their points."}}</p>\r\n                <div class="entries"></div>\r\n                <div class="pagination"></div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>'
}),
define("PoE/Widget/Guild/LeaderPanel", ["require", "Backbone", "jquery", "PoE/Handlebars/TemplateCollection", "PoE/Model/Account/Guild/PointsTransaction", "PoE/Model/Account/Guild/Guild", "PoE/Collection/Guild/PointTransactions", "PoE/View/Widget/Pagination", "./GuildTransaction", "./Guild", "PoE/API/Error", "PoE/Loader", "text!PoE/Widget/Guild/LeaderPanel.hbt"], function(e) {
    var t = e("Backbone")
      , n = e("jquery")
      , r = e("PoE/Handlebars/TemplateCollection")
      , i = e("PoE/Model/Account/Guild/PointsTransaction")
      , s = e("PoE/Model/Account/Guild/Guild")
      , o = e("PoE/Collection/Guild/PointTransactions")
      , u = e("PoE/View/Widget/Pagination")
      , a = e("./GuildTransaction")
      , f = e("./Guild")
      , l = e("PoE/API/Error")
      , c = e("PoE/Loader");
    return e("text!PoE/Widget/Guild/LeaderPanel.hbt"),
    t.View.extend({
        initialize: function() {
            var e = this;
            this.options.identifyingMember.get("type") === "Leader" && (this.guildTransactions = new o,
            this.fetchGuildTransactions(),
            this.guildTransactionsPagination = new u({
                collection: this.guildTransactions
            }),
            this.guildTransactions.on("reset", function() {
                e.addGuildTransactions()
            })),
            this.guildView = new f({
                model: this.model,
                identifyingMember: this.options.identifyingMember
            }),
            this.guildView.render()
        },
        events: {},
        transactionCompleted: function() {
            c.start(),
            this.model.fetch().always(function() {
                c.done()
            })
        },
        fetchGuildTransactions: function() {
            var e = this;
            this.options.identifyingMember.get("type") === "Leader" && this.guildTransactions.fetch().done(function() {
                e.addGuildTransactions()
            })
        },
        showPointsError: function(e) {
            this.clearPointsError(),
            this.$pointsRow.addClass("error");
            var t = n("<li></li>").text(e);
            this.$pointsErrors.append(t)
        },
        clearPointsError: function() {
            this.$pointsRow.removeClass("error"),
            this.$pointsErrors.empty()
        },
        addGuildTransactions: function() {
            var e = this;
            this.$guildTransactions.empty(),
            this.guildTransactions.each(function(t) {
                var n = new a({
                    model: t
                });
                n.on("transactionComplete", function() {
                    e.transactionCompleted()
                }),
                n.render(),
                e.$guildTransactions.append(n.el)
            })
        },
        render: function() {
            var e = this;
            r.load("PoE/Widget/Guild/LeaderPanel.hbt").done(function(t) {
                var n = {
                    identifyingMember: e.options.identifyingMember.toJSON()
                };
                e.$el.html(t(n)),
                e.options.identifyingMember.get("type") === "Leader" && (e.guildTransactionsPagination.render(),
                e.$el.find(".leaderPanel .pagination").replaceWith(e.guildTransactionsPagination.el),
                e.guildTransactionsPagination.delegateEvents(),
                e.$guildTransactions = e.$el.find(".leaderPanel .entries"),
                e.addGuildTransactions()),
                e.$el.find(".guild").replaceWith(e.guildView.el),
                e.guildView.delegateEvents(),
                e.delegateEvents()
            })
        }
    })
}),
define("PoE/API/Livestream/TwitchTV", ["jquery", "PoE/Deployment/Config"], function(e, t) {
    return {
        fetch: function(n) {
            var r = e.Deferred()
              , i = this;
            if (t.twitchClientId) {
                window.twlscb || (window.twlscb = function(e) {
                    i.result = e,
                    r.resolve(e)
                }
                );
                var s = "https://api.twitch.tv/kraken/streams?game=Path+of+Exile&callback=twlscb&client_id=" + t.twitchClientId;
                window.PoELocale == "zh_TW" ? s += "&language=zh-tw" : window.PoELocale == "pt_BR" ? s += "&language=pt-br" : window.PoELocale == "ru_RU" && (s += "&language=ru");
                var o = e.ajax({
                    url: s,
                    dataType: "script",
                    cache: !0
                })
            }
            return r
        }
    }
}),
define("PoE/Widget/TwitchTV", ["jquery", "PoE/API/Livestream/TwitchTV"], function(e, t) {
    var n = function(n, r, i) {
        this.$containerEl = n instanceof e ? n : e(n),
        this.$el = r instanceof e ? r : e(r),
        this.blacklist = i && i.blacklist || [],
        this.limit = i && i.limit ? i.limit : 3,
        this.clientId = i && i.clientId ? i.clientId : "";
        var s = this;
        t.fetch({
            clientId: this.clientId
        }).done(function(e) {
            s.result = e,
            s.draw()
        })
    };
    return n.prototype.draw = function() {
        this.$el.empty();
        var t = this.result.streams.length;
        if (t == 0)
            return;
        var n = 0;
        for (var r = 0; r < t; ++r) {
            var i = this.result.streams[r]
              , s = e('<div class="stream"><div><a><img/></a></div><div><a><span class="status"></span></a><div class="info"><div class="nameCont"><a><span class="name"></span></a></div><div class="viewersCont"><a><span class="viewers"></span></a></div></div></div>')
              , o = e("<img/>");
            if (e.inArray(i.channel.name, this.blacklist) != -1)
                continue;
            s.find("img").attr("src", i.preview.medium),
            s.find("a").attr("href", i.channel.url),
            s.find(".status").text(i.channel.status),
            s.find(".name").text(i.channel.name),
            s.find(".viewers").text(i.viewers + " viewer" + (i.viewers == 1 ? "" : "s") + ""),
            i.channel.name == "pathofexile" ? (this.$el.prepend(s),
            n > this.limit && this.$el.find(".stream").last().remove()) : n < this.limit && this.$el.append(s),
            ++n
        }
        this.$el.append('<div class="clear"></div>'),
        n > 0 && this.$containerEl.show()
    }
    ,
    n
}),
define("PoE/Widget/YoutubeModal", ["require", "jquery", "./YoutubeVideo"], function(e) {
    var t = e("jquery")
      , n = e("./YoutubeVideo")
      , r = function(e) {
        var r = e instanceof t ? e : t(e)
          , i = r.find(".video");
        t(document).bind("cbox_open", function() {
            t("#colorbox").addClass("colorBoxTheme1 hideClose")
        }),
        t(document).bind("cbox_cleanup", function() {}),
        this.show = function() {
            if (i.length)
                var e = new n(i);
            t.colorbox({
                inline: !0,
                href: r
            })
        }
    };
    return r
}),
define("PoE/Widget/OpenBetaCountdown", ["plugins", "Backbone"], function(e, t) {
    return t.View.extend({
        initialize: function() {},
        render: function() {
            var t = this;
            e("#openBetaCountdown.fullLink").css("cursor", "pointer"),
            e("#openBetaCountdown.fullLink").click(function() {
                var t = e(this).data("url");
                document.location = t
            });
            if (this.options.secs <= 0)
                return;
            this.$countdown = this.$el.find(".countdown"),
            this.last = [null, null, null, null, null, null, null],
            this.$countdown.countdown({
                until: this.options.secs,
                layout: '<div class="days">{dn}</div><div class="hours">{hn}</div><div class="minutes">{mn}</div><div class="seconds">{sn}</div>',
                onExpiry: function() {
                    setTimeout(function() {
                        e("body").removeClass("openBetaCountdownEnabled"),
                        t.$el.parents(".layoutBox1:first").remove(),
                        t.$el.remove()
                    }, 1e4)
                },
                onTick: function(e) {
                    var n = function(n, r) {
                        e[n] !== t.last[n] && (t.last[n] = e[n],
                        t.$countdown.find(r).addClass("start"),
                        setTimeout(function() {
                            t.$countdown.find(r).addClass("done")
                        }, 0),
                        e[n] === 0 && r != ".seconds" && t.$countdown.find(r).addClass("zero"),
                        e[3] === 0 && (t.$countdown.find(".days").addClass("zero"),
                        e[4] == 0 && (t.$countdown.find(".hours").addClass("zero"),
                        e[5] === 0 && (t.$countdown.find(".minutes").addClass("zero"),
                        e[6] === 0 && t.$countdown.find(".seconds").addClass("zero")))))
                    };
                    n(6, ".seconds"),
                    n(5, ".minutes"),
                    n(4, ".hours"),
                    n(3, ".days")
                }
            })
        }
    })
}),
define("PoE/Widget/R16Label", ["Backbone", "PoE/Helpers"], function(e, t) {
    return e.View.extend({
        initialize: function() {},
        render: function() {
            if (window.momentTimezone != "Pacific/Auckland")
                return;
            this.$el.addClass("active"),
            this.$el.html('<img src="' + t.imageUrl("legal/r16small.png") + '" alt="Restricted to persons 16 Years and over." />')
        }
    })
}),
define("text!PoE/Widget/Season/Reward.hbt", [], function() {
    return '<div class="points">{{requiredPoints}}</div>\r\n<div class="itemDest"></div>\r\n<div class="marker"></div>'
}),
define("PoE/Widget/Season/Reward", ["require", "plugins", "Backbone", "Handlebars", "PoE/Handlebars/TemplateCollection", "PoE/Item/Item", "PoE/Backbone/Model/Item/Item", "text!PoE/Widget/Season/Reward.hbt"], function(e) {
    var t = e("plugins")
      , n = e("Backbone")
      , r = e("Handlebars")
      , i = e("PoE/Handlebars/TemplateCollection")
      , s = e("PoE/Item/Item")
      , o = e("PoE/Backbone/Model/Item/Item");
    return e("text!PoE/Widget/Season/Reward.hbt"),
    n.View.extend({
        initialize: function() {
            this.$el.addClass("reward"),
            this.options.last && this.$el.addClass("last")
        },
        initElementRefs: function() {},
        events: {},
        render: function() {
            var e = this;
            return i.load("PoE/Widget/Season/Reward.hbt").done(function(t) {
                var n = e.model.toJSON();
                e.$el.html(t(n));
                var r = e.model.get("item");
                if (r) {
                    var i = new s({
                        enableVerified: !1,
                        enableLeague: !1,
                        model: new o(r)
                    });
                    i.render(),
                    e.$el.find(".itemDest").replaceWith(i.$el)
                }
            })
        }
    })
}),
define("PoE/Model/Season/PlayerInfo", ["Backbone"], function(e) {
    return e.RelationalModel.extend({})
}),
define("PoE/Model/Season/LifetimePlayerInfo", ["Backbone"], function(e) {
    return e.RelationalModel.extend({})
}),
define("text!PoE/Widget/Season/SeasonInfo.hbt", [], function() {
    return '<div class="seasonInfo currentSeasonInfo{{#if small}} small{{/if}}{{#if garena}} garena{{/if}}{{#if region}} {{region}}{{/if}}" id="{{season.htmlId}}">\r\n    <div class="content">\r\n        <h1 class="name">{{translate season.id}}</h1>\r\n        {{#unless small}}\r\n            {{{season.htmlContent}}}\r\n        {{/unless}}\r\n    </div>\r\n    <div class="pointsBackground"></div>\r\n    <div class="pointsProgress">\r\n        <div class="barContainer"><div class="bar"></div></div>\r\n        <div class="frame"></div>\r\n    </div>\r\n    <div class="playerInfo">\r\n    {{label}}: {{playerInfo.points}}\r\n    </div>\r\n</div>\r\n\r\n<div class="seasonInfo lifetimeSeasonInfo{{#if small}} small{{/if}}">\r\n    <div class="pointsProgress">\r\n        <div class="barContainer"><div class="bar"></div></div>\r\n        <div class="frame"></div>\r\n    </div>\r\n    <div class="playerInfo">\r\n        {{translate "Lifetime Points"}}: {{lifetimePlayerInfo.points}}\r\n    </div>\r\n</div>'
}),
define("PoE/Widget/Season/SeasonInfo", ["require", "plugins", "Backbone", "Handlebars", "PoE/Handlebars/TemplateCollection", "./Reward", "PoE/Model/Season/PlayerInfo", "PoE/Model/Season/LifetimePlayerInfo", "text!PoE/Widget/Season/SeasonInfo.hbt"], function(e) {
    var t = e("plugins")
      , n = e("Backbone")
      , r = e("Handlebars")
      , i = e("PoE/Handlebars/TemplateCollection")
      , s = e("./Reward");
    return e("PoE/Model/Season/PlayerInfo"),
    e("PoE/Model/Season/LifetimePlayerInfo"),
    e("text!PoE/Widget/Season/SeasonInfo.hbt"),
    n.View.extend({
        initialize: function() {
            this.playerInfo = this.options.playerInfo || null,
            this.small = !!this.options.small,
            this.garena = this.options.garena ? this.options.garena : !1,
            this.region = this.options.region ? this.options.region : !1,
            this.label = this.options.label ? this.options.label : "Season Reward Points"
        },
        initElementRefs: function() {},
        events: {},
        render: function() {
            var e = this;
            return i.load("PoE/Widget/Season/SeasonInfo.hbt").done(function(t) {
                var n = {
                    small: e.small,
                    season: e.model.toJSON(),
                    playerInfo: e.playerInfo ? e.playerInfo.toJSON() : {
                        points: 0
                    },
                    garena: e.garena,
                    region: e.region,
                    label: e.label
                }
                  , r = n.playerInfo.points
                  , i = e.model.get("rewards").last();
                e.$el.html(t(n)),
                e.$bar = e.$el.find(".currentSeasonInfo .pointsProgress .bar");
                var o = e.$el.find(".currentSeasonInfo .pointsProgress");
                e.pointsProgressWidth = o.width();
                if (i) {
                    var u = e.model.get("rewards").first().get("requiredPoints")
                      , a = e.model.get("rewards").length
                      , f = function(e) {
                        var t = 2;
                        return Math.log(e) / Math.log(2) - Math.log(u) * 8 / Math.log(t)
                    }
                      , l = i.get("requiredPoints")
                      , c = f(l)
                      , h = e.model.get("rewards");
                    h.each(function(t, n) {
                        var u = new s({
                            model: t,
                            last: t === i
                        });
                        o.append(u.$el),
                        u.render().done(function(t, n) {
                            return function() {
                                var n = f(t.model.get("requiredPoints")) / c
                                  , i = t.$el.find(".newItemContainer")
                                  , s = t.model.get("itemOffsetX")
                                  , o = t.model.get("itemOffsetY");
                                h.length > 12 && i.addClass("smaller"),
                                t.$el.css("left", e.getRewardPosition(t.model) - t.$el.width()),
                                r >= t.model.get("requiredPoints") && t.$el.addClass("achieved"),
                                s !== null && i.css("right", s),
                                o !== null && i.css("bottom", o)
                            }
                        }(u, n))
                    });
                    var p = 0
                      , d = 0
                      , v = null
                      , m = null
                      , g = Math.min(r, l);
                    for (var y = 0, b = h.length; y < b; ++y) {
                        v = h.at(y).get("requiredPoints"),
                        m = e.getRewardPosition(h.at(y));
                        if (g >= p && g <= v) {
                            var w = (m - d) * (g - p) / (v - p) + d;
                            e.$bar.css("width", w + "px");
                            break
                        }
                        p = v,
                        d = m
                    }
                }
            })
        },
        getRewardPosition: function(e) {
            var t = this.model.get("rewards")
              , n = t.indexOf(e);
            return this.pointsProgressWidth * ((n + 1) / t.length)
        }
    })
}),
define("text!PoE/Widget/Season/Ladder/Entry.hbt", [], function() {
    return '<td class="rank">{{rank}}</td>\r\n<td class="account">\r\n{{#if account.name}}\r\n    {{profileLink account}}\r\n{{else}}\r\n    {{profileLink account characterName=account.characterName garena=true}}\r\n{{/if}}\r\n</td>\r\n<td class="points">{{points}}</td>\r\n{{#if splitPoints}}\r\n  <td class="standard_points">{{standard_points}}</td>\r\n  <td class="hardcore_points">{{hardcore_points}}</td>\r\n{{/if}}\r\n'
}),
define("PoE/Widget/Season/Ladder/Entry", ["require", "plugins", "Backbone", "Handlebars", "PoE/Handlebars/TemplateCollection", "text!PoE/Widget/Season/Ladder/Entry.hbt"], function(e) {
    var t = e("plugins")
      , n = e("Backbone")
      , r = e("Handlebars")
      , i = e("PoE/Handlebars/TemplateCollection");
    return e("text!PoE/Widget/Season/Ladder/Entry.hbt"),
    n.View.extend({
        tagName: "tr",
        initialize: function() {
            this.pvp = this.options.pvp ? this.options.pvp : !1,
            this.splitPoints = this.options.splitPoints ? this.options.splitPoints : !1
        },
        render: function() {
            var e = this;
            i.load("PoE/Widget/Season/Ladder/Entry.hbt").done(function(t) {
                var n = e.model.toJSON();
                n.pvp = e.pvp,
                n.splitPoints = e.splitPoints,
                e.$el.html(t(n))
            })
        }
    })
}),
define("PoEAdmin/Model/Season/Season", ["require", "Backbone"], function(e) {
    var t = e("Backbone");
    return t.RelationalModel.extend({
        urlRoot: "/api/seasons",
        relations: []
    })
}),
define("PoEAdmin/Collection/Season/Seasons", ["require", "Backbone", "PoEAdmin/Model/Season/Season"], function(e) {
    var t = e("Backbone")
      , n = e("PoEAdmin/Model/Season/Season");
    return t.Collection.extend({
        model: n,
        url: "/api/seasons"
    })
}),
define("text!PoE/Widget/Season/Ladder/Ladder.hbt", [], function() {
    return '<h1>{{translate name}}{{#if type}} {{#ifCond type "===" "hardcore"}}{{translate "Hardcore"}}{{/ifCond}}{{#ifCond type "===" "standard"}}{{translate "Standard"}}{{/ifCond}}{{/if}} {{translate "Ladder"}}</h1>\r\n<span class="poeForm">\r\n    <select class="seasons">\r\n        {{#each seasons}}\r\n            <option value="{{#if this.configEditorId}}{{this.configEditorId}}{{else}}{{this.id}}{{/if}}"{{#ifCond this.id "===" ../name}} selected{{/ifCond}}>{{translate this.id}}</option>\r\n        {{/each}}\r\n    </select>\r\n</span>\r\n{{#if splitPoints}}\r\n<div class="ladder-types">\r\n    <a href="/seasons/pvp-ladder/season/{{seasonLink}}" class="button1{{#ifCond type "!==" "hardcore"}}{{#ifCond type "!==" "standard"}} buttonActive{{/ifCond}}{{/ifCond}}">{{translate "Overall"}}</a>\r\n    <a href="/seasons/pvp-ladder/season/{{seasonLink}}/type/standard" class="button1{{#ifCond type "===" "standard"}} buttonActive{{/ifCond}}">{{translate "Standard"}}</a>\r\n    <a href="/seasons/pvp-ladder/season/{{seasonLink}}/type/hardcore" class="button1{{#ifCond type "===" "hardcore"}} buttonActive{{/ifCond}}">{{translate "Hardcore"}}</a>\r\n</div>\r\n{{/if}}\r\n<div class="loading"></div>\r\n<table>\r\n    <thead>\r\n    <tr>\r\n        <th>{{translate "Rank"}}</th>\r\n        {{#if disableAccountNames}}\r\n        <th>{{translate "Character"}}</th>\r\n        {{else}}\r\n        <th>{{translate "Account"}}</th>\r\n        {{/if}}\r\n        {{#if splitPoints}}\r\n          <th>{{translate "Overall Points"}}</th>\r\n          <th>{{translate "Standard Points"}}\r\n          <th>{{translate "Hardcore Points"}}\r\n        {{else}}\r\n          <th>{{translate "Points"}}</th>\r\n        {{/if}}\r\n    </tr>\r\n    </thead>\r\n    <tbody class="entries"></tbody>\r\n</table>\r\n<div class="pagination"></div>\r\n'
}),
define("PoE/Widget/Season/Ladder/Ladder", ["require", "plugins", "Backbone", "Handlebars", "PoE/Handlebars/TemplateCollection", "./Entry", "PoEAdmin/Collection/Season/Seasons", "PoE/View/Widget/Pagination", "text!PoE/Widget/Season/Ladder/Ladder.hbt"], function(e) {
    var t = e("plugins")
      , n = e("Backbone")
      , r = e("Handlebars")
      , i = e("PoE/Handlebars/TemplateCollection")
      , s = e("./Entry")
      , o = e("PoEAdmin/Collection/Season/Seasons")
      , u = e("PoE/View/Widget/Pagination");
    return e("text!PoE/Widget/Season/Ladder/Ladder.hbt"),
    n.View.extend({
        initialize: function() {
            var e = this
              , n = t.Deferred();
            this.$el.addClass("seasonLadder"),
            this.pagination = new u({
                collection: this.collection
            }),
            this.garena = this.options.garena ? this.options.garena : !1,
            this.pvp = this.options.pvp ? this.options.pvp : !1,
            this.type = this.options.type ? this.options.type : !1,
            this.seasonLink = this.options.seasonLink ? this.options.seasonLink : !1,
            this.options.season && (this.collection.server_api.id = this.options.season),
            this.seasons = new o,
            this.pvp ? this.seasons.url += "?pvp=1" : this.seasons.url += "?pvp=-1",
            this.deps = n.promise(),
            this.collection.on("change", function() {
                e.render()
            }),
            this.collection.on("reset", function() {
                e.hideLoader(),
                e.addAll()
            }),
            this.pagination.on("loadStart", function() {
                e.showLoader()
            }),
            this.pagination.on("loadEnd", function() {
                e.hideLoader()
            }),
            this.seasons.fetch({
                success: function() {
                    if (!e.collection.server_api.id) {
                        var t = e.seasons.models[e.seasons.models.length - 1];
                        e.collection.server_api.id = t.id
                    }
                    n.resolve()
                }
            })
        },
        events: {
            "change select.seasons": "changeSeason"
        },
        changeSeason: function(e) {
            e.preventDefault(),
            document.location = "/seasons/" + (this.pvp ? "pvp-ladder" : "ladder") + "/season/" + this.$seasonsSelect.val()
        },
        showLoader: function() {
            this.$entries.css("opacity", .5),
            this.$loading.show(),
            this.$loading.css("top", this.$entries.offset().top - this.$el.offset().top),
            this.$loading.height(this.$entries.height())
        },
        hideLoader: function() {
            this.$entries.css("opacity", 1),
            this.$loading.hide()
        },
        addAll: function() {
            var e = this;
            e.$entries.empty(),
            this.collection.each(function(t) {
                var n = new s({
                    model: t,
                    pvp: e.pvp,
                    splitPoints: e.splitPoints()
                });
                n.render(),
                e.$entries.append(n.$el)
            })
        },
        splitPoints: function() {
            var e = this;
            return e.seasonLink == "EUPvPSeason1" || e.seasonLink == "USPvPSeason1"
        },
        render: function() {
            var e = this;
            this.deps.done(function() {
                i.load("PoE/Widget/Season/Ladder/Ladder.hbt").done(function(t) {
                    var n = {
                        name: e.collection.server_api.id,
                        seasonLink: e.seasonLink,
                        seasons: e.seasons.toJSON(),
                        garena: e.garena,
                        pvp: e.pvp,
                        type: e.type,
                        splitPoints: e.splitPoints()
                    };
                    e.collection.disableAccountNames && (n.disableAccountNames = !0),
                    e.$el.html(t(n)),
                    e.$entries = e.$el.find(".entries"),
                    e.$loading = e.$el.find(".loading"),
                    e.$loading.hide(),
                    e.$seasonsSelect = e.$el.find("select.seasons"),
                    e.addAll(),
                    e.pagination.render(),
                    e.$el.find(".pagination").replaceWith(e.pagination.el),
                    e.pagination.delegateEvents(),
                    e.delegateEvents()
                })
            })
        }
    })
}),
define("PoE/Model/League/Prize", ["Backbone", "PoE/Util/Date", "exports"], function(e, t, n) {
    var r = e.RelationalModel.extend({
        defaults: {
            claimed: !1
        }
    });
    return n.Prize = r,
    r
}),
define("PoE/Collection/League/PrizeCollection", ["Backbone", "PoE/Model/League/Prize", "exports"], function(e, t, n) {
    var r = e.Collection.extend({
        model: t
    });
    return n.PrizeCollection = r,
    r
}),
define("PoE/Model/League/Rule", ["Backbone"], function(e) {
    var t = e.RelationalModel.extend({
        initialize: function() {}
    });
    return t
}),
define("PoE/Model/League/Event", ["Backbone", "moment-tz", "PoE/Util/Date", "./Prize", "PoE/Collection/League/PrizeCollection", "PoE/Model/League/Rule", "PoE/Model/League/LadderEntry", "PoE/Collection/League/LadderEntries", "exports"], function(e, t, n, r, i, s, o, u, a) {
    var f = e.RelationalModel.extend({
        relations: [{
            type: e.HasMany,
            key: "prizes",
            relatedModel: r,
            collectionType: i,
            reverseRelation: {
                key: "event",
                type: e.HasOne
            }
        }, {
            type: e.HasMany,
            key: "rules",
            relatedModel: s
        }, {
            type: e.HasMany,
            key: "ladder",
            relatedModel: o,
            collectionType: u,
            collectionOptions: {}
        }],
        initialize: function() {
            var e = t()
              , n = this.get("startAt")
              , r = this.get("endAt")
              , i = this.get("registerAt");
            n && r && (n = t(this.get("startAt")),
            r = t(this.get("endAt")),
            r.diff(e) < 0 ? this.set("complete", !0) : (i && (i = t(i),
            i.diff(e) < 0 && this.set("register", !0)),
            n.diff(e) > 0 ? this.set("upcoming", !0) : this.set("inProgress", !0))),
            this.bind("change", this.setTimers),
            this.bind("change:complete", this.finish);
            var s = this;
            this.setTimers()
        },
        setTimers: function() {
            var e = this;
            if (!this.get("event"))
                return;
            this.get("upcoming") ? n.Countdown(t(this.get("startAt")), function() {
                e.set("upcoming", !1),
                e.set("inProgress", !0),
                e.trigger("changeContinue")
            }, function() {
                e.trigger("upcomingTick")
            }) : this.get("inProgress") ? n.Countdown(t(this.get("endAt")), function() {
                e.set("inProgress", !1),
                e.set("complete", !0),
                e.trigger("changeContinue")
            }, function() {
                e.trigger("inProgressTick")
            }) : this.get("complete") && (this.unset("register"),
            this.completeTickIntervalId && clearInterval(this.completeTickIntervalId),
            this.completeTickIntervalId = setInterval(function() {
                e.trigger("completeTick")
            }, 1e3));
            if ((this.get("upcoming") || this.get("inProgress")) && !this.get("register")) {
                var r = this.get("registerAt");
                r && n.Countdown(t(r), function() {
                    e.set("register", !0),
                    e.trigger("registrationOpen")
                })
            }
        },
        finish: function() {
            this.trigger("eventFinish")
        }
    });
    return a.Event = f,
    f
}),
define("text!PoE/Widget/League/EventInfo/EventInfo.hbt", [], function() {
    return '<div class="details{{#unless complete}} hasCountdown{{/unless}}">\n    <div class="left">\n        {{#if showTimer}}\n        <div>\n            <div>\n                <span class="startInfo">{{#if upcoming}}{{translate "Starts"}}{{/if}}{{#if inProgress}}{{translate "Started"}}{{/if}}{{#if complete}}{{translate "Started"}}{{/if}}\n                    {{#unless ch}}\n                    <span class="startTimeAgo">{{startTimeAgo}}</span>\n                    {{/unless}}\n                </span>\n                {{#unless ch}}\n                {{translate "at"}}\n                {{/unless}}\n                <span class="date">{{startDate}}</span>\n            </div>\n            <div>\n                <span class="endInfo">{{#if upcoming}}{{translate "Finishes"}}{{/if}}{{#if inProgress}}{{translate "Finishes"}}{{/if}}{{#if complete}}{{translate "Finished"}}{{/if}}\n                    {{#unless ch}}\n                    <span class="endTimeAgo">{{endTimeAgo}}</span>\n                    {{/unless}}\n                </span>\n                {{#unless ch}}\n                {{translate "at"}}\n                {{/unless}}\n                <span class="date">{{endDate}}</span>\n            </div>\n            {{#if register}}<div class="registrationOpen">{{translate "Registration open"}}</div>{{/if}}        \n        </div>\n        {{/if}}\n        \n        {{#if rules}}\n        <div class="rules">\n            <h2>{{translate "Rules"}}</h2>\n            {{#each rules}}\n            <ul class="rule">\n               <li><span class="name">{{translate name}}:</span><span class="ruleDescription">{{translate description}}</span></li>\n            </ul>\n            {{/each}}\n        </div>\n        {{/if}}\n    </div>\n    \n    {{#if showTimer}}\n        {{#if complete}}\n        <div class="finishedMessage">\n            {{translate "League has finished"}}.\n        </div>\n        {{else}}\n        <div class="countdownContainer">\n            <div class="countdownDescription">{{#if upcoming}}{{translate "Starts"}}{{/if}}{{#if inProgress}}{{translate "Finishes"}}{{/if}}</div>\n            <div class="countdown"></div>\n        </div>\n        {{/if}}\n\n    {{/if}}\n</div>\n<div class="clear"></div>\n\n\n'
}),
define("PoE/Widget/League/EventInfo/EventInfo", ["plugins", "Backbone", "PoE/Model/League/Event", "Handlebars", "moment-tz", "PoE/Environment", "PoE/Handlebars/TemplateCollection", "text!PoE/Widget/League/EventInfo/EventInfo.hbt"], function(e, t, n, r, i, s, o) {
    return t.View.extend({
        initialize: function() {
            this.model.bind("changeContinue", this.render, this),
            this.model.bind("eventFinish", this.render, this),
            this.model.bind("registrationOpen", this.render, this),
            this.startTimeAgoText = "",
            this.endTimeAgoText = ""
        },
        initElementRefs: function() {
            this.$startTimeAgo = this.$el.find(".startTimeAgo"),
            this.$endTimeAgo = this.$el.find(".endTimeAgo"),
            this.$countdown = this.$el.find(".countdown")
        },
        events: {},
        render: function() {
            var e = this;
            return this.$el.html(""),
            o.load("PoE/Widget/League/EventInfo/EventInfo.hbt").done(function(t) {
                var n = e.model.toJSON()
                  , r = e.model.get("startAt")
                  , s = e.model.get("endAt");
                r && (r = i(r),
                n.startDate = r.format("h:mm a, MMMM Do YYYY G\\MTZ"),
                n.startTimeAgo = r.fromNow()),
                s && (s = i(s),
                n.endDate = s.format("h:mm a, MMMM Do YYYY G\\MTZ"),
                n.endTimeAgo = s.fromNow()),
                n.showTimer = (e.model.get("event") || e.model.get("type") == "pvp" && !e.model.get("glickoRatings")) && r && s,
                e.$el.empty().html(t(n)),
                e.initElementRefs(),
                e.model.get("upcoming") ? e.$countdown.countdown({
                    until: r.toDate()
                }) : e.model.get("inProgress") && e.$countdown.countdown({
                    until: s.toDate()
                }),
                e.model.off("upcomingTick"),
                e.model.off("inProgressTick"),
                e.model.off("completeTick"),
                e.model.on("upcomingTick inProgressTick completeTick", function() {
                    var t = r.fromNow()
                      , n = s.fromNow();
                    t != e.startTimeAgoText && (e.$startTimeAgo.text(t),
                    e.startTimeAgoText = t),
                    n != e.endTimeAgoText && (e.$endTimeAgo.text(n),
                    e.endTimeAgoText = n)
                })
            })
        }
    })
}),
define("text!PoE/Widget/Twitch/Stream.hbt", [], function() {
    return '<h2><a href="{{stream.channel.url}}" target="_blank">{{stream.channel.status}}</a></h2>\r\n\r\n<a class="close button1" href="#" title="Close">X</a>\r\n\r\n<object type="application/x-shockwave-flash" height="400" width="590" id="live_embed_player_flash" data="http://www.twitch.tv/widgets/live_embed_player.swf?channel={{channel}}" bgcolor="#000000">\r\n    <param  name="allowFullScreen" value="true" />\r\n    <param  name="allowScriptAccess" value="always" />\r\n    <param  name="allowNetworking" value="all" />\r\n    <param  name="movie" value="http://www.twitch.tv/widgets/live_embed_player.swf" />\r\n    <param  name="flashvars" value="hostname=www.twitch.tv&channel={{stream.channel.name}}&auto_play=true&start_volume=25" />\r\n</object><iframe frameborder="0" scrolling="no" id="chat_embed" src="http://twitch.tv/chat/embed?channel={{stream.channel.name}}&amp;popout_chat=true" height="400" width="300"></iframe>'
}),
define("PoE/Widget/Twitch/Stream", ["require", "Backbone", "jquery", "PoE/Handlebars/TemplateCollection", "text!PoE/Widget/Twitch/Stream.hbt"], function(e) {
    var t = e("Backbone")
      , n = e("jquery")
      , r = e("PoE/Handlebars/TemplateCollection");
    return e("text!PoE/Widget/Twitch/Stream.hbt"),
    t.View.extend({
        loadStream: function(e) {
            return this.$el.empty().show(),
            this.stream = e,
            this.render()
        },
        className: "twitchWidget",
        events: {
            "click .close": "close"
        },
        close: function(e) {
            e.preventDefault(),
            this.$el.empty(),
            this.$el.hide()
        },
        render: function() {
            var e = n.Deferred(), t = this, i;
            if (document.location.protocol === "https:")
                return;
            return i = {
                stream: this.stream
            },
            r.load("PoE/Widget/Twitch/Stream.hbt").done(function(n) {
                t.$el.html(n(i)),
                e.resolve()
            }),
            e.promise()
        }
    })
}),
define("PoE/Widget/League/Event/Event", ["plugins", "Backbone", "PoE/Model/League/Event", "Handlebars", "PoE/Environment", "PoE/Handlebars/TemplateCollection", "PoE/Widget/League/Ladder/Ladder", "PoE/Widget/League/EventInfo/EventInfo", "PoE/Widget/Twitch/Stream"], function(e, t, n, r, i, s, o, u, a) {
    return t.View.extend({
        initialize: function() {
            var e = this;
            this.type = this.options.type ? this.options.type : "league";
            var t = this.model.get("title") ? this.model.get("title") : !1;
            this.ladder = new o({
                model: this.model,
                type: this.type,
                title: t
            }),
            this.eventInfo = new u({
                model: this.model,
                type: this.type
            }),
            this.$el.attr("class", "eventView"),
            this.twitch = new a,
            this.currentStream = null,
            this.ladder.on("twitchProfileClicked", function(t) {
                t.stream && (this.currentStream = t.stream,
                e.twitch.loadStream(t.stream))
            }),
            this.ladder.on("foundInitialLivestream", function(t) {
                if (document.location.protocol === "https:" || e.currentStream || !e.model.get("event") || !e.model.get("upcoming") && !e.model.get("inProgress"))
                    return;
                e.twitch.loadStream(t.stream),
                e.currentStream = t.stream
            })
        },
        initElementRefs: function() {},
        events: {},
        render: function() {
            this.$el.html('<div class="info"></div><div class="twitch"></div><div class="ladder"></div>'),
            this.$el.find(".info").replaceWith(this.eventInfo.el),
            this.$el.find(".ladder").replaceWith(this.ladder.el),
            this.$el.find(".twitch").replaceWith(this.twitch.$el),
            this.ladder.render(),
            this.eventInfo.render()
        }
    })
}),
define("PoE/Widget/ProfileLink/Manager", ["require", "jquery", "Backbone", "./ProfileLink"], function(e) {
    var t = e("jquery")
      , n = e("Backbone")
      , r = e("./ProfileLink")
      , i = function() {
        this.loadFromDOM = function() {
            t(".profile-link.hasTwitch:not(.manualInit)").each(function() {
                var e = new r({
                    el: this
                })
            })
        }
    };
    return i
}),
define("PoE/Shop/LogMessages", ["require"], function(e) {
    return {
        logMessages: [],
        logInfo: function(e) {
            this.logMessages.push(["I", (new Date).getTime(), e])
        },
        logWarn: function(e) {
            this.logMessages.push(["W", (new Date).getTime(), e])
        }
    }
}),
define("PoE/Shop/Helpers", ["require"], function(e) {
    return {
        formatXHRError: function(e, t, n) {
            var r = "";
            switch (t) {
            case "timeout":
                r = "Request timed out. ";
                break;
            case "abort":
                r = "Request aborted. "
            }
            return r += "Code (" + e.status + ")",
            r
        }
    }
}),
define("PoE/Shop/PaymentForm", ["require", "jquery", "./LogMessages", "PoE/Backbone/EventBus", "./Helpers"], function(e) {
    var t = e("jquery")
      , n = e("./LogMessages")
      , r = e("PoE/Backbone/EventBus")
      , i = e("./Helpers");
    return function(e, s) {
        this.formEl = t(e),
        this.formSubmitEl = this.formEl.find(".submit-button:first"),
        this.formLoadingEl = this.formEl.find(".loading:first"),
        this.formErrorsEl = this.formEl.find(".payment-errors:first"),
        this.formCardNumberEl = this.formEl.find(".card-number:first"),
        this.formCvcEl = this.formEl.find(".card-cvc:first"),
        this.formExpMonth = this.formEl.find(".card-expiry-month:first"),
        this.formExpYear = this.formEl.find(".card-expiry-year:first"),
        this.formNameEl = this.formEl.find(".name:first"),
        this.formAddressLine1El = this.formEl.find(".address_line1:first"),
        this.formAddressLine2El = this.formEl.find(".address_line2:first"),
        this.formAddressZipEl = this.formEl.find(".address_zip:first"),
        this.formAddressCountryEl = this.formEl.find(".address_country:first"),
        this.errorPrefix = "",
        s && s.errorPrefix && (this.errorPrefix = s.errorPrefix),
        this.init = function() {
            var e = this;
            this.showError = function(t) {
                e.formErrorsEl.html(e.errorPrefix + t),
                e.formLoadingEl.removeClass("loadingVisible"),
                e.formSubmitEl.removeAttr("disabled")
            }
            ,
            this.formEl.submit(function(s) {
                s.preventDefault(),
                n.logInfo("Submit payment form");
                if (!e.formAddressCountryEl.val()) {
                    e.showError("Please choose your Country"),
                    e.formAddressCountryEl.css("border", "1px solid #ff342f");
                    return
                }
                return e.formAddressCountryEl.css("border", "1px solid #B0CFE3"),
                e.formSubmitEl.attr("disabled", "disabled"),
                r.trigger("shop.purchaseStart"),
                e.formLoadingEl.height(e.formSubmitEl.height()).addClass("loadingVisible"),
                e.formErrorsEl.html(""),
                n.logInfo("Create token"),
                Stripe.createToken({
                    number: e.formCardNumberEl.val(),
                    cvc: e.formCvcEl.val(),
                    exp_month: e.formExpMonth.val(),
                    exp_year: "20" + e.formExpYear.val(),
                    name: e.formNameEl.val(),
                    address_line1: e.formAddressLine1El.val(),
                    address_line2: e.formAddressLine2El.val(),
                    address_zip: e.formAddressZipEl.val(),
                    address_country: e.formAddressCountryEl.val()
                }, function(s, o) {
                    if (o.error)
                        n.logWarn("Got error response: " + o.error.message),
                        e.showError(o.error.message),
                        r.trigger("shop.purchaseEnd");
                    else {
                        var u = o.id;
                        n.logInfo("Got token: " + u.substring(0, 10) + "... Send XHR"),
                        t.ajax({
                            type: "POST",
                            data: {
                                source: "use-card",
                                js: "1",
                                saveForLater: e.formEl.find('input[name="saveForLater"]').is(":checked") ? "1" : "0",
                                stripeToken: o.id,
                                log: n.logMessages
                            },
                            dataType: "json",
                            success: function(t) {
                                t.error ? (e.showError(t.error.message),
                                r.trigger("shop.purchaseEnd")) : window.location.href = t.redirect
                            },
                            error: function(t, n, s) {
                                e.showError(i.formatXHRError(t, n, s)),
                                r.trigger("shop.purchaseEnd")
                            }
                        })
                    }
                }),
                !1
            }),
            this.formEl.closest(".optionBox").removeClass("loading")
        }
        ,
        this.init()
    }
}),
define("PoE/Shop/PaymentFormExistingCard", ["require", "jquery", "./LogMessages", "PoE/Backbone/EventBus", "./Helpers"], function(e) {
    var t = e("jquery")
      , n = e("./LogMessages")
      , r = e("PoE/Backbone/EventBus")
      , i = e("./Helpers");
    return function(e, n) {
        this.formEl = t(e),
        this.formErrorsEl = this.formEl.find(".payment-errors:first"),
        this.formSubmitEl = this.formEl.find(".submit-button:first"),
        this.formLoadingEl = this.formEl.find(".loading:first"),
        this.cardIdEl = this.formEl.find('input[name="cid"]'),
        this.$removeButton = this.formEl.find(".remove a"),
        this.errorPrefix = "",
        n && n.errorPrefix && (this.errorPrefix = n.errorPrefix),
        this.init = function() {
            var e = this;
            this.showError = function(t) {
                this.formErrorsEl.html(e.errorPrefix + t),
                this.formLoadingEl.removeClass("loadingVisible"),
                this.formSubmitEl.removeAttr("disabled")
            }
            ,
            this.formEl.submit(function() {
                return r.trigger("shop.purchaseStart"),
                e.formSubmitEl.attr("disabled", "disabled").fadeOut("fast"),
                e.formLoadingEl.height(e.formSubmitEl.height()).addClass("loadingVisible"),
                t.ajax({
                    type: "POST",
                    data: {
                        source: "use-existing-card",
                        js: "1",
                        cid: e.cardIdEl.val()
                    },
                    dataType: "json",
                    success: function(t) {
                        t.error ? (e.showError(t.error.message),
                        r.trigger("shop.purchaseEnd")) : window.location.href = t.redirect
                    },
                    error: function(t, n, s) {
                        e.showError(i.formatXHRError(t, n, s)),
                        r.trigger("shop.purchaseEnd")
                    }
                }),
                !1
            }),
            this.$removeButton.on("click", function(n) {
                n.preventDefault();
                if (!confirm("Remove card?"))
                    return !1;
                r.trigger("shop.purchaseStart");
                var i = e.$removeButton.data("cardid")
                  , s = e.$removeButton.closest(".shopExistingOptionContainer");
                return this.formEl = s.closest("form"),
                e.$removeButton.remove(),
                t.ajax({
                    url: "/shop/remove-card",
                    type: "POST",
                    data: {
                        cid: i
                    },
                    dataType: "json",
                    success: function(e) {
                        s.slideUp("fast", function() {
                            t(this).remove()
                        }),
                        r.trigger("shop.purchaseEnd")
                    },
                    failure: function(e) {
                        r.trigger("shop.purchaseEnd"),
                        alert("Failed to remove card")
                    }
                }),
                !1
            }),
            this.formEl.closest(".shopExistingOptionContainer").removeClass("loading")
        }
        ,
        this.init()
    }
}),
define("PoE/Shop/XsollaPaymentWidget", ["plugins", "PoE/Helpers"], function(e, t) {
    return {
        packId: !1,
        upgrade: !1,
        xps: !1,
        init: function(n, r, i, s) {
            this.packId = n,
            this.upgrade = r,
            this.xps = i,
            this.sandbox = s;
            var o = this;
            e(".xsolla-purchase").click(function(n) {
                var r = {
                    packageID: o.packId
                }
                  , i = o.upgrade;
                i.length > 0 && (r.upgrade = i),
                e.ajax({
                    url: "/shop/xsolla-purchase",
                    data: JSON.stringify(r),
                    contentType: "application/json",
                    method: "POST",
                    success: function(e) {
                        e.token ? (token = e.token,
                        o.xps.init({
                            access_token: token,
                            sandbox: o.sandbox
                        }),
                        o.xps.on(o.xps.eventTypes.STATUS_DONE, function(e, t) {
                            t.paymentInfo.invoice && (window.location.href = "/shop/purchase-complete?completeType=xsolla&txn=" + t.paymentInfo.invoice)
                        }),
                        o.xps.open()) : t.translate("Could not initiate Xsolla payment, please try again later or contact support@grindinggear.com")
                    },
                    fail: function(e) {
                        t.translate("Failed to create Xsolla transaction, please try again later or contact support@grindinggear.com")
                    }
                })
            })
        }
    }
}),
define("PoE/Collection/League/EventsCollection", ["jquery", "Backbone", "PoE/Model/League/Event", "moment-tz"], function(e, t, n, r) {
    return t.Collection.extend({
        model: n,
        sortByStartDate: function() {
            this.comparator = function(e, t) {
                return e.get("startAt") && t.get("startAt") ? r(e.get("startAt")).diff(r(t.get("startAt"))) : 0
            }
            ,
            this.sort()
        }
    })
}),
define("text!PoE/Widget/League/EventCalendar/Event.hbt", [], function() {
    return '{{#if url}}<a href="{{url}}">{{id}}</a>{{else}}{{id}}{{/if}}'
}),
define("PoE/Widget/League/EventCalendar/Event", ["require", "Backbone", "moment-tz", "Underscore", "PoE/Handlebars/TemplateCollection", "text!PoE/Widget/League/EventCalendar/Event.hbt"], function(e) {
    var t = e("Backbone")
      , n = e("moment-tz")
      , r = e("Underscore")
      , i = e("PoE/Handlebars/TemplateCollection");
    return e("text!PoE/Widget/League/EventCalendar/Event.hbt"),
    t.View.extend({
        className: "event",
        initialize: function() {},
        render: function() {
            var e = this
              , t = this.model.toJSON();
            return t.url == "" && delete t.url,
            t.inProgress ? this.$el.addClass("inProgress") : t.complete && this.$el.addClass("complete"),
            i.load("PoE/Widget/League/EventCalendar/Event.hbt").done(function(n) {
                e.$el.html(n(t))
            })
        }
    })
}),
define("PoE/Widget/League/EventCalendar/Day", ["require", "Backbone", "moment-tz", "Underscore", "./Event"], function(e) {
    var t = e("Backbone")
      , n = e("moment-tz")
      , r = e("Underscore")
      , i = e("./Event");
    return t.View.extend({
        className: "day",
        initialize: function() {
            this.periods = this.options.periods,
            this.start = this.options.start,
            this.end = this.options.end
        },
        render: function() {
            var e = []
              , t = this;
            this.$el.html('<div class="label"></div><div class="periods"></div>'),
            $periods = this.$el.find(".periods"),
            $label = this.$el.find(".label"),
            this.start.format("D") == 1 ? ($label.html(this.start.format("MMM D")),
            $label.addClass("first")) : $label.html(this.start.format("D")),
            this.periodToEl = {};
            for (var n = 0, r = this.periods.length; n < r; ++n) {
                var s = $('<div class="period"></div>');
                $periods.append(s),
                s.addClass("period" + n),
                this.periodToEl[this.periods[n]] = s
            }
            return this.collection.each(function(n) {
                var r = new i({
                    model: n
                });
                e.push(r.render()),
                t.periodToEl[t.getEventMinutesOffset(n)].append(r.$el)
            }),
            $.when.apply(null, e)
        },
        getEventMinutesOffset: function(e) {
            var t = n(e.get("startAt"));
            return t.hours() * 60 + t.minutes()
        }
    })
}),
define("PoE/Widget/League/EventCalendar/Week", ["require", "Backbone", "moment-tz", "Underscore", "PoE/Collection/League/EventsCollection", "./Day", "PoE/Helpers"], function(e) {
    var t = e("Backbone")
      , n = e("moment-tz")
      , r = e("Underscore")
      , i = e("PoE/Collection/League/EventsCollection")
      , s = e("./Day")
      , o = e("PoE/Helpers");
    return t.View.extend({
        className: "week",
        initialize: function() {
            this.start = this.options.start,
            this.end = this.options.end,
            this.realmRegion = this.options.realmRegion
        },
        render: function() {
            var e = []
              , t = this;
            this.$el.html('<div class="periodsInfo"><div class="label"></div><div class="periods"></div></div>');
            var n = this.start.format("MMM");
            this.$el.find(".label").html(o.translate(n));
            var r = this.collectMinutes(this.collection);
            $periods = this.$el.find(".periodsInfo .periods");
            for (var i = 0, u = r.length; i < u; ++i) {
                var a = this.start.clone().add("minutes", r[i])
                  , f = $('<div class="period"></div>');
                f.addClass("period" + i);
                var l = "h:mm A";
                this.realmRegion == "ru_RU" && (l = "HH:mm"),
                f.html(a.format(l)),
                $periods.append(f)
            }
            var c = this.start.clone()
              , h = c.clone().add("days", 1);
            for (var i = 0; i < 7; ++i) {
                var p = new s({
                    start: c,
                    end: h,
                    collection: this.retrieveEventsUntilDate(this.collection, h),
                    periods: r
                });
                e.push(p.render()),
                this.$el.append(p.$el),
                c = h,
                h = h.clone(),
                h.add("days", 1)
            }
            $.when.apply(null, e).done(function() {
                for (var e = 0, n = r.length; e < n; ++e) {
                    var i = 0
                      , s = t.$el.find(".period" + e);
                    s.each(function() {
                        i = Math.max($(this).height(), i)
                    }),
                    s.height(i)
                }
            })
        },
        getEventMinutesOffset: function(e) {
            var t = n(e.get("startAt"));
            return t.hours() * 60 + t.minutes()
        },
        collectMinutes: function(e) {
            var t = []
              , n = this;
            return e.each(function(e) {
                t.push(n.getEventMinutesOffset(e))
            }),
            t.sort(function(e, t) {
                return e - t
            }),
            r.uniq(t, !0)
        },
        retrieveEventsUntilDate: function(e, t) {
            var r = new i;
            for (var s = 0, o = e.length; s < o; ++s) {
                var u = e.at(0)
                  , a = n(u.get("startAt"));
                if (a.diff(t) >= 0)
                    break;
                r.push(e.shift())
            }
            return r
        }
    })
}),
define("PoE/Widget/League/EventCalendar/EventCalendar", ["require", "Backbone", "moment-tz", "Underscore", "PoE/Collection/League/EventsCollection", "./Week", "PoE/Helpers"], function(e) {
    var t = e("Backbone")
      , n = e("moment-tz")
      , r = e("Underscore")
      , i = e("PoE/Collection/League/EventsCollection")
      , s = e("./Week")
      , o = e("PoE/Helpers");
    return t.View.extend({
        initialize: function() {
            var e = this
              , t = new i;
            for (var n = 0, r = e.collection.length; n < r; ++n) {
                var s = e.collection.at(n);
                s.get("startAt") && t.push(s)
            }
            this.sponsors = this.options.sponsors ? this.options.sponsors : !1,
            this.prizesLink = this.options.prizesLink ? this.options.prizesLink : !1,
            this.collection = t,
            this.collection.sortByStartDate(),
            this.startDay = 1,
            this.$el.addClass("eventCalendar"),
            this.realmRegion = this.options.realmRegion ? this.options.realmRegion : "ggg",
            e.title = e.options.title ? e.options.title : o.translate("Events Schedule"),
            e.note = e.options.note ? e.options.note : o.translate("Please note that the times on this schedule are shown in your local timezone.")
        },
        render: function() {
            var e = this
              , t = "<h1> " + e.title + "</h1>";
            if (this.collection.isEmpty()) {
                t += '<p class="description">' + o.translate("There are no current events.") + "</p>",
                this.$el.html(t);
                return
            }
            t += '<p class="description">' + e.note + "</p>";
            if (this.sponsors && this.sponsors.length > 0) {
                t += '<div class="pvp-season-intro">',
                t += '<img src="/image/season/pvp/ProvidedBy.jpg">',
                t += '<div class="sponsors">';
                for (var r in this.sponsors) {
                    var i = this.sponsors[r];
                    t += '<a href="' + i.link + '" target="_blank"><img src="' + i.src + '" /></a>'
                }
                t += "</div>",
                t += "</div>"
            }
            this.prizesLink && (t += '<div class="prizesLink"><a href="' + this.prizesLink.link + '"><img src="' + this.prizesLink.src + '" /></a></div>'),
            t += '<div class="entries"></div>',
            t += '<div class="debug"></div>',
            this.$el.html(t),
            $entries = this.$el.find(".entries"),
            $debug = this.$el.find(".debug");
            var u = this.collection.first()
              , a = n(u.get("startAt"))
              , f = a.clone().day(0).hours(0).minutes(0).seconds(0).milliseconds(0)
              , l = n(this.collection.last().get("startAt"));
            f.add("days", this.startDay),
            a.diff(f) < 0 && f.add("weeks", -1);
            var c = f.clone();
            c.add("weeks", 1),
            this.collection.length && $entries.append('<div class="header"><div class="col"></div><div class="col">' + o.translate("Monday") + '</div><div class="col">' + o.translate("Tuesday") + '</div><div class="col">' + o.translate("Wednesday") + '</div><div class="col">' + o.translate("Thursday") + '</div><div class="col">' + o.translate("Friday") + '</div><div class="col">' + o.translate("Saturday") + '</div><div class="col">' + o.translate("Sunday") + "</div></div>");
            while (this.collection.length) {
                var h = this.retrieveEventsUntilDate(this.collection, c)
                  , p = new s({
                    collection: h,
                    start: f.clone(),
                    end: c.clone(),
                    realmRegion: this.realmRegion
                });
                $entries.append(p.$el),
                p.render(),
                f = c,
                c = c.clone(),
                c.add("weeks", 1)
            }
            this.collection.each(function(e) {
                var t = n(e.get("startAt"));
                $debug.append("<div>" + e.get("id") + " " + t.format() + "</div>")
            })
        },
        retrieveEventsUntilDate: function(e, t) {
            var r = new i;
            for (var s = 0, o = e.length; s < o; ++s) {
                var u = e.at(0)
                  , a = n(u.get("startAt"));
                if (!a || a.diff(t) >= 0)
                    break;
                r.push(e.shift())
            }
            return r
        }
    })
}),
define("PoE/Collection/League/Signature", ["jquery", "Backbone", "PoE/Model/League/LadderEntry", "PoE/Backbone/Paginator", "./LadderEntries"], function(e, t, n, r, i) {
    return i.extend({
        paginator_core: {
            url: "/api/signature-ladders",
            dataType: "json"
        },
        server_api: {
            offset: function() {
                return (this.currentPage - 1) * this.perPage
            },
            limit: function() {
                return this.perPage
            },
            id: function() {
                return this.id
            },
            characterClass: function() {
                return this.characterClass
            }
        },
        perPageOptions: [],
        parse: function(e) {
            return e.limit && (this.perPage = parseInt(e.limit, 10)),
            e.id && (this.id = e.id),
            e.characterClass && (this.characterClass = e.characterClass),
            this.totalRecords = e.total,
            this.totalPages = Math.ceil(e.total / this.perPage),
            e.entries
        }
    })
}),
define("text!PoE/View/Season/ViewSignatureRaces.hbt", [], function() {
    return '<div class="seasons-list poeForm">\r\n    <select name="seasons">\r\n        {{#each seasons}}\r\n            {{#unless pvp}}\r\n            <option value="{{numericId}}">{{translate id}}</option>\r\n            {{/unless}}\r\n        {{/each}}\r\n    </select>\r\n</div>\r\n<div class="races">\r\n</div>'
}),
define("PoE/View/Season/ViewSignatureRaces", ["require", "plugins", "Backbone", "PoE/Handlebars/TemplateCollection", "PoEAdmin/Collection/Season/Seasons", "PoE/Collection/League/Signature", "PoE/Widget/League/Ladder/Ladder", "text!PoE/View/Season/ViewSignatureRaces.hbt"], function(e) {
    var t = e("plugins")
      , n = e("Backbone")
      , r = e("PoE/Handlebars/TemplateCollection")
      , i = e("PoEAdmin/Collection/Season/Seasons")
      , s = e("PoE/Collection/League/Signature")
      , o = e("PoE/Widget/League/Ladder/Ladder");
    return e("text!PoE/View/Season/ViewSignatureRaces.hbt"),
    n.View.extend({
        initialize: function() {
            var e = this
              , n = t.Deferred();
            this.selectedSeason = this.options.season ? this.options.season : !1,
            this.$el.addClass("adminTheme1"),
            this.classes = this.options.classes,
            this.races = {},
            this.chosenSeason = !1,
            this.garena = this.options.garena ? this.options.garena : !1,
            this.seasons = new i,
            this.deps = n.promise(),
            this.seasons.fetch({
                success: function() {
                    n.resolve()
                }
            })
        },
        events: {
            'change select[name="seasons"]': "changeSeason"
        },
        changeSeason: function(e) {
            var n = this;
            if (n.$seasons.val()) {
                n.$races.html("");
                for (var r in n.classes) {
                    var i = new s;
                    i.id = n.$seasons.val(),
                    i.characterClass = n.classes[r],
                    i.characterClassName = r,
                    i.fetch({
                        success: function(e) {
                            var r = new o({
                                collection: e,
                                title: e.characterClassName
                            });
                            r.render().done(function() {
                                r.$el.addClass("layoutBox1").addClass("layoutBoxFull").addClass("defaultTheme"),
                                r.$el.find("h2").each(function() {
                                    t(this).replaceWith("<h1>" + t(this).html() + "</h1>")
                                }),
                                r.$el.find("h1").addClass("topBar").addClass("first").addClass("last").addClass("layoutBoxTitle")
                            }),
                            n.$races.append(r.el)
                        }
                    })
                }
            }
        },
        render: function() {
            var e = this;
            this.deps.done(function() {
                r.load("PoE/View/Season/ViewSignatureRaces.hbt").done(function(t) {
                    e.seasons.models.reverse();
                    var n = [];
                    for (var r in e.seasons.models)
                        n.push(e.seasons.models[r].toJSON());
                    var i = {
                        seasons: n,
                        garena: e.garena
                    };
                    e.$el.html(t(i)),
                    e.delegateEvents(),
                    e.$seasons = e.$el.find('select[name="seasons"]'),
                    e.$races = e.$el.find(".races"),
                    e.selectedSeason && e.$seasons.val(e.selectedSeason),
                    e.changeSeason()
                })
            })
        }
    })
}),
define("text!PoE/View/Season/PlayerHistory.hbt", [], function() {
    return '<div class="row league">\r\n    <div class="name cell info">{{leagueName}}</div>\r\n    <div class="points cell info">{{points}}</div>\r\n    <div class="rank cell info">\r\n        {{rank}}\r\n        {{#if pins}}\r\n        <a class="showcase-pin button add" data-type="{{#if pvp}}pvp_rank{{else}}event_rank{{/if}}" data-subtype="{{leagueName}}"></a>\r\n        {{/if}}\r\n    </div>\r\n</div>\r\n<div class="row trophy even">\r\n    {{#each trophies}}\r\n    <div class="name cell info">&gt; {{description}}</div>\r\n    <div class="points cell info">{{points}}</div>\r\n    {{/each}}\r\n</div>'
}),
define("PoE/View/Season/PlayerHistory", ["require", "plugins", "Backbone", "PoE/Handlebars/TemplateCollection", "PoE/Helpers", "text!PoE/View/Season/PlayerHistory.hbt"], function(e) {
    var t = e("plugins")
      , n = e("Backbone")
      , r = e("PoE/Handlebars/TemplateCollection")
      , i = e("PoE/Helpers");
    return e("text!PoE/View/Season/PlayerHistory.hbt"),
    n.View.extend({
        initialize: function() {},
        events: {
            "click .showcase-pin.add": "pin"
        },
        pin: function(e) {
            var n = this
              , r = t(e.target);
            t.ajax({
                url: BASEURL + "/api/account/showcase-pins",
                dataType: "json",
                data: r.data(),
                type: "POST",
                success: function(e) {
                    t(".showcase-message").length ? t(".showcase-message").html(i.translate("Added pin")).animate({
                        opacity: 1
                    }, 800, function() {
                        setTimeout(function() {
                            t(".showcase-message").animate({
                                opacity: 0
                            }, 1500)
                        }, 2e3)
                    }) : alert("Added pin")
                },
                error: function(e) {
                    alert(i.translate("There was an error adding this pin"))
                }
            })
        },
        render: function() {
            var e = this;
            return r.load("PoE/View/Season/PlayerHistory.hbt").done(function(t) {
                var n = e.model.toJSON();
                n.rank = n.rank ? n.rank : "-",
                n.pins = e.options.pins ? !0 : !1,
                e.$el.html(t(n))
            })
        }
    })
}),
define("PoE/Model/Season/Reward", ["Backbone", "PoE/Backbone/Model/Item/Item"], function(e, t, n) {
    return e.RelationalModel.extend({
        relations: [{
            type: e.HasOne,
            key: "item",
            relatedModel: n
        }]
    })
}),
define("PoE/Model/Season/Season", ["Backbone", "./Reward"], function(e, t) {
    return e.RelationalModel.extend({
        relations: [{
            type: e.HasMany,
            key: "rewards",
            relatedModel: t
        }]
    })
}),
define("PoE/Model/Season/PlayerHistory", ["require", "Backbone", "./Season"], function(e) {
    var t = e("Backbone")
      , n = e("./Season");
    return t.RelationalModel.extend({
        relations: [{
            type: t.HasOne,
            key: "season",
            relatedModel: n
        }]
    })
}),
define("PoE/Collection/Season/PlayerHistory", ["require", "Backbone", "PoE/Model/Season/PlayerHistory", "PoE/Backbone/Paginator"], function(e) {
    var t = e("Backbone")
      , n = e("PoE/Model/Season/PlayerHistory")
      , r = e("PoE/Backbone/Paginator");
    return r.extend({
        model: n,
        paginator_core: {
            url: "/api/season-player-history",
            dataType: "json"
        },
        paginator_ui: {
            firstPage: 1,
            currentPage: 1,
            perPage: 5
        },
        server_api: {
            page: function() {
                return this.currentPage
            },
            perPage: function() {
                return this.perPage
            },
            seasonId: "",
            id: ""
        },
        perPageOptions: [5, 10, 20],
        parse: function(e) {
            return this.totalRecords = e.total,
            this.totalPages = Math.ceil(this.totalRecords / this.perPage),
            e.entries
        }
    })
}),
define("text!PoE/View/Season/PlayerHistoryViewer.hbt", [], function() {
    return '<div class="loading-inline">{{translate "Loading"}}...</div>\r\n\r\n{{#if showSeasonSelect}}\r\n<select name="seasons">\r\n    <option value=""></option>\r\n    {{#each seasons}}\r\n    <option value="{{id}}">{{translate id}}</option>\r\n    {{/each}}\r\n</select>\r\n<span class="loading-inline"></span>\r\n{{/if}}\r\n\r\n<div class="historyContainer">\r\n    <div class="history">\r\n        <div class="row heading">\r\n            <div class="name cell">{{translate "League"}}</div>\r\n            <div class="points cell">{{translate "Points"}}</div>\r\n            <div class="rank cell">{{translate "Rank"}}</div>\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n<div class="pagination"></div>'
}),
define("PoE/View/Season/PlayerHistoryViewer", ["require", "plugins", "Backbone", "PoE/Handlebars/TemplateCollection", "PoE/View/Season/PlayerHistory", "PoEAdmin/Collection/Season/Seasons", "PoE/Collection/Season/PlayerHistory", "PoE/View/Widget/Pagination", "PoE/Helpers", "text!PoE/View/Season/PlayerHistoryViewer.hbt"], function(e) {
    var t = e("plugins")
      , n = e("Backbone")
      , r = e("PoE/Handlebars/TemplateCollection")
      , i = e("PoE/View/Season/PlayerHistory")
      , s = e("PoEAdmin/Collection/Season/Seasons")
      , o = e("PoE/Collection/Season/PlayerHistory")
      , u = e("PoE/View/Widget/Pagination")
      , a = e("PoE/Helpers");
    return e("text!PoE/View/Season/PlayerHistoryViewer.hbt"),
    n.View.extend({
        initialize: function() {
            var e = this
              , n = t.Deferred();
            this.$el.addClass("playerHistoryViewer").addClass("table"),
            this.history = new o;
            var r = this.model.has("name") ? this.model.get("name") : this.model.get("id");
            this.history.server_api.id = r,
            this.pagination = new u({
                collection: this.history
            }),
            this.pins = this.options.pins ? !0 : !1,
            this.seasons = new s,
            this.deps = n.promise(),
            this.seasons.fetch({
                success: function() {
                    n.resolve()
                }
            }),
            this.history.on("change", function() {
                e.updateHistory()
            }),
            this.history.on("reset", function() {
                e.updateHistory(),
                e.$el.find(".loading-inline").hide()
            })
        },
        events: {
            'change select[name="seasons"]': "changeSeason"
        },
        changeSeason: function(e) {
            var t = this;
            t.$loader.show(),
            this.history.server_api.seasonId = this.seasons.get(t.options.seasonName ? t.options.seasonName : this.$seasons.val()).get("id"),
            this.history.fetch({
                success: function() {
                    t.updateHistory(),
                    t.$loader.hide()
                },
                error: function() {
                    alert(a.translate("Failed to load history")),
                    t.$loader.hide()
                }
            })
        },
        updateHistory: function() {
            var e = this;
            this.$history.children("div:not(:first)").remove(),
            this.history.each(function(t) {
                var n = new i({
                    model: t,
                    pins: e.pins
                });
                n.render(),
                e.$history.append(n.$el)
            })
        },
        render: function() {
            var e = this
              , n = t.Deferred();
            this.rendered = n.promise(),
            this.deps.done(function() {
                r.load("PoE/View/Season/PlayerHistoryViewer.hbt").done(function(t) {
                    var r = {
                        seasons: e.seasons.toJSON(),
                        showSeasonSelect: !e.options.seasonName
                    };
                    e.$el.html(t(r)),
                    e.delegateEvents(),
                    e.$el.find(".pagination").replaceWith(e.pagination.el),
                    e.$seasons = e.$el.find('select[name="seasons"]'),
                    e.$loader = e.$el.find(".loading-inline").hide(),
                    e.$history = e.$el.find(".history"),
                    e.pagination.render(),
                    e.pagination.delegateEvents(),
                    n.resolve(),
                    e.options.seasonName && e.changeSeason()
                })
            })
        }
    })
}),
define("PoE/Model/Account/ShowcasePin", ["Backbone"], function(e) {
    return e.RelationalModel.extend({
        relations: []
    })
}),
define("PoE/Collection/Account/ShowcasePins", ["jquery", "Backbone", "PoE/Model/Account/ShowcasePin", "PoE/Backbone/Paginator"], function(e, t, n, r) {
    return r.extend({
        model: n,
        paginator_core: {
            url: "/api/account/showcase-pins",
            dataType: "json"
        },
        paginator_ui: {
            firstPage: 1,
            currentPage: 1,
            perPage: 10,
            totalPages: 10
        },
        server_api: {
            offset: function() {
                return (this.currentPage - 1) * this.perPage
            },
            limit: function() {
                return this.perPage
            },
            accountID: ""
        },
        parse: function(e) {
            return e.limit && (this.perPage = parseInt(e.limit, 10)),
            e.seasonId && (this.server_api.id = e.seasonId),
            this.totalRecords = e.total,
            this.totalPages = Math.ceil(e.total / this.perPage),
            e.entries
        }
    })
}),
define("text!PoE/View/Profile/ShowcasePins.hbt", [], function() {
    return '{{#if noResult}}\r\n{{#if ../curAccountProfile}}\r\n<div class="showcase-item">\r\n    <p><em>{{translate "Your showcase is empty. Click a {PIN} to pin a notable item here." PIN="<img src=\'/image/profile/pin.png\' />"}}</em></p>\r\n</div>\r\n{{/if}}\r\n{{else}}\r\n\r\n{{#each showcasePins}}\r\n<div class="showcase-item">\r\n    <img class="icon" src="{{icon}}" />\r\n\r\n    <h2>{{label}}</h2>\r\n\r\n    {{#if ../curAccountProfile}}\r\n    <div class="showcase-manage">\r\n        <a class="showcase-pin button delete" data-id="{{id}}"></a>\r\n        <a class="showcase-move button up" data-id="{{id}}" data-direction="up"></a>\r\n        <a class="showcase-move button down" data-id="{{id}}" data-direction="down"></a>\r\n    </div>\r\n    {{/if}}\r\n</div>\r\n{{/each}}\r\n\r\n{{/if}}'
}),
define("PoE/View/Profile/ShowcasePins", ["require", "plugins", "Backbone", "PoE/Handlebars/TemplateCollection", "PoE/Collection/Account/ShowcasePins", "PoE/Helpers", "text!PoE/View/Profile/ShowcasePins.hbt"], function(e) {
    var t = e("plugins")
      , n = e("Backbone")
      , r = e("PoE/Handlebars/TemplateCollection")
      , i = e("PoE/Collection/Account/ShowcasePins")
      , s = e("PoE/Helpers");
    return e("text!PoE/View/Profile/ShowcasePins.hbt"),
    n.View.extend({
        initialize: function() {
            var e = this
              , n = t.Deferred();
            this.messageTimer = !1,
            this.showcasepins = new i,
            this.deps = n.promise(),
            this.showcasepins.server_api.accountID = this.options.accountID,
            this.showcasepins.fetch({
                success: function() {
                    n.resolve()
                }
            })
        },
        events: {
            "click .showcase-pin.button.delete": "unpin",
            "click .showcase-move.button": "move"
        },
        unpin: function(e) {
            var n = this
              , r = t(e.target);
            if (r.hasClass("disabled"))
                return;
            t.ajax({
                url: BASEURL + "/api/account/showcase-pins/" + r.data("id"),
                dataType: "json",
                data: r.data(),
                type: "DELETE",
                success: function(e) {
                    t(".showcase-message").html(s.translate("Deleted pin")).animate({
                        opacity: 1
                    }, 600, function() {
                        clearTimeout(n.messageTimer),
                        n.messageTimer = setTimeout(function() {
                            t(".showcase-message").stop().animate({
                                opacity: 0
                            }, 1300)
                        }, 2e3)
                    }),
                    n.refresh()
                },
                error: function(e) {
                    alert(s.translate("There was an error deleting this pin"))
                }
            })
        },
        move: function(e) {
            var n = this
              , r = t(e.target);
            if (r.hasClass("disabled"))
                return;
            t.ajax({
                url: BASEURL + "/api/account/showcase-pins/" + r.data("id"),
                dataType: "json",
                data: JSON.stringify(r.data()),
                contentType: "application/json",
                type: "PUT",
                success: function(e) {
                    t(".showcase-message").html(s.translate("Moved pin")).animate({
                        opacity: 1
                    }, 800, function() {
                        clearTimeout(n.messageTimer),
                        n.messageTimer = setTimeout(function() {
                            t(".showcase-message").stop().animate({
                                opacity: 0
                            }, 1500)
                        }, 2e3)
                    }),
                    n.refresh()
                },
                error: function(e) {
                    alert(s.translate("There was an error moving this pin"))
                }
            })
        },
        refresh: function() {
            var e = this;
            e.showcasepins.fetch({
                success: function() {
                    e.render()
                }
            })
        },
        render: function() {
            var e = this;
            this.deps.done(function() {
                r.load("PoE/View/Profile/ShowcasePins.hbt").done(function(t) {
                    var n = {
                        showcasePins: e.showcasepins.toJSON(),
                        curAccountProfile: e.options.curAccountProfile,
                        noResult: e.showcasepins.totalRecords === 0
                    };
                    e.$el.html(t(n)),
                    e.$el.find(".showcase-move.up:first, .showcase-move.down:last").addClass("disabled")
                })
            })
        }
    })
}),
define("PoE/Form/Account/SignUpBase", ["require", "PoE/Util/Date", "plugins"], function(e) {
    var t = e("PoE/Util/Date")
      , n = e("plugins");
    return function(e) {
        var r = e instanceof n ? e : n(e)
          , i = r.find('input[name="submit"]')
          , s = t.getTimezone();
        r.find('input[name="dst"]').val(s.dst ? 1 : 0),
        r.find('input[name="tzOffset"]').val(s.offset),
        r.submit(function() {
            return i.attr("disabled", !0).val("Loading..."),
            !0
        })
    }
}),
define("PoE/Form/CaptchaRow", ["require", "plugins"], function(e) {
    var t = e("plugins");
    return function(e) {
        var n = e.find(".row.captcha")
          , r = n.find("img")
          , i = n.find('input[name="captcha[id]"]')
          , s = t('<div class="refresh" title="Refresh captcha"></div>');
        n.find(".element").append(s),
        s.click(function() {
            t.ajax({
                url: "/default/account/refresh-captcha",
                dataType: "json",
                success: function(e) {
                    e != 0 ? (r.hide().attr("src", "/gen/image/captcha/" + e + ".png"),
                    i.attr("value", e)) : (t('input[name="captcha[input]"]').parent().find(".errors").length == 0 && t('input[name="captcha[input]"]').parent().find(".refresh").after('<ul class="errors"></ul>'),
                    t('input[name="captcha[input]"]').parent().find(".errors").html(""),
                    t('input[name="captcha[input]"]').parent().find(".errors").append("<li>Too many captcha refresh requests, please wait</li>")),
                    r.fadeIn()
                }
            })
        })
    }
}),
define("PoE/Form/Account/SignUp", ["require", "plugins", "PoE/Form/Account/SignUpBase", "PoE/Form/CaptchaRow"], function(e) {
    var t = e("plugins")
      , n = e("PoE/Form/Account/SignUpBase")
      , r = e("PoE/Form/CaptchaRow");
    return function() {
        var e = t("#sign-up-container .layoutBoxContent")
          , i = t("#create_account")
          , s = t("#terms_of_use");
        n(i),
        r(i),
        t(function() {
            s.height(e.height())
        })
    }
}),
define("PoE/Form/Account/SteamSignUp", ["require", "plugins", "PoE/Form/Account/SignUpBase"], function(e) {
    var t = e("plugins")
      , n = e("PoE/Form/Account/SignUpBase");
    return function() {
        var e = t("#create_account")
          , r = t("#sign-up-container .layoutBoxContent")
          , i = t("#terms_of_use");
        n(e),
        t(function() {
            i.height(r.height())
        })
    }
}),
define("PoE/Inventory/LinkedStashTab", ["plugins", "Backbone", "PoE/Handlebars/TemplateCollection", "./StashPanel"], function(e, t, n, r) {}),
define("PoE/Inventory/LinkedStashRenderer", ["plugins", "Backbone", "./LinkedStashTab"], function(e, t, n) {
    return !1
}),
define("default/gallery/gallery", ["require", "plugins", "PoE/Helpers"], function(e) {
    var t = e("plugins")
      , n = n || {}
      , r = e("PoE/Helpers");
    return n.Gallery = function(e, i, s, o) {
        this.init = function() {
            var r = this;
            this.els = {
                content: t(e),
                breadcrumb: t(i)
            },
            this.els.pagination = t(s),
            this.els.botControls = this.els.pagination.parent(),
            this.state = {
                current: null,
                states: {
                    browseGalleries: new n.Gallery.BrowseGalleriesState(this),
                    viewGallery: new n.Gallery.ViewGalleryState(this),
                    previewImage: new n.Gallery.PreviewImageState(this),
                    loading: new n.Gallery.LoadingState(this)
                }
            },
            this.options = {
                enableHistory: !0
            },
            this.events = {
                avatarChosen: function() {}
            },
            this.isHistorySupported() && (window.onpopstate = function(e) {
                if (e.state === null)
                    return;
                r.loadStateFromUrl()
            }
            ),
            this.setOpts(o)
        }
        ,
        this.setOpts = function(e) {
            if (!e)
                return;
            e.enableHistory !== undefined && (this.options.enableHistory = e.enableHistory),
            e.events && e.events.avatarChosen && (this.events.avatarChosen = e.events.avatarChosen)
        }
        ,
        this.loadStateFromUrl = function() {
            var e = this
              , t = window.location.href.split("/")
              , n = t[t.length - 1]
              , r = t[t.length - 2]
              , i = -1;
            for (var s = 0, o = t.length; s < o; ++s)
                if (t[s] == "gallery") {
                    i = s;
                    break
                }
            if (i == -1)
                return;
            t = t.slice(i + 1);
            for (var u in this.state.states)
                if (this.state.states[u].loadStateFromUrlParts(t))
                    return
        }
        ,
        this.enableBotControls = function(e) {
            e ? this.els.botControls.show() : this.els.botControls.hide()
        }
        ,
        this.setStartState = function(e, t) {
            this.state.current = this.state.states[e],
            this.state.current.setState(t),
            this.pushHistoryState()
        }
        ,
        this.currentState = function() {
            return this.state.current
        }
        ,
        this.getState = function(e) {
            var t = this.state.states[e];
            return t === undefined ? null : t
        }
        ,
        this.showState = function(e) {
            var t = this.state.states[e];
            if (t === undefined)
                return;
            this.state.current = t,
            t.show()
        }
        ,
        this.browseGalleries = function(e) {
            var t = this;
            return this.state.states.browseGalleries.load(function() {
                t.showState("browseGalleries")
            }),
            !1
        }
        ,
        this.viewGallery = function(e) {
            var t = this;
            return this.state.states.viewGallery.setGalleryId(e),
            this.state.states.viewGallery.load(function() {
                t.showState("viewGallery")
            }),
            !1
        }
        ,
        this.previewImage = function(e) {
            var t = this;
            return this.state.states.previewImage.setImageId(e),
            this.state.states.previewImage.load(function() {
                t.showState("previewImage")
            }),
            !1
        }
        ,
        this.setAvatarImageId = function(e, n) {
            if (!confirm(r.translate("Make this image your avatar?")))
                return !1;
            n = t(n);
            var i = n.parents(".avatar-status:first")
              , s = i.find(".current-avatar")
              , o = i.find(".make-avatar")
              , u = this;
            return i.height(i.height()),
            s.hide(),
            o.hide(),
            i.addClass("avatar-status-loading"),
            t.ajax({
                url: "/my-account/set-avatar-image-id",
                data: {
                    id: e
                },
                cache: !1,
                dataType: "json",
                type: "POST",
                success: function(e) {
                    e == 1 ? (i.removeClass("avatar-status-loading"),
                    u.els.content.find(".current-avatar").hide(),
                    u.els.content.find(".make-avatar").show(),
                    o.hide(),
                    s.fadeIn(),
                    u.events.avatarChosen()) : o.show()
                }
            }),
            !1
        }
        ,
        this.pushHistoryState = function() {
            if (!this.isHistorySupported())
                return;
            window.history.pushState({}, "", this.state.current.getHistoryUrl())
        }
        ,
        this.isHistorySupported = function() {
            return !!window.history && !!history.pushState
        }
        ,
        this.init()
    }
    ,
    n.Gallery.LoadingState = function(e) {
        this.init = function() {
            this.gallery = e,
            this.loadingEl = t('<div class="loading"></div>'),
            this.state = {}
        }
        ,
        this.loadStateFromUrlParts = function(e) {
            return !1
        }
        ,
        this.load = function(e) {}
        ,
        this.show = function() {
            this.gallery.els.content.empty().append(this.loadingEl)
        }
        ,
        this.init()
    }
    ,
    n.Gallery.BrowseGalleriesState = function(e) {
        this.init = function() {
            this.gallery = e,
            this.state = {
                page: 1,
                perPage: 8
            },
            this.responseCache = null
        }
        ,
        this.getHistoryUrl = function() {
            return "/gallery" + (this.state.page != 1 ? "/page/" + this.state.page : "")
        }
        ,
        this.load = function(e, n) {
            var r = this;
            this.gallery.state.states.loading.show(),
            t.ajax({
                url: "/gallery",
                data: {
                    page: this.state.page,
                    perPage: this.state.perPage,
                    _xhr: !0
                },
                cache: !1,
                dataType: "json",
                type: "GET",
                success: function(t) {
                    r.responseCache = t,
                    e(),
                    r.gallery.options.enableHistory && (n === undefined || n) && r.gallery.pushHistoryState()
                }
            })
        }
        ,
        this.loadStateFromUrlParts = function(e) {
            var t = this;
            if (e.length > 0)
                if (e[0] == "view" || e[0] == "preview")
                    return !1;
            this.state.page = 1,
            e = e.slice(0);
            while (e.length > 0) {
                var n = e.shift();
                n == "page" && e.length > 0 && (this.state.page = e.shift())
            }
            return this.load(function() {
                t.gallery.showState("browseGalleries")
            }, !1),
            !0
        }
        ,
        this.gotoPage = function(e) {
            var t = this;
            return this.state.page = e,
            this.load(function() {
                t.gallery.showState("browseGalleries")
            }),
            !1
        }
        ,
        this.setState = function(e) {
            this.state = t.extend({}, this.state, e)
        }
        ,
        this.show = function() {
            this.gallery.state.current = this,
            this.gallery.els.content.empty().hide().append(this.responseCache.content).fadeIn(),
            this.gallery.els.breadcrumb.empty().append(this.responseCache.breadcrumb),
            this.gallery.els.pagination.empty().append(this.responseCache.pagination),
            this.gallery.enableBotControls(this.responseCache.bce)
        }
        ,
        this.init()
    }
    ,
    n.Gallery.ViewGalleryState = function(e) {
        this.init = function() {
            this.gallery = e,
            this.state = {
                galleryId: null,
                page: 1,
                perPage: 8
            },
            this.responseCache = null
        }
        ,
        this.getHistoryUrl = function() {
            return "/gallery/view/" + this.state.galleryId + (this.state.page != 1 ? "/page/" + this.state.page : "")
        }
        ,
        this.setGalleryId = function(e) {
            this.state.galleryId = e
        }
        ,
        this.gotoPage = function(e) {
            var t = this;
            return this.state.page = e,
            this.load(function() {
                t.gallery.showState("viewGallery")
            }),
            !1
        }
        ,
        this.load = function(e, n) {
            var r = this;
            this.gallery.state.states.loading.show(),
            t.ajax({
                url: "/gallery/view/" + this.state.galleryId,
                data: {
                    page: this.state.page,
                    perPage: this.state.perPage,
                    _xhr: !0
                },
                cache: !1,
                dataType: "json",
                type: "GET",
                success: function(t) {
                    r.responseCache = t,
                    e(),
                    r.gallery.options.enableHistory && (n === undefined || n) && r.gallery.pushHistoryState()
                }
            })
        }
        ,
        this.loadStateFromUrlParts = function(e) {
            e = e.slice(0);
            if (e.length < 2)
                return !1;
            if (e.shift() != "view")
                return !1;
            this.state.page = 1,
            this.state.galleryId = e.shift();
            while (e.length > 0) {
                var t = e.shift();
                t == "page" && e.length > 0 && (this.state.page = e.shift())
            }
            var n = this;
            this.load(function() {
                n.gallery.showState("viewGallery")
            }, !1)
        }
        ,
        this.show = function() {
            this.gallery.els.content.empty().hide().append(this.responseCache.content).fadeIn(),
            this.gallery.els.breadcrumb.empty().append(this.responseCache.breadcrumb),
            this.gallery.els.pagination.empty().append(this.responseCache.pagination),
            this.gallery.enableBotControls(this.responseCache.bce)
        }
        ,
        this.setState = function(e) {
            this.state = t.extend({}, this.state, e)
        }
        ,
        this.init()
    }
    ,
    n.Gallery.PreviewImageState = function(e) {
        this.init = function() {
            this.gallery = e,
            this.state = {
                imageId: null
            },
            this.responseCache = null
        }
        ,
        this.getHistoryUrl = function() {
            return "/gallery/preview/" + this.state.imageId
        }
        ,
        this.setImageId = function(e) {
            this.state.imageId = e
        }
        ,
        this.loadStateFromUrlParts = function(e) {
            return !1;
            var t
        }
        ,
        this.load = function(e, n) {
            this.gallery.state.states.loading.show();
            var r = this;
            t.ajax({
                url: "/gallery/preview/" + this.state.imageId,
                data: {
                    _xhr: !0
                },
                cache: !1,
                dataType: "json",
                type: "GET",
                success: function(t) {
                    r.responseCache = t,
                    e(),
                    r.gallery.options.enableHistory && (n === undefined || n) && r.gallery.pushHistoryState()
                }
            })
        }
        ,
        this.show = function() {
            this.gallery.els.content.empty().hide().append(this.responseCache.content).fadeIn(),
            this.gallery.els.breadcrumb.empty().append(this.responseCache.breadcrumb),
            this.gallery.els.pagination.empty().append(this.responseCache.pagination),
            this.gallery.enableBotControls(this.responseCache.bce)
        }
        ,
        this.setState = function(e) {
            this.state = e
        }
        ,
        this.init()
    }
    ,
    n
}),
define("default/access_key", ["jquery"], function(e) {
    e(document).ready(function() {
        e("#generate_key").click(function(t) {
            e.ajax({
                type: "POST",
                url: "/my-account/preferences",
                success: function(t) {
                    e("#access_key").val(t.access_key)
                },
                error: function(e) {}
            })
        })
    })
}),
define("default/showcase-pins", ["jquery", "PoE/Helpers"], function(e, t) {
    e(document).ready(function() {
        e(".showcase-pin.button.add").click(function() {
            var n = e(this);
            e.ajax({
                url: BASEURL + "/api/account/showcase-pins",
                dataType: "json",
                data: e(this).data(),
                type: "POST",
                success: function(r) {
                    e(".showcase-message").length ? e(".showcase-message").html(t.translate("Added pin")).animate({
                        opacity: 1
                    }, 800, function() {
                        setTimeout(function() {
                            e(".showcase-message").animate({
                                opacity: 0
                            }, 1500)
                        }, 2e3)
                    }) : alert(t.translate("Added pin")),
                    n.hide();
                    try {
                        getShowcasePins()
                    } catch (i) {}
                },
                error: function(e) {
                    alert(t.translate("There was an error adding this pin"))
                }
            })
        }),
        e(".seasons-list select[name='seasons']").prop("disabled", "").change(function() {
            document.location = "/account/view-profile/" + e(this).data("profilename") + "/events/" + e(this).val()
        }),
        e(".challenge-list select[name='challenges']").prop("disabled", "").change(function() {
            document.location = "/account/view-profile/" + e(this).data("profilename") + "/challenges/" + e(this).val()
        })
    })
}),
define("default/captcha", ["jquery"], function(e) {
    e(document).ready(function() {
        e("#captcha_refresh").click(function() {
            e.ajax({
                url: BASEURL + "/default/account/refresh-captcha",
                dataType: "json",
                success: function(t) {
                    t != 0 ? (e("#captcha img").attr("src", BASEURL + "/gen/image/captcha/" + t + ".jpg"),
                    e("#captcha-id").attr("value", t)) : (e("#captcha .errors").length == 0 && e("#captcha-input").after('<ul class="errors"></ul>'),
                    e("#captcha .errors").html(""),
                    e("#captcha .errors").append("<li>Too many captcha refresh requests, please wait</li>")),
                    e("#captcha img").hide().fadeIn()
                }
            })
        })
    })
}),
define("default/private-messages/folder-view", ["jquery"], function(e) {
    e(document).ready(function() {
        e("#select-all").on("click", function(t) {
            e(".pm-list .controls input[type=checkbox]").prop("checked", !0),
            t.preventDefault()
        }),
        e("#deselect-all").on("click", function(t) {
            e(".pm-list .controls input[type=checkbox]").prop("checked", !1),
            t.preventDefault()
        });
        var t = e("#pm-list-controls .view-mode");
        t.change(function() {
            window.location.search = "?mode=" + e(this).val()
        }),
        t.prop("disabled", !1)
    })
}),
define("main", ["plugins", "PoE/Environment/Font", "PoE/Loader", "PoE/Item/Item", "PoE/BetaCountdown", "PoE/Item/DeferredItemRenderer", "PoE/Forum", "PoE/Forum/Thread/Autosave", "PoE/Forum/Thread/Tags", "PoE/View/Profile/Badges", "PoE/Forum/Post/Autosave", "PoE/Form", "PoE/PublicGameAccessCountdown", "PoE/Shop", "PoE/Profile/SelectAvatar", "PoE/Ladder/Ladder", "PoE/Widget/League/Ladder/Ladder", "PoE/Polyfill/Placeholder", "PoE/Layout/MenuPopupDelay", "PoE/Inventory/InventoryControls", "PoE/Widget/Guild/MemberPanel", "PoE/Widget/Guild/LeaderPanel", "PoE/Widget/TwitchTV", "PoE/Widget/YoutubeModal", "PoE/Widget/OpenBetaCountdown", "PoE/Widget/R16Label", "PoE/Widget/Season/SeasonInfo", "PoE/Widget/Season/Ladder/Ladder", "PoE/Widget/League/Event/Event", "PoE/Widget/ProfileLink/Manager", "PoE/Widget/ProfileLink/ProfileLink", "PoE/Shop/PaymentForm", "PoE/Shop/PaymentFormExistingCard", "PoE/Shop/XsollaPaymentWidget", "PoE/Widget/League/EventCalendar/EventCalendar", "PoE/View/Season/ViewSignatureRaces", "PoE/View/Season/PlayerHistory", "PoE/View/Season/PlayerHistoryViewer", "PoE/View/Profile/ShowcasePins", "PoE/Form/Account/SignUp", "PoE/Form/Account/SteamSignUp", "PoE/Inventory/LinkedStashRenderer", "default/gallery/gallery", "default/access_key", "default/showcase-pins", "default/captcha", "default/private-messages/folder-view"], function(e, t) {
    var n = function() {
        e("body > .container").css("min-height", e(window).height())
    };
    e(window).resize(function() {
        n()
    }),
    t.loadFonts()
})
