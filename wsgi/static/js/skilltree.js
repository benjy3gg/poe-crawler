define("PoE/PassiveSkillTree/ObjectList", [], function() {
    return function() {
        this.init = function() {
            this.objects = [],
            this.priorities = [],
            this.priorityToObjects = {}
        }
        ,
        this.add = function(e, t) {
            t = t === undefined ? 0 : t,
            this.priorityToObjects[t] === undefined && (this.priorities.push(t),
            this.priorityToObjects[t] = [],
            this.priorities.sort(function(e, t) {
                return e - t
            })),
            this.priorityToObjects[t].push(e)
        }
        ,
        this.remove = function(e) {
            var t = !1;
            for (var n in this.priorityToObjects) {
                var r = this.priorityToObjects[n];
                for (var i = r.length - 1; i >= 0; --i)
                    r[i] === e && (r.splice(i, 1),
                    t = !0)
            }
            return t
        }
        ,
        this.foreachObject = function(e) {
            for (var t = 0, n = this.priorities.length; t < n; ++t) {
                var r = this.priorityToObjects[this.priorities[t]];
                for (var i = 0, s = r.length; i < s; ++i)
                    e(r[i])
            }
        }
        ,
        this.init()
    }
}),
define("PoE/PassiveSkillTree/EventContainer", [], function() {
    return function() {
        this.init = function() {
            this.events = []
        }
        ,
        this.trigger = function() {
            for (var e = 0, t = this.events.length; e < t; ++e)
                this.events[e]()
        }
        ,
        this.add = function(e) {
            if (e instanceof Array)
                for (var t = 0, n = e.length; t < n; ++t)
                    this.add(e[t]);
            else
                this.events.push(e)
        }
        ,
        this.remove = function(e) {
            for (var t = 0; t < this.events.length; ++t)
                this.events[t] === e && this.events.splice(t, 1)
        }
        ,
        this.init()
    }
}),
define("PoE/PassiveSkillTree/PassiveAllocation", [], function() {
    return function(e) {
        this.init = function() {
            this.skillTree = e,
            this.characterLevel = 100,
            this.extraSkillPoints = 24,
            this.skillPointsFromPassive = 0,
            this.ascendancySkillPoints = 8,
            this.numAllocatedAscendancySkills = 0,
            this.numAllocatedSkills = 0,
            this.allocatedSkills = {},
            this.canAllocateSkills = {}
        }
        ,
        this.foreachAllocatedSkill = function(e) {
            for (var t in this.allocatedSkills)
                e(this.allocatedSkills[t])
        }
        ,
        this.isAllocated = function(e) {
            return this.allocatedSkills[e.skill.getHash()] !== undefined
        }
        ,
        this.loadHashArray = function(e) {
            this.reset();
            for (var t = 0, n = e.length; t < n; ++t) {
                var r = e[t];
                if (r === 0)
                    continue;
                var i = this.skillTree.getNode(r);
                i.isAscendancy ? i.isMultipleChoiceOption || this.numAllocatedAscendancySkills++ : this.numAllocatedSkills++,
                this.allocatedSkills[r] = i,
                i && (i.active = !0,
                this.passiveAllocated(i.skill))
            }
            this.recalcCanAllocateSkills(),
            this.skillTree.events.pointsChanged.trigger()
        }
        ,
        this.allocate = function(e) {
            var t = this.skillTree.getNode(e)
              , n = this;
            if (!this.canAllocate(t))
                return !1;
            if (t.isMultipleChoiceOption) {
                var r = !1;
                t.foreachInNode(function(e) {
                    e.isMultipleChoice && (r = e)
                });
                if (!r)
                    return !1;
                r.foreachOutNode(function(e) {
                    e.isMultipleChoiceOption && n.unallocate(e.id)
                })
            } else
                t.isAscendancy ? this.numAllocatedAscendancySkills++ : this.numAllocatedSkills++;
            return t.passivePointsGranted >= 0 && (this.skillPointsFromPassive += t.passivePointsGranted),
            t.active = !0,
            this.allocatedSkills[e] = t,
            this.recalcCanAllocateSkills(),
            this.passiveAllocated(t.skill),
            this.skillTree.pushHistoryState(),
            this.skillTree.events.pointsChanged.trigger(),
            !0
        }
        ,
        this.unallocate = function(e) {
            var t = this.skillTree.getNode(e);
            return this.canUnallocate(t) ? (t.isMultipleChoiceOption || (t.isAscendancy ? this.numAllocatedAscendancySkills-- : this.numAllocatedSkills--),
            t.passivePointsGranted && (this.skillPointsFromPassive -= t.passivePointsGranted),
            t.active = !1,
            delete this.allocatedSkills[e],
            this.recalcCanAllocateSkills(),
            this.passiveUnallocated(t.skill),
            this.skillTree.pushHistoryState(),
            this.skillTree.events.pointsChanged.trigger(),
            !0) : !1
        }
        ,
        this.canAllocate = function(e) {
            if (this.skillTree.readonly)
                return !1;
            if (e.active)
                return !1;
            if (e === this.skillTree.startNode)
                return !1;
            if (this.allocatedSkills[e.id] !== undefined)
                return !1;
            if (e.isAscendancyStartNode)
                return !1;
            if (e.isMultipleChoiceOption)
                for (var t in e.inNodes) {
                    var n = e.inNodes[t];
                    if (!n.isMultipleChoiceOption && n.isMultipleChoice && n.active)
                        return !0
                }
            for (var t in e.outNodes) {
                var r = e.outNodes[t];
                if (r.active || r.isClassStartPosition(this.skillTree.characterClass))
                    return !0
            }
            if (!e.isAscendancy && this.getPassiveSkillPointsAvailable() <= 0)
                return !1;
            if (e.isAscendancy && this.getAscendancyPassiveSkillPointsAvailable() <= 0)
                return !1;
            var i = this;
            return e.findNeighbourNode(function(e) {
                return e.active || e.isClassStartPosition(i.skillTree.characterClass)
            }) === !1 ? !1 : !0
        }
        ,
        this.canUnallocate = function(e) {
            return this.skillTree.readonly ? !1 : e.isClassStartNode || e.isAscendancyStartNode ? !1 : this.isAllocatedLeaf(e) ? e.passivePointsGranted && e.passivePointsGranted > 0 && this.getPassiveSkillPointsAvailable() - e.passivePointsGranted < 0 ? !1 : !0 : !1
        }
        ,
        this.isAllocatedLeaf = function(e) {
            if (!e.active)
                return !1;
            var t = []
              , n = [];
            this.skillTree.visitNodes(this.skillTree.startNode, t, n, function(t) {
                return t.skill === null || t !== e && t.active
            });
            for (var r in this.allocatedSkills) {
                var i = this.allocatedSkills[r];
                if (!n[i.id]) {
                    if (!i.skill || i.id == e.id)
                        continue;
                    return !1
                }
            }
            return !0
        }
        ,
        this.recalcCanAllocateSkills = function() {
            this.clearCanAllocateSkills();
            var e = this;
            for (var t in this.allocatedSkills) {
                var n = this.allocatedSkills[t];
                n && n.foreachNeighbourNode(function(t) {
                    if (t.active || t.canAllocate)
                        return;
                    e.canAllocate(t) && (t.canAllocate = !0,
                    e.canAllocateSkills[t.skill.getHash()] = t)
                })
            }
        }
        ,
        this.clearCanAllocateSkills = function() {
            for (var e in this.canAllocateSkills) {
                var t = this.canAllocateSkills[e];
                t.canAllocate = !1
            }
        }
        ,
        this.reset = function() {
            for (var e in this.allocatedSkills) {
                var t = this.allocatedSkills[e];
                t.active = !1,
                this.passiveUnallocated(t.skill)
            }
            this.clearCanAllocateSkills(),
            this.numAllocatedSkills = 0,
            this.numAllocatedAscendancySkills = 0,
            this.allocatedSkills = {},
            this.canAllocateSkills = {},
            this.skillTree.events.pointsChanged.trigger()
        }
        ,
        this.getTotalSkillPoints = function() {
            return this.extraSkillPoints + this.characterLevel - 1 + this.skillPointsFromPassive
        }
        ,
        this.getTotalAscendancySkillPoints = function() {
            return this.ascendancySkillPoints
        }
        ,
        this.getPassiveSkillPointsAvailable = function() {
            return this.getTotalSkillPoints() - this.numAllocatedSkills
        }
        ,
        this.getAscendancyPassiveSkillPointsAvailable = function() {
            return this.getTotalAscendancySkillPoints() - this.numAllocatedAscendancySkills
        }
        ,
        this.passiveAllocated = function() {}
        ,
        this.passiveUnallocated = function() {}
        ,
        this.init()
    }
}),
define("PoE/PassiveSkillTree/Skill", ["PoE/Helpers"], function(e) {
    var t = function(t) {
        this.init = function() {
            this.hash = null,
            this.icon = null,
            this.iconActiveSources = t.iconHighlighted,
            this.skillDescription = t.sd,
            this.displayName = t.dn,
            this.flavourText = t.flavourText,
            this.reminderText = t.reminderText,
            this.sa = t.sa,
            this.da = t.da,
            this.ia = t.ia,
            this.item = t.item,
            this.jewel = t.jewel,
            t.id !== undefined && (this.hash = t.id),
            t.icon !== undefined && (this.icon = t.icon);
            if (t.passivePointsGranted && t.passivePointsGranted >= 0) {
                var n = "Passive Skill Point";
                t.passivePointsGranted > 1 && (n += "s"),
                this.skillDescription = [e.translate("Grants") + " " + t.passivePointsGranted + " " + e.translate(n)]
            }
        }
        ,
        this.init()
    };
    return t.prototype.getHash = function() {
        return this.hash
    }
    ,
    t
}),
define("PoE/PassiveSkillTree/JewelAllocation", ["./Skill", "PoE/Item/Item", "PoE/Backbone/Model/Item/Item", "PoE/Item/LayoutManager"], function(e, t, n, r) {
    return function(i) {
        this.init = function() {
            this.skillTree = i,
            this.allocatedJewels = {},
            this.layoutManager = new r
        }
        ,
        this.loadJewels = function(r) {
            var i = this;
            r.accountName && r.characterName && $.ajax({
                url: "/character-window/get-passive-skills?accountName=" + r.accountName + "&character=" + r.characterName,
                dataType: "json",
                success: function(i) {
                    if (i) {
                        r.jewelSlots = i.jewel_slots;
                        for (var s in i.items) {
                            var o = i.items[s]
                              , u = r.jewelSlots[o.x]
                              , a = r.getNode(u.passiveSkill.hash)
                              , f = new t({
                                enableVerified: !1,
                                enableLeague: !1,
                                showSockets: !1,
                                manualPosition: !0,
                                model: new n(o)
                            });
                            f.render();
                            var l = {
                                id: u.passiveSkill.hash,
                                sd: !1,
                                dn: o.name,
                                sa: !1,
                                da: !1,
                                ia: !1,
                                icon: o.icon,
                                item: f,
                                jewel: o
                            };
                            a.skill = new e(l)
                        }
                        r.drawState.dirty = !0,
                        r.drawState.dirtyFullRedraw = !0
                    }
                },
                fail: function(e) {
                    console.log(e)
                }
            })
        }
        ,
        this.foreachAllocatedJewel = function(e) {
            for (var t in this.allocatedJewels)
                e(this.allocatedJewels[t])
        }
        ,
        this.allocate = function(e, t, n) {
            var n = this.skillTree.getNode(t)
        }
        ,
        this.jewelAllocated = function() {}
        ,
        this.jewelUnallocated = function() {}
        ,
        this.init()
    }
}),
define("PoE/PassiveSkillTree/Stats", [], function() {
    return function() {
        this.init = function() {
            this.attributes = [0, 0, 0]
        }
        ,
        this.getAttribute = function(e) {
            return this.attributes[e]
        }
        ,
        this.setAttribute = function(e, t) {
            this.attributes[e] = t,
            this.statsChanged()
        }
        ,
        this.addAttribute = function(e, t) {
            this.attributes[e] += t,
            this.statsChanged()
        }
        ,
        this.subAttribute = function(e, t) {
            this.attributes[e] -= t,
            this.statsChanged()
        }
        ,
        this.statsChanged = function() {}
        ,
        this.init()
    }
}),
define("PoE/PassiveSkillTree/Node", ["./Skill"], function(e) {
    var t = function(t) {
        this.init = function() {
            this.group = null,
            this.orbit = t.o,
            this.orbitIndex = t.oidx,
            this.outNodes = {},
            this.inNodes = {},
            this.clickObj = null,
            this.keyStone = null,
            this.startPositionClasses = null,
            this.isClassStartNode = !1,
            this.notable = null,
            this.isJewel = t.isJewelSocket,
            this.id = t.id,
            this.isAscendancy = t.hasOwnProperty("ascendancyName"),
            this.ascendancyName = t.ascendancyName,
            this.isAscendancyStartNode = t.isAscendancyStart ? !0 : !1,
            this.canAllocateWithoutConnection = !1,
            this.passivePointsGranted = t.passivePointsGranted,
            this.isMultipleChoice = t.isMultipleChoice,
            this.isMultipleChoiceOption = t.isMultipleChoiceOption,
            this.hidden = !1,
            this.active = !1,
            this.canAllocate = !1,
            this.renderState = {
                hover: !1
            },
            this.popup = null,
            this.clickable = null,
            this.similarNodeHighlighter = null,
            this.pathHighlighterGroup = null,
            t.ks !== null && (this.keyStone = t.ks),
            t.spc !== undefined && (this.startPositionClasses = t.spc,
            this.startPositionClasses.length > 0 && (this.isClassStartNode = !0)),
            t.not !== undefined && (this.notable = t.not),
            t.m !== undefined && (this.mastery = t.m),
            this.skill = new e(t)
        }
        ,
        this.init()
    };
    return t.prototype.isClassStartPosition = function(e) {
        if (this.startPositionClasses === null)
            return !1;
        for (var t = 0, n = this.startPositionClasses.length; t != n; ++t)
            if (this.startPositionClasses[t] == e)
                return !0;
        return !1
    }
    ,
    t.prototype.addOutNode = function(e) {
        this.outNodes[e.skill.getHash()] = e,
        e.addInNode(this)
    }
    ,
    t.prototype.addInNode = function(e) {
        this.inNodes[e.skill.getHash()] = e
    }
    ,
    t.prototype.setGroup = function(e) {
        this.group = e
    }
    ,
    t.prototype.foreachOutNode = function(e) {
        for (var t in this.outNodes)
            e.call(this, this.outNodes[t])
    }
    ,
    t.prototype.foreachInNode = function(e) {
        for (var t in this.inNodes)
            e.call(this, this.inNodes[t])
    }
    ,
    t.prototype.foreachNeighbourNode = function(e) {
        this.foreachOutNode(e),
        this.foreachInNode(e)
    }
    ,
    t.prototype.findNeighbourNode = function(e) {
        for (var t in this.outNodes)
            if (e.call(this, this.outNodes[t]))
                return this.outNodes[t];
        for (var t in this.inNodes)
            if (e.call(this, this.inNodes[t]))
                return this.inNodes[t];
        return !1
    }
    ,
    t.prototype.isKeyStone = function() {
        return this.keyStone
    }
    ,
    t.prototype.isMastery = function() {
        return this.mastery
    }
    ,
    t.prototype.isSocketedJewel = function() {
        return this.isJewel && this.skill && this.skill.item
    }
    ,
    t
}),
define("PoE/PassiveSkillTree/Group", [], function() {
    var e = function(e, t, n) {
        this.id = e,
        this.position = t,
        this.nodes = {},
        this.occupiedOrbits = n,
        this.isAscendancy = !1,
        this.ascendancyName = !1,
        this.oldPos = !1
    };
    return e.prototype.addNode = function(e) {
        this.nodes[e.skill.getHash()] = e,
        e.setGroup(this)
    }
    ,
    e.prototype.getId = function() {
        return this.id
    }
    ,
    e.prototype.foreachNode = function(e) {
        for (var t in this.nodes)
            e.call(this, this.nodes[t])
    }
    ,
    e.prototype.isOccupiedOrbit = function(e) {
        return this.occupiedOrbits[e] !== undefined
    }
    ,
    e.prototype.isAscendancy = function() {
        return this.isAscendancy
    }
    ,
    e.prototype.getAscendancy = function() {
        return this.ascendancyName
    }
    ,
    e
}),
define("PoE/PassiveSkillTree/Tile", [], function() {
    return function() {
        this.canvas = null,
        this.dirty = !0
    }
}),
define("PoE/PassiveSkillTree/Clickable", [], function() {
    var e = function(e) {
        this.bounds = e,
        this.mouseMoved = !1
    };
    return e.prototype.hitTest = function(e) {
        return this.bounds.contains(e.worldPosition)
    }
    ,
    e.prototype.onclickTest = function(e) {
        return this.hitTest(e) ? (this.onclick(e),
        !0) : !1
    }
    ,
    e.prototype.onmousemoveTest = function(e) {
        if (!this.hitTest(e))
            return !1;
        this.mouseMoved = !0,
        this.onmousemove(e)
    }
    ,
    e.prototype.forceMouseOut = function() {
        if (!this.mouseMoved)
            return !1;
        this.mouseMoved = !1,
        this.onmouseout()
    }
    ,
    e.prototype.onmouseoutTest = function(e) {
        if (!this.mouseMoved)
            return !1;
        if (this.hitTest(e))
            return !1;
        this.mouseMoved = !1,
        this.onmouseout()
    }
    ,
    e.prototype.onclick = function(e) {}
    ,
    e.prototype.onmousemove = function(e) {}
    ,
    e.prototype.onmouseout = function(e) {}
    ,
    e
}),
define("PoE/PassiveSkillTree/BFS/PathIterator", [], function() {
    return function(e, t) {
        this.startNode = e,
        this.nodeRelationshipData = t,
        this.iterate = function(t) {
            var n = []
              , r = this.nodeRelationshipData[e.skill.getHash()].parents;
            n.push(e);
            var i = [];
            i.push(e),
            visited = {};
            while (i.length > 0) {
                var s = i.pop()
                  , o = this.nodeRelationshipData[s.skill.getHash()]
                  , r = o.parents;
                for (var u = 0, a = r.length; u < a; ++u) {
                    t(s, r[u], o.depth);
                    if (visited[r[u].skill.getHash()] !== undefined)
                        continue;
                    visited[r[u].skill.getHash()] = !0,
                    i.push(r[u]),
                    n.push(r[u])
                }
            }
            return n
        }
        ,
        this.getStartNodeDepth = function() {
            return this.nodeRelationshipData[this.startNode.skill.getHash()].depth
        }
    }
}),
define("PoE/PassiveSkillTree/UtilityFunctions", [], function() {
    return {
        calculateLerpPosition: function(e, t, n) {
            var r = t - e
              , i = r / n;
            return i
        },
        calculateFlipPosition: function(e, t, n) {
            var r = t - e
              , i = r / n
              , s = parseInt(i) % 2
              , o = i % 1;
            return s == 0 ? o : 1 - o
        }
    }
}),
define("PoE/PassiveSkillTree/RGBA", ["./UtilityFunctions"], function(e) {
    var t = function(n, r, i, s) {
        this.r = n || 0,
        this.g = r || 0,
        this.b = i || 0,
        this.a = s || 0,
        this.addA = function(e) {
            this.a += e,
            this.a > 1 && (this.a = 1)
        }
        ,
        this.flipBetween = function(t, n, r, i, s, o, u, a) {
            this.setInterpolatedValue(t, n, e.calculateFlipPosition(r, i, s), e.calculateFlipPosition(r, i, o), e.calculateFlipPosition(r, i, u), e.calculateFlipPosition(r, i, a))
        }
        ,
        this.lerpBetween = function(t, n, r, i, s, o, u, a) {
            this.setInterpolatedValue(t, n, e.calculateLerpPosition(r, i, s), e.calculateLerpPosition(r, i, o), e.calculateLerpPosition(r, i, u), e.calculateLerpPosition(r, i, a))
        }
        ,
        this.setInterpolatedValue = function(e, t, n, r, i, s) {
            var o = this
              , u = function(n, r) {
                e[n] < t[n] ? (o[n] = e[n] + (t[n] - e[n]) * r,
                o[n] > t[n] && (o[n] = t[n])) : (o[n] = e[n] - (e[n] - t[n]) * r,
                o[n] < t[n] && (o[n] = t[n]))
            };
            u("r", n),
            u("g", r),
            u("b", i),
            u("a", s),
            this.r = Math.round(this.r),
            this.g = Math.round(this.g),
            this.b = Math.round(this.b)
        }
        ,
        this.getCanvasRGBA = function() {
            return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")"
        }
        ,
        this.clone = function() {
            return new t(this.r,this.g,this.b,this.a)
        }
    };
    return t
}),
define("PoE/PassiveSkillTree/PathHighlighter", ["./BFS/PathIterator", "./RGBA"], function(e, t) {
    return function(n, r, i) {
        this.init = function() {
            this.skillTree = n,
            this.drawObject = null,
            this.bfsPathIterator = new e(r,i),
            this.states = {
                BEGIN: 0,
                DEFAULT: 1,
                END: 2
            },
            this.state = this.states.BEGIN,
            this.params = {},
            this.params[this.states.DEFAULT] = {
                speed: 1e3,
                sFillC: new t(50,50,255,.4),
                eFillC: new t(50,50,255,.6),
                sStrokeC: new t(200,200,255,.4),
                eStrokeC: new t(255,255,255,.6)
            },
            this.params[this.states.END] = {
                speed: 100,
                sFillC: null,
                sStrokeC: null,
                eFillC: new t,
                eStrokeC: new t(0,0,0,0)
            },
            this.params[this.states.BEGIN] = {
                speed: 50,
                sFillC: new t(255,255,255,1),
                sStrokeC: new t(255,255,255,1)
            },
            this.params[this.states.BEGIN].eFillC = this.params[this.states.DEFAULT].sFillC,
            this.params[this.states.BEGIN].eStrokeC = this.params[this.states.DEFAULT].sStrokeC,
            this.events = {
                endFunc: function() {}
            },
            this.start = (new Date).getTime(),
            this.setupDrawObject(),
            this.begin()
        }
        ,
        this.setupDrawObject = function() {
            this.drawObject = new function(e) {
                this.init = function() {
                    this.highlighter = e,
                    this.skillTree = e.skillTree,
                    this.fillC = new t(50,50,255,.5),
                    this.strokeC = new t(50,50,255,.6),
                    this.fillC = new t(50,50,255,.5),
                    this.strokeC = new t(50,50,255,.6)
                }
                ;
                var n = this;
                this.begin = function() {
                    var e = this.highlighter.params[this.highlighter.states.BEGIN]
                      , t = this;
                    setTimeout(function() {
                        t.beginDefault()
                    }, e.speed)
                }
                ,
                this.beginDefault = function(e) {
                    this.highlighter.start = e || (new Date).getTime(),
                    this.highlighter.state = this.highlighter.states.DEFAULT
                }
                ,
                this.end = function() {
                    this.highlighter.state = this.highlighter.states.END,
                    this.highlighter.params[this.highlighter.states.END].sFillC = this.fillC.clone(),
                    this.highlighter.params[this.highlighter.states.END].sStrokeC = this.strokeC.clone(),
                    this.highlighter.start = (new Date).getTime();
                    var e = this;
                    setTimeout(function() {
                        e.endImmediately()
                    }, this.highlighter.params[this.highlighter.states.END].speed)
                }
                ,
                this.endImmediately = function() {
                    this.skillTree.midDrawObjects.remove(this.highlighter.drawObject) && this.highlighter.events.endFunc()
                }
                ,
                this.draw = function() {
                    var e = n.skillTree.midCtx
                      , t = function(e, t, r) {
                        var i = t.position
                          , s = (new Date).getTime();
                        switch (n.highlighter.state) {
                        case n.highlighter.states.BEGIN:
                            var o = n.highlighter.params[n.highlighter.states.BEGIN];
                            n.fillC.lerpBetween(o.sFillC, o.eFillC, n.highlighter.start, s, o.speed, o.speed, o.speed, o.speed),
                            n.strokeC.lerpBetween(o.sStrokeC, o.eStrokeC, n.highlighter.start, s, o.speed, o.speed, o.speed, o.speed);
                            break;
                        case n.highlighter.states.DEFAULT:
                            var o = n.highlighter.params[n.highlighter.states.DEFAULT];
                            n.fillC.flipBetween(o.sFillC, o.eFillC, n.highlighter.start, s, o.speed, o.speed, o.speed, o.speed),
                            n.strokeC.flipBetween(o.sStrokeC, o.eStrokeC, n.highlighter.start, s, o.speed, o.speed, o.speed, o.speed);
                            break;
                        case n.highlighter.states.END:
                            var o = n.highlighter.params[n.highlighter.states.END];
                            n.strokeC.lerpBetween(o.sStrokeC, o.eStrokeC, n.highlighter.start, s, o.speed, o.speed, o.speed, o.speed)
                        }
                        if (n.skillTree.viewPort.bounds.contains(i)) {
                            var u = n.skillTree.getNodeRadius(e);
                            i = n.skillTree.worldToScreen(i),
                            n.skillTree.midCtx.beginPath(),
                            n.skillTree.midCtx.lineWidth = 2,
                            n.skillTree.midCtx.strokeStyle = "rgba(255,255,255,1)",
                            n.skillTree.midCtx.fillStyle = "rgba(255,255,255,1)",
                            n.skillTree.midCtx.arc(i.x, i.y, u * n.skillTree.viewPort.zoom, 0, 2 * Math.PI, !1),
                            n.skillTree.midCtx.globalCompositeOperation = "destination-out",
                            n.skillTree.midCtx.fill(),
                            n.skillTree.midCtx.stroke(),
                            n.skillTree.midCtx.strokeStyle = n.strokeC.getCanvasRGBA(),
                            n.skillTree.midCtx.fillStyle = n.fillC.getCanvasRGBA(),
                            n.skillTree.midCtx.globalCompositeOperation = "source-over",
                            n.skillTree.midCtx.fill(),
                            n.skillTree.midCtx.stroke();
                            if (r !== null) {
                                var a = 50 * n.skillTree.viewPort.zoom
                                  , f = n.skillTree.midCtx.measureText(r).width;
                                n.strokeC.addA(.3),
                                n.skillTree.midCtx.fillStyle = n.strokeC.getCanvasRGBA(),
                                n.skillTree.midCtx.font = a + "pt FontinBold",
                                n.skillTree.midCtx.fillText(r, i.x - f / 2, i.y + a / 2)
                            }
                        } else
                            n.skillTree.drawViewportIntersectionPoint(i, function(e) {
                                n.skillTree.topCtx.beginPath(),
                                n.skillTree.topCtx.lineWidth = 2,
                                n.skillTree.topCtx.strokeStyle = n.strokeC.getCanvasRGBA(),
                                n.skillTree.topCtx.fillStyle = n.fillC.getCanvasRGBA(),
                                n.skillTree.topCtx.arc(e.x, e.y, 2, 0, 2 * Math.PI, !1),
                                n.skillTree.topCtx.fill(),
                                n.skillTree.topCtx.stroke(),
                                n.skillTree.drawState.topDirty = !0
                            })
                    };
                    n.highlighter.bfsPathIterator.iterate(function(t, r) {
                        n.skillTree.drawPathBetweenNodes(t, r, function(t, r) {
                            var i = t.position
                              , s = r.position;
                            i = n.skillTree.worldToScreen(i),
                            s = n.skillTree.worldToScreen(s),
                            e.beginPath(),
                            e.lineWidth = 3,
                            e.strokeStyle = n.strokeC.getCanvasRGBA(),
                            e.moveTo(i.x, i.y),
                            e.lineTo(s.x, s.y),
                            e.stroke()
                        }, function(t, r, i, s) {
                            t = n.skillTree.worldToScreen(t),
                            e.beginPath(),
                            e.lineWidth = 3,
                            e.strokeStyle = n.strokeC.getCanvasRGBA(),
                            e.arc(t.x, t.y, s * n.skillTree.viewPort.zoom, r - Math.PI / 2, i - Math.PI / 2, !1),
                            e.stroke()
                        })
                    }),
                    n.highlighter.bfsPathIterator.iterate(function(e, r, i) {
                        t(r, n.skillTree.getNodePositionInfo(r), null)
                    }),
                    t(n.highlighter.bfsPathIterator.startNode, n.skillTree.getNodePositionInfo(n.highlighter.bfsPathIterator.startNode), n.highlighter.bfsPathIterator.getStartNodeDepth())
                }
                ,
                this.init()
            }
            (this),
            this.skillTree.midDrawObjects.add(this.drawObject, 0)
        }
        ,
        this.begin = function() {
            this.drawObject.begin()
        }
        ,
        this.beginDefault = function(e) {
            this.drawObject.beginDefault(e)
        }
        ,
        this.end = function() {
            this.drawObject.end()
        }
        ,
        this.endImmediately = function() {
            this.drawObject.endImmediately()
        }
        ,
        this.init()
    }
}),
define("PoE/PassiveSkillTree/PathHighlighterGroup", ["./PathHighlighter"], function(e) {
    return function(t, n) {
        this.init = function() {
            this.skillTree = t,
            this.shortestPathsSets = n,
            this.pathHighlighters = []
        }
        ,
        this.begin = function() {
            this.pathHighlighters = [];
            for (var t = 0, n = this.shortestPathsSets.length; t < n; ++t)
                (function(n, r) {
                    n.pathHighlighters[t] = new e(n.skillTree,r.goalNodeData.node,r.nodeRelationshipData)
                })(this, this.shortestPathsSets[t])
        }
        ,
        this.end = function() {
            for (var e = 0, t = this.shortestPathsSets.length; e < t; ++e)
                this.pathHighlighters[e].end()
        }
        ,
        this.init()
    }
}),
define("PoE/PassiveSkillTree/Popup", [], function() {
    var e = function(e, t, n, r, i, s, o) {
        this.id = e,
        this.destCanvas = t,
        this.destCtx = t.getContext("2d"),
        this.x = n,
        this.y = r,
        this.contentRenderFunc = o,
        this.resize(i, s)
    };
    return e.prototype.resize = function(e, t) {
        this.canvas = document.createElement("canvas"),
        this.ctx = this.canvas.getContext("2d"),
        this.canvas.width = e,
        this.canvas.height = t
    }
    ,
    e.prototype.draw = function() {
        this.contentRenderFunc(this, !0, this.ctx),
        this.ctx.lineWidth = 4,
        this.ctx.fillStyle = "rgba(0,0,0,.80)",
        this.ctx.strokeStyle = "rgb(203,181,156)",
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height),
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height),
        this.ctx.fill(),
        this.ctx.stroke(),
        this.contentRenderFunc(this, !1, this.ctx);
        var e = this.x
          , t = this.y
          , n = e + this.canvas.width
          , r = t + this.canvas.height;
        n > this.destCanvas.width && (e -= n - this.destCanvas.width),
        r > this.destCanvas.height && (t -= r - this.destCanvas.height),
        this.destCtx.drawImage(this.canvas, e, t)
    }
    ,
    e
}),
define("PoE/PassiveSkillTree/BFS/NodeData", [], function() {
    return function(e, t) {
        this.node = e,
        this.parents = [],
        this.depth = t
    }
}),
define("PoE/PassiveSkillTree/ByteDecoder", [], function() {
    return function() {
        this.init = function() {
            this.dataString = "",
            this.position = 0
        }
        ,
        this.bytesToInt16 = function(e) {
            return this.bytesToInt(e, 2)
        }
        ,
        this.bytesToInt = function(e, t) {
            t = t || 4;
            var n = 0;
            for (var r = 0; r < t; ++r)
                n += e[r],
                r < t - 1 && (n <<= 8);
            return n
        }
        ,
        this.hasData = function() {
            return this.position < this.dataString.length
        }
        ,
        this.getDataString = function() {
            return this.dataString
        }
        ,
        this.setDataString = function(e) {
            this.dataString = e,
            this.position = 0
        }
        ,
        this.readInt8 = function() {
            return this.readInt(1)
        }
        ,
        this.readInt16 = function() {
            return this.readInt(2)
        }
        ,
        this.readInt = function(e) {
            e = e || 4;
            var t = this.position + e;
            if (t > this.dataString.length)
                throw "Integer read exceeds bounds";
            var n = [];
            for (; this.position < t; ++this.position)
                n.push(this.dataString.charAt(this.position).charCodeAt(0));
            return this.bytesToInt(n, e)
        }
        ,
        this.init()
    }
}),
define("PoE/PassiveSkillTree/NodeHighlighter/AnimationType", [], function() {
    return {
        Default: 0,
        In: 1,
        Out: 2
    }
}),
define("PoE/PassiveSkillTree/NodeHighlighter/NodeHighlighter", ["jquery", "PoE/PassiveSkillTree/RGBA", "./AnimationType"], function(e, t, n) {
    var r = function(e, r) {
        this.acceptFunc = function(e) {
            return !0
        }
        ,
        this.animations = {},
        this.animations[n.In] = {
            speed: 50,
            fillColour: {
                start: new t(255,255,255,1)
            },
            strokeColour: {
                start: new t(255,255,255,1)
            }
        },
        this.animations[n.Default] = {
            speed: 1e3,
            fillColour: {
                start: new t(255,213,47,.3),
                end: new t(255,213,47,.6)
            },
            strokeColour: {
                start: new t(255,213,47,.4),
                end: new t(255,213,47,.7)
            }
        },
        this.animations[n.Out] = {
            speed: 100,
            fillColour: {
                start: null,
                end: new t
            },
            strokeColour: {
                start: null,
                end: new t(0,0,0,0)
            }
        },
        this.skillTree = e,
        this.init(r)
    };
    return r.prototype.draw = function() {
        var e = (new Date).getTime();
        switch (this.animationState) {
        case n.In:
            var t = this.animations[n.In];
            this.fillColour.lerpBetween(t.fillColour.start, t.fillColour.end, this.start, e, t.speed, t.speed, t.speed, t.speed),
            this.strokeColour.lerpBetween(t.strokeColour.start, t.strokeColour.end, this.start, e, t.speed, t.speed, t.speed, t.speed);
            break;
        case n.Default:
            var t = this.animations[n.Default];
            this.fillColour.flipBetween(t.fillColour.start, t.fillColour.end, this.start, e, t.speed, t.speed, t.speed, t.speed),
            this.strokeColour.flipBetween(t.strokeColour.start, t.strokeColour.end, this.start, e, t.speed, t.speed, t.speed, t.speed);
            break;
        case n.Out:
            var t = this.animations[n.Out];
            this.strokeColour.lerpBetween(t.strokeColour.start, t.strokeColour.end, this.start, e, t.speed, t.speed, t.speed, t.speed)
        }
        for (var r = 0, i = this.nodes.length; r < i; ++r) {
            var s = this.nodes[r]
              , o = this.skillTree.getNodeRadius(s)
              , u = this.skillTree.getNodePositionInfo(s).position;
            if (this.skillTree.viewPort.bounds.contains(u))
                u = this.skillTree.worldToScreen(u),
                this.skillTree.midCtx.beginPath(),
                this.skillTree.midCtx.lineWidth = 2,
                this.skillTree.midCtx.strokeStyle = this.strokeColour.getCanvasRGBA(),
                this.skillTree.midCtx.fillStyle = this.fillColour.getCanvasRGBA(),
                this.skillTree.midCtx.arc(u.x, u.y, o * this.skillTree.viewPort.zoom, 0, 2 * Math.PI, !1),
                this.skillTree.midCtx.fill(),
                this.skillTree.midCtx.stroke();
            else {
                var a = this;
                this.skillTree.drawViewportIntersectionPoint(u, function(e) {
                    a.skillTree.topCtx.beginPath(),
                    a.skillTree.topCtx.lineWidth = 2,
                    a.skillTree.topCtx.strokeStyle = a.strokeColour.getCanvasRGBA(),
                    a.skillTree.topCtx.fillStyle = a.fillColour.getCanvasRGBA(),
                    a.skillTree.topCtx.arc(e.x, e.y, 2, 0, 2 * Math.PI, !1),
                    a.skillTree.topCtx.fill(),
                    a.skillTree.topCtx.stroke(),
                    a.skillTree.drawState.topDirty = !0
                })
            }
        }
    }
    ,
    r.prototype.begin = function() {
        var e = this;
        this.animations[n.In].fillColour.end = this.animations[n.Default].fillColour.start,
        setTimeout(function() {
            e.beginDefault()
        }, this.animations[n.In].speed)
    }
    ,
    r.prototype.beginDefault = function(e) {
        this.start = e || (new Date).getTime(),
        this.animationState = n.Default
    }
    ,
    r.prototype.end = function(t) {
        var r = e.Deferred()
          , i = this;
        return this.animationState = n.Out,
        this.animations[n.Out].fillColour.start = this.fillColour.clone(),
        this.animations[n.Out].strokeColour.start = this.strokeColour.clone(),
        this.start = (new Date).getTime(),
        setTimeout(function() {
            i.endImmediately(),
            r.resolve()
        }, this.animations[n.Out].speed),
        r.promise()
    }
    ,
    r.prototype.endImmediately = function() {
        this.skillTree.midDrawObjects.remove(this.drawObject)
    }
    ,
    r.prototype.copyStateFrom = function(e) {
        this.start = e.start,
        this.fillColour = e.fillColour.clone(),
        this.strokeColour = e.strokeColour.clone()
    }
    ,
    r.prototype.init = function(e) {
        e && e.animations && this.configAnimation(e.animations),
        this.fillColour = new t,
        this.strokeColour = new t,
        this.start = (new Date).getTime(),
        this.nodes = e.nodes || [],
        this.animationState = n.In,
        this.animations[n.In].fillColour.end = this.animations[n.Default].fillColour.start,
        this.animations[n.In].strokeColour.end = this.animations[n.Default].strokeColour.start;
        var r = this;
        this.drawObject = {
            draw: function() {
                r.draw()
            }
        },
        this.skillTree.midDrawObjects.add(this.drawObject, 10)
    }
    ,
    r.prototype.setNodes = function(e) {
        this.nodes = e
    }
    ,
    r.prototype.configAnimation = function(e) {
        if (!e)
            return;
        var t, r = function(e, t) {
            t.speed !== undefined && (e.speed = t.speed),
            t.fillColour && (t.fillColour.start && (e.fillColour.start = t.fillColour.start),
            t.fillColour.end && (e.fillColour.end = t.fillColour.end)),
            t.strokeColour && (t.strokeColour.start && (e.strokeColour.start = t.strokeColour.start),
            t.strokeColour.end && (e.strokeColour.end = t.strokeColour.end))
        };
        e && typeof e[n.Default] != "undefined" && r(this.animations[n.Default], e[n.Default]),
        e && typeof e[n.In] != "undefined" && r(this.animations[n.In], e[n.In]),
        e && typeof e[n.Out] != "undefined" && r(this.animations[n.Out], e[n.Out])
    }
    ,
    r
}),
define("PoE/PassiveSkillTree/NodeHighlighter/NodeHighlighterGroup", [], function() {
    var e = function(e) {
        this.init(e)
    };
    return e.prototype.foreachHighlighter = function(e) {
        for (var t = 0, n = this.highlighters.length; t < n; ++t)
            e(this.highlighters[t], t)
    }
    ,
    e.prototype.begin = function() {
        this.foreachHighlighter(function(e) {
            e.begin()
        })
    }
    ,
    e.prototype.beginDefault = function(e) {
        this.foreachHighlighter(function(t) {
            t.beginDefault(e)
        })
    }
    ,
    e.prototype.end = function() {
        var e = [];
        return this.foreachHighlighter(function(t) {
            e.push(t.end())
        }),
        $.when.apply(null, e)
    }
    ,
    e.prototype.endImmediately = function() {
        this.foreachHighlighter(function(e) {
            e.endImmediately()
        })
    }
    ,
    e.prototype.copyStateFrom = function(e) {
        this.foreachHighlighter(function(t, n) {
            t.copyStateFrom(e.getHighlighter(n))
        })
    }
    ,
    e.prototype.getHighlighter = function(e) {
        return this.highlighters[e]
    }
    ,
    e.prototype.init = function(e) {
        if (!e)
            return;
        this.highlighters = e.highlighters || []
    }
    ,
    e
}),
define("PoE/PassiveSkillTree/PassiveSkillTree", ["plugins", "PoE/Geom/Bounds", "PoE/Geom/Point", "PoE/PassiveSkillTree/ObjectList", "PoE/PassiveSkillTree/EventContainer", "PoE/PassiveSkillTree/PassiveAllocation", "PoE/PassiveSkillTree/JewelAllocation", "PoE/PassiveSkillTree/Stats", "PoE/PassiveSkillTree/Node", "PoE/PassiveSkillTree/Group", "PoE/PassiveSkillTree/Tile", "PoE/PassiveSkillTree/Clickable", "PoE/PassiveSkillTree/PathHighlighterGroup", "PoE/PassiveSkillTree/Popup", "PoE/PassiveSkillTree/BFS/NodeData", "PoE/PassiveSkillTree/ByteDecoder", "PoE/PassiveSkillTree/ByteEncoder", "PoE/PassiveSkillTree/NodeHighlighter/NodeHighlighter", "PoE/PassiveSkillTree/NodeHighlighter/AnimationType", "PoE/PassiveSkillTree/NodeHighlighter/NodeHighlighterGroup", "PoE/PassiveSkillTree/RGBA", "PoE/Helpers", "PoE/Item/Item", "PoE/Backbone/Model/Item/Item", "PoE/PassiveSkillTree/GenerateLink", "PoE/PassiveSkillTree/Version"], function(e, t, n, r, i, s, o, u, a, f, l, c, h, p, d, v, m, g, y, b, w, E, S, x, T, N) {
    var C = function(m, y, w, S, x, N, k, L) {
        this.init = function() {
            var a = !1;
            e("body").hasClass("tencent") && (a = !0),
            this.containerEl = e("#" + m);
            if (!this.isCanvasSupported()) {
                var f = "https://www.google.com/chrome/"
                  , l = "http://www.mozilla.org/firefox/"
                  , c = "http://www.apple.com/safari/"
                  , h = "http://www.opera.com/download/";
                a && (f = "http://www.google.cn/intl/zh-CN/chrome/",
                l = "http://www.firefox.com.cn/",
                c = "http://www.apple.com/cn/safari/",
                h = "http://www.opera.com/zh-cn"),
                this.containerEl.append('<h1 class="error">' + E.translate("The Passive Skill Tree requires a browser that supports canvas.") + "</h1>" + '<p class="error m-pad">If you are running Internet Explorer you need at least version 9. If you are running Internet Explorer 9 and get this message, please make sure compatibility view is disabled.<br /><br />' + "You may need to upgrade your browser. Some other browsers that work with the passive skill tree are: " + '<a href="' + f + '">Chrome</a>, <a href="' + l + '">Firefox</a>, <a href="' + c + '">Safari</a> ' + E.translate("and") + ' <a href="' + h + '">Opera</a>.' + "</p>");
                return
            }
            var p = this;
            this.fullscreenContainerEl = e("#" + y);
            if (!L || !L.events || !L.events.fullscreen)
                this.containerEl.width(w),
                this.containerEl.height(S);
            this.totW = 1e3,
            this.totH = 1e3,
            this.xshift = Math.ceil(this.totW / 2),
            this.yshift = Math.ceil(this.totH / 2),
            this.accountName = !1,
            this.characterName = !1,
            this.characterClass = !1,
            this.ascendancyClass = !1,
            this.ascendancyClasses = L.ascClasses,
            this.ascendancyClassPopupHidden = !0,
            this.ascendancyStartNode = !1,
            this.ascendancyButton = {
                state: "PassiveSkillScreenAscendancyButton",
                clickable: !1
            },
            this.initialWidth = w,
            this.initialHeight = S,
            this.canvas = document.createElement("canvas"),
            this.lastQuery = "",
            !L || !L.events || !L.events.fullscreen ? (this.canvas.width = w,
            this.canvas.height = S) : (this.canvas.width = window.innerWidth,
            this.canvas.height = window.innerHeight),
            this.containerEl.append(this.canvas),
            this.$window = e(window),
            this.$bodyEl = e("body"),
            this.$canvas = e(this.canvas),
            this.$canvas.attr("id", "skillTreeMainCanvas"),
            this.ctx = this.canvas.getContext("2d"),
            this.midCanvas = document.createElement("canvas"),
            this.containerEl.append(this.midCanvas),
            this.$midCanvas = e(this.midCanvas),
            this.$midCanvas.attr("id", "skillTreeMidCanvas"),
            this.midCanvas.width = this.canvas.width,
            this.midCanvas.height = this.canvas.height,
            this.midCtx = this.midCanvas.getContext("2d"),
            this.topCanvas = document.createElement("canvas"),
            this.$topCanvas = e(this.topCanvas),
            this.$topCanvas.attr("id", "skillTreeTopCanvas"),
            this.containerEl.append(this.topCanvas),
            this.topCanvas.width = this.canvas.width,
            this.topCanvas.height = this.canvas.height,
            this.topCtx = this.topCanvas.getContext("2d"),
            this.scaleFactor = this.canvas.height / 1600,
            this.fps = 30,
            this.skillsPerOrbit = [1, 6, 12, 12, 40],
            this.orbitRadii = [0, 82, 162, 335, 493],
            this.nodeRadius = 51,
            this.nodeRadiusKeystone = 109,
            this.nodeRadiusNotable = 70,
            this.nodeRadiusJewel = 70,
            this.nodeRadiusMastery = 107,
            this.nodeRadiusClassStart = 200,
            this.groups = {},
            this.nodes = {},
            this.extent = new t,
            this.tileSize = 512,
            this.tiles = [],
            this.finalDrawFuncs = [],
            this.popupId = 0,
            this.popups = {},
            this.assets = {},
            this.characterData = k.characterData,
            this.constants = k.constants,
            this.imageZoomLevels = k.imageZoomLevels,
            this.skillSprites = k.skillSprites,
            this.characterClassToStartNode = {},
            this.ascendancyClassToStartNode = {},
            this.readonly = !1,
            this.fullScreen = !1,
            this.errorMessage = null,
            this.settings = {
                highlightSimilarNodes: !1,
                highlightShortestPaths: !1,
                enableSound: !1
            },
            this.mousePos = new n(-1,-1),
            this.midDrawObjects = new r,
            this.events = {
                classChosen: function() {},
                historyUrlSet: function(e) {},
                pointsChanged: new i,
                onload: function() {},
                onFullScreenUpdate: function() {},
                onFullScreenBegin: function() {},
                onFullScreenEnd: function() {}
            },
            this.characterAttributes = [0, 0, 0],
            this.searchHighlighter = null,
            this.initializationComplete = e.Deferred(),
            this.loadCounter = 0,
            L && (L.events && (L.events.classChosen && (this.events.classChosen = L.events.classChosen),
            L.events.historyUrlSet && (this.events.historyUrlSet = L.events.historyUrlSet),
            L.events.pointsChanged && this.events.pointsChanged.add(L.events.pointsChanged),
            L.events.onload && (this.events.onload = L.events.onload),
            L.events.onFullScreenUpdate && (this.events.onFullScreenUpdate = L.events.onFullScreenUpdate),
            L.events.onFullScreenBegin && (this.events.onFullScreenBegin = L.events.onFullScreenBegin),
            L.events.onFullScreenEnd && (this.events.onFullScreenEnd = L.events.onFullScreenEnd)),
            L.readonly && (this.readonly = !0)),
            this.passiveAllocation = new s(this),
            this.passiveAllocation.passiveAllocated = function(e) {
                p.drawState.dirty = !0,
                p.drawState.topDirty = !0,
                p.stats.addAttribute(p.constants.characterAttributes.Strength, e.sa),
                p.stats.addAttribute(p.constants.characterAttributes.Dexterity, e.da),
                p.stats.addAttribute(p.constants.characterAttributes.Intelligence, e.ia)
            }
            ,
            this.passiveAllocation.passiveUnallocated = function(e) {
                p.drawState.dirty = !0,
                p.drawState.topDirty = !0,
                p.stats.subAttribute(p.constants.characterAttributes.Strength, e.sa),
                p.stats.subAttribute(p.constants.characterAttributes.Dexterity, e.da),
                p.stats.subAttribute(p.constants.characterAttributes.Intelligence, e.ia)
            }
            ,
            this.jewelAllocation = new o(this),
            this.jewelAllocation.jewelAllocated = function(e) {
                p.drawState.dirty = !0,
                p.drawState.topDirty = !0
            }
            ,
            this.jewelAllocation.jewelUnallocated = function(e) {
                p.drawState.dirty = !0,
                p.drawState.topDirty = !0
            }
            ,
            this.stats = new u,
            this.stats.statsChanged = function() {}
            ,
            this.drawState = {
                dirty: !0,
                topDirty: !0,
                dirtyFullRedraw: !0,
                cancelInProgress: !1,
                active: !1,
                idle: !0,
                lastFrame: null
            },
            this.worldToView = function(e) {}
            ;
            var d = this.initAssets();
            p.initLoadingRenderLoop(),
            d.done(function() {
                p.initGraph(),
                p.initViewPort(),
                p.initListeners(),
                p.initKeyListeners(),
                p.initMouseListeners(),
                p.initTileGrid(),
                p.setCharacterClass(x),
                p.loadBaseCharacterAttributes(),
                p.endLoadingRenderLoop(),
                p.events.pointsChanged.trigger(),
                p.events.onload(),
                p.initRenderLoop(),
                p.initializationComplete.resolve()
            }),
            window.onpopstate = function(e) {
                if (e.state === null)
                    return;
                p.loadStateFromUrl()
            }
        }
        ,
        this.toggleFullScreen = function(e) {
            if (window.top.location != document.location) {
                if (this.fullScreen)
                    return;
                this.fullScreen = !0
            } else
                this.fullScreen = !this.fullScreen;
            this.$bodyEl.css("overflow", this.fullScreen ? "hidden" : "visible"),
            this.updateCanvasSize(),
            this.fullScreen ? (this.fullscreenContainerEl.append(this.canvas).append(this.midCanvas).append(this.topCanvas),
            this.events.onFullScreenBegin()) : (this.containerEl.append(this.canvas).append(this.midCanvas).append(this.topCanvas),
            this.events.onFullScreenEnd()),
            e || this.pushHistoryState()
        }
        ,
        this.updateCanvasSize = function() {
            if (this.fullScreen) {
                var e = this.events.onFullScreenUpdate() || {
                    top: "0px",
                    left: "0px",
                    width: this.$window.width(),
                    height: this.$window.height()
                };
                this.$canvas.css("position", "fixed").css("top", e.top).css("left", e.left),
                this.$midCanvas.css("position", "fixed").css("top", e.top).css("left", e.left),
                this.$topCanvas.css("position", "fixed").css("top", e.top).css("left", e.left),
                this.canvas.width = e.width,
                this.canvas.height = e.height,
                this.midCanvas.width = e.width,
                this.midCanvas.height = e.height,
                this.topCanvas.width = e.width,
                this.topCanvas.height = e.height
            } else
                this.$canvas.css("position", "absolute"),
                this.$midCanvas.css("position", "absolute"),
                this.$topCanvas.css("position", "absolute"),
                this.canvas.width = this.initialWidth,
                this.canvas.height = this.initialHeight,
                this.midCanvas.width = this.initialWidth,
                this.midCanvas.height = this.initialHeight,
                this.topCanvas.width = this.initialWidth,
                this.topCanvas.height = this.initialHeight;
            this.forceMouseOut(),
            this.initTileGrid(),
            this.viewPort.recalcBounds(),
            this.drawState.dirtyFullRedraw = !0,
            this.drawState.dirty = !0,
            this.drawState.topDirty = !0
        }
        ,
        this.isCanvasSupported = function() {
            var e = document.createElement("canvas");
            return !!e.getContext && !!e.getContext("2d")
        }
        ,
        this.isAudioSupported = function() {
            var e = document.createElement("audio");
            return e.canPlayType && e.canPlayType('audio/ogg; codecs="vorbis"')
        }
        ,
        this.isHistorySupported = function() {
            return !!window.history && !!history.pushState
        }
        ,
        this.loadStateFromUrl = function() {
            var e = window.location.href
              , t = this;
            this.initializationComplete.done(function() {
                if (window.location.search != "") {
                    var n = E.getUrlParameter("accountName")
                      , r = E.getUrlParameter("characterName");
                    n && r && (t.accountName = n,
                    t.characterName = r),
                    e = e.substring(0, e.indexOf(window.location.search))
                }
                var i = e.split("/")
                  , s = i[i.length - 1]
                  , o = i[i.length - 2];
                if (s == "passive-skill-tree" || s == "" && o == "passive-skill-tree")
                    return;
                t.loadHistoryUrl(s == "" ? o : s)
            })
        }
        ,
        this.loadBaseCharacterAttributes = function() {
            this.stats.setAttribute(this.constants.characterAttributes.Strength, this.characterData[this.characterClass].base_str),
            this.stats.setAttribute(this.constants.characterAttributes.Dexterity, this.characterData[this.characterClass].base_dex),
            this.stats.setAttribute(this.constants.characterAttributes.Intelligence, this.characterData[this.characterClass].base_int)
        }
        ,
        this.pushHistoryState = function() {
            if (!this.isHistorySupported())
                return;
            var e = this.getHistoryUrl();
            window.history.pushState({}, "", e),
            this.events.historyUrlSet(e)
        }
        ,
        this.fullRedraw = function() {
            this.drawState.dirty = !0,
            this.drawState.dirtyFullRedraw = !0
        }
        ,
        this.reset = function(e) {
            this.passiveAllocation.reset(),
            e && e.characterClass >= 0 && this.setCharacterClass(e.characterClass, e.ascendancyClass),
            this.lastQuery && this.lastQuery != "" && this.highlightSearchQuery(this.lastQuery),
            this.pushHistoryState(),
            this.fullRedraw()
        }
        ,
        this.setCharacterClass = function(e, t) {
            this.characterClass = e,
            t || (t = 0),
            this.setAscendancyClass(t),
            this.startNode && (this.startNode.active = !1),
            this.ascendancyStartNode && (this.ascendancyStartNode.active = !1),
            this.startNode = this.characterClassToStartNode[e],
            this.startNode.active = !0,
            this.ascendancyClass && this.ascendancyClass > 0 && (this.ascendancyStartNode = this.ascendancyClassToStartNode[this.ascendancyClassName()],
            this.ascendancyStartNode.active = !0),
            this.viewPort.setPosition(this.getNodePositionInfo(this.startNode).position),
            this.loadBaseCharacterAttributes(),
            this.events.classChosen(e)
        }
        ,
        this.setAscendancyClass = function(e) {
            this.ascendancyClass = e,
            e <= 0 && (this.ascendancyClassPopupHidden = !0)
        }
        ,
        this.loadCharacterData = function(e, t, n) {
            this.passiveAllocation.reset(),
            this.setCharacterClass(e, t),
            this.passiveAllocation.loadHashArray(n),
            this.jewelAllocation.loadJewels(this),
            this.events.historyUrlSet(this.getHistoryUrl()),
            this.fullRedraw()
        }
        ,
        this.drawArc = function(e, t, n, r, i, s) {
            var o = i - r
              , u = o / (Math.PI / 2)
              , a = o;
            e.save(),
            e.translate(Math.round(n.x), Math.round(n.y)),
            e.scale(s, s),
            e.rotate(-Math.PI),
            e.rotate(r);
            for (var f = 0, l = Math.ceil(u); f < l; ++f) {
                if (a < Math.PI / 2) {
                    e.beginPath(),
                    e.lineWidth = 4,
                    e.fillStyle = "rgba(200,0,0,.5)",
                    e.strokeStyle = "rgba(150,150,0,.8)",
                    e.moveTo(0, 0),
                    e.arc(0, 0, t.width, Math.PI, a + Math.PI, !1),
                    e.clip(),
                    e.drawImage(t, 0, 0, t.width, t.height, -t.width, -t.height, t.width, t.height);
                    continue
                }
                e.drawImage(t, 0, 0, t.width, t.height, -t.width, -t.height, t.width, t.height),
                e.rotate(Math.PI / 2),
                a -= Math.PI / 2
            }
            e.restore()
        }
        ,
        this.drawStraightPath = function(e, t, n, r, i, s, o) {
            var u = function(e, t, n) {
                return (1 - e) * t.x + e * n.x
            }
              , a = function(e, t, n) {
                return (1 - e) * t.y + e * n.y
            }
              , f = n.distTo(r)
              , l = t.width * i
              , c = f
              , h = f / l
              , p = 1 / h
              , d = n.angleTo(r)
              , v = 0;
            for (var m = 0, g = Math.ceil(h); m < g; ++m) {
                var y = t.width;
                c < l && (y *= c / l),
                e.save(),
                e.translate(Math.round(u(v, n, r)), Math.round(a(v, n, r))),
                e.scale(i, i),
                e.rotate(d),
                e.drawImage(t, 0, Math.round(-(t.height / 2)), Math.round(y), t.height),
                e.restore(),
                v += p,
                c -= l
            }
            if (s !== undefined) {
                var b = s.height * i
                  , w = Math.round(s.width * i)
                  , E = Math.round(b / 2);
                b = Math.round(b),
                e.save(),
                e.translate(Math.round(n.x), Math.round(n.y)),
                e.rotate(d),
                e.drawImage(s, o, -E, w, b),
                e.restore(),
                e.save(),
                e.translate(Math.round(r.x), Math.round(r.y)),
                e.rotate(d + Math.PI),
                e.drawImage(s, o, -E, w, b),
                e.restore()
            }
        }
        ,
        this.initAssets = function() {
            var t = []
              , n = this
              , r = function(e, r) {
                var i = n.loadWaitAsset(e, r);
                ++n.loadCounter,
                i.done(function() {
                    --n.loadCounter
                }),
                t.push(i)
            };
            r(k.assets.PSSkillFrame, "PSSkillFrame"),
            r(k.assets.PSSkillFrameHighlighted, "PSSkillFrameHighlighted"),
            r(k.assets.PSSkillFrameActive, "PSSkillFrameActive"),
            r(k.assets.PSGroupBackground1, "PSGroupBackground1"),
            r(k.assets.PSGroupBackground2, "PSGroupBackground2"),
            r(k.assets.PSGroupBackground3, "PSGroupBackground3"),
            r(k.assets.KeystoneFrameUnallocated, "KeystoneFrameUnallocated"),
            r(k.assets.KeystoneFrameCanAllocate, "KeystoneFrameCanAllocate"),
            r(k.assets.KeystoneFrameAllocated, "KeystoneFrameAllocated"),
            r(k.assets.Orbit1Normal, "Orbit1Normal"),
            r(k.assets.Orbit1Intermediate, "Orbit1Intermediate"),
            r(k.assets.Orbit1Active, "Orbit1Active"),
            r(k.assets.Orbit2Normal, "Orbit2Normal"),
            r(k.assets.Orbit2Intermediate, "Orbit2Intermediate"),
            r(k.assets.Orbit2Active, "Orbit2Active"),
            r(k.assets.Orbit3Normal, "Orbit3Normal"),
            r(k.assets.Orbit3Intermediate, "Orbit3Intermediate"),
            r(k.assets.Orbit3Active, "Orbit3Active"),
            r(k.assets.Orbit4Normal, "Orbit4Normal"),
            r(k.assets.Orbit4Intermediate, "Orbit4Intermediate"),
            r(k.assets.Orbit4Active, "Orbit4Active"),
            r(k.assets.LineConnectorNormal, "LineConnectorNormal"),
            r(k.assets.LineConnectorIntermediate, "LineConnectorIntermediate"),
            r(k.assets.LineConnectorActive, "LineConnectorActive"),
            r(k.assets.PSLineDeco, "PSLineDeco"),
            r(k.assets.PSLineDecoHighlighted, "PSLineDecoHighlighted"),
            r(k.assets.PSStartNodeBackgroundInactive, "PSStartNodeBackgroundInactive"),
            r(k.assets.PSStartNodeBackgroundInactive, "PSStartNodeBackgroundInactive"),
            r(k.assets.centerduelist, "centerduelist"),
            r(k.assets.centermarauder, "centermarauder"),
            r(k.assets.centerranger, "centerranger"),
            r(k.assets.centershadow, "centershadow"),
            r(k.assets.centertemplar, "centertemplar"),
            r(k.assets.centerwitch, "centerwitch"),
            r(k.assets.centerscion, "centerscion"),
            r(k.assets.Background1, "Background1"),
            r(k.assets.NotableFrameUnallocated, "NotableFrameUnallocated"),
            r(k.assets.NotableFrameCanAllocate, "NotableFrameCanAllocate"),
            r(k.assets.NotableFrameAllocated, "NotableFrameAllocated"),
            r(k.assets.JewelFrameUnallocated, "JewelFrameUnallocated"),
            r(k.assets.JewelFrameCanAllocate, "JewelFrameCanAllocate"),
            r(k.assets.JewelFrameAllocated, "JewelFrameAllocated"),
            r(k.assets.JewelSocketActiveBlue, "JewelSocketActiveBlue"),
            r(k.assets.JewelSocketActiveGreen, "JewelSocketActiveGreen"),
            r(k.assets.JewelSocketActiveRed, "JewelSocketActiveRed");
            var i = ["PassiveSkillScreenAscendancyButton", "PassiveSkillScreenAscendancyButtonHighlight", "PassiveSkillScreenAscendancyButtonPressed", "PassiveSkillScreenAscendancyFrameLargeAllocated", "PassiveSkillScreenAscendancyFrameLargeCanAllocate", "PassiveSkillScreenAscendancyFrameLargeNormal", "PassiveSkillScreenAscendancyFrameSmallAllocated", "PassiveSkillScreenAscendancyFrameSmallCanAllocate", "PassiveSkillScreenAscendancyFrameSmallNormal", "PassiveSkillScreenAscendancyMiddle"];
            for (var s in this.ascendancyClasses)
                for (var o in this.ascendancyClasses[s].classes)
                    i.push("Classes" + this.ascendancyClasses[s].classes[o].name);
            for (var u in i)
                i.hasOwnProperty(u) && r(k.assets[i[u]], i[u]);
            r(k.assets.PSPointsFrame, "PSPointsFrame"),
            r(k.assets.imgPSFadeCorner, "imgPSFadeCorner"),
            r(k.assets.imgPSFadeSide, "imgPSFadeSide");
            for (var a in this.skillSprites) {
                k.assets[a] = {};
                for (var s = 0, f = this.skillSprites[a].length; s < f; ++s)
                    k.assets[a][this.imageZoomLevels[s]] = k.imageRoot + "/build-gen/passive-skill-sprite/" + this.skillSprites[a][s].filename;
                r(k.assets[a], a)
            }
            return e.when.apply(null, t)
        }
        ,
        this.loadWaitAsset = function(t, n) {
            var r = this
              , i = function(t, n, i) {
                var s = new Image
                  , o = e.Deferred();
                return s.onload = function() {
                    i === undefined ? r.assets[n] = s : (r.assets[n] === undefined && (r.assets[n] = {}),
                    r.assets[n][i] = s),
                    o.resolve()
                }
                ,
                s.src = t,
                o.promise()
            };
            if (typeof t == "object") {
                var s = [];
                for (var o in t)
                    s.push(i(t[o], n, o));
                return e.when.apply(null, s)
            }
            return i(t, n)
        }
        ,
        this.endLoadingRenderLoop = function() {
            clearInterval(this.loadingRenderLoopIntervalId)
        }
        ,
        this.initLoadingRenderLoop = function() {
            var e = this
              , t = this.loadCounter;
            this.loadingRenderLoopIntervalId = setInterval(function() {
                var n = t == 0 ? 1 : (t - e.loadCounter) / t;
                e.drawLoading(n)
            }, 1e3 / this.fps)
        }
        ,
        this.initRenderLoop = function() {
            var e = this;
            setInterval(function() {
                e.draw()
            }, 1e3 / this.fps)
        }
        ,
        this.initGraph = function() {
            this.rootNode = new a(k.root);
            for (var e = 0, t = k.nodes.length; e < t; ++e) {
                var r = k.nodes[e]
                  , i = new a(r);
                this.addNode(i);
                if (this.startNode === undefined)
                    for (var s = 0, o = i.startPositionClasses.length; s < o; ++s) {
                        var u = i.startPositionClasses[s];
                        this.characterClassToStartNode[u] = i,
                        u === this.characterClass && (this.startNode = i,
                        i.active = !0)
                    }
                i.isAscendancyStartNode && (this.ascendancyClassToStartNode[i.ascendancyName] = i,
                this.ascendancyClassName() && this.ascendancyClassName() == i.ascendancyName && (this.ascendancyStartNode = i))
            }
            for (var s = 0, o = k.root.out.length; s < o; ++s)
                this.rootNode.addOutNode(this.getNode(k.root.out[s]));
            for (var e = 0, t = k.nodes.length; e < t; ++e) {
                var r = k.nodes[e]
                  , i = this.getNode(r.id);
                for (var s = 0, o = r.out.length; s < o; ++s)
                    i.addOutNode(this.getNode(r.out[s]))
            }
            for (var l in k.groups) {
                var c = k.groups[l]
                  , h = new f(l,new n(c.x,c.y),c.oo);
                for (var e = 0, t = c.n.length; e < t; ++e) {
                    var i = this.getNode(c.n[e]);
                    i.isAscendancy && (h.isAscendancy = !0,
                    h.ascendancyName = i.ascendancyName),
                    h.addNode(i)
                }
                this.addGroup(h)
            }
            this.extent.tl.x = k.min_x,
            this.extent.tl.y = k.min_y,
            this.extent.br.x = k.max_x,
            this.extent.br.y = k.max_y,
            this.extent.grow(this.getOrbitRadius(4) * 3),
            this.defaultExtent = this.extent.clone()
        }
        ,
        this.getShortestPathsFromActiveNodes = function(e) {
            var t = this.characterClassToStartNode[this.characterClass]
              , n = this
              , r = -1
              , i = []
              , s = function(t) {
                n.visitBFS(t, function(t) {
                    return t === e
                }, function(e) {
                    return !n.passiveAllocation.isAllocated(e) && !e.isClassStartNode && !e.isAscendancy
                }, function(e, t) {
                    i.push({
                        goalNodeData: e,
                        nodeRelationshipData: t
                    });
                    if (r == -1 || e.depth < r)
                        r = e.depth;
                    for (var n = i.length - 1; n >= 0; --n)
                        i[n].goalNodeData.depth > r && i.splice(n, 1)
                })
            };
            return s(this.startNode),
            this.passiveAllocation.foreachAllocatedSkill(s),
            i
        }
        ,
        this.recalculateExtent = function() {
            this.extent = this.defaultExtent.clone();
            var e = this.canvas.width / this.viewPort.zoom
              , t = this.canvas.height / this.viewPort.zoom;
            this.extent.width() < e && this.extent.width(e),
            this.extent.height() < t && this.extent.height(t),
            this.extent.centerAt(new n)
        }
        ,
        this.initTileGrid = function() {
            this.grid = {},
            this.grid.xTiles = Math.ceil(this.extent.width() * this.viewPort.zoom / this.tileSize) + 1,
            this.grid.yTiles = Math.ceil(this.extent.height() * this.viewPort.zoom / this.tileSize) + 1,
            this.grid.tiles = [];
            for (var e = 0; e < this.grid.yTiles; ++e) {
                this.grid.tiles[e] = [];
                for (var t = 0; t < this.grid.xTiles; ++t)
                    this.grid.tiles[e][t] = new l
            }
        }
        ,
        this.calcTileGrid = function() {
            this.grid.lExtentToLVisGridOffsetPx = (this.viewPort.bounds.tl.x - this.extent.tl.x) * this.viewPort.zoom,
            this.grid.tExtentToTVisGridOffsetPx = (this.viewPort.bounds.tl.y - this.extent.tl.y) * this.viewPort.zoom,
            this.grid.lExtentToRVisGridOffsetPx = (this.viewPort.bounds.br.x - this.extent.tl.x) * this.viewPort.zoom,
            this.grid.tExtentToBVisGridOffsetPx = (this.viewPort.bounds.br.y - this.extent.tl.y) * this.viewPort.zoom,
            this.grid.lExtentToLVisGridOffsetTiles = this.grid.lExtentToLVisGridOffsetPx / this.tileSize,
            this.grid.tExtentToTVisGridOffsetTiles = this.grid.tExtentToTVisGridOffsetPx / this.tileSize,
            this.grid.lExtentToRVisGridOffsetTiles = this.grid.lExtentToRVisGridOffsetPx / this.tileSize,
            this.grid.tExtentToBVisGridOffsetTiles = this.grid.tExtentToBVisGridOffsetPx / this.tileSize,
            this.grid.visGridWidthTiles = this.grid.lExtentToRVisGridOffsetTiles - this.grid.lExtentToLVisGridOffsetTiles,
            this.grid.visGridHeightTiles = this.grid.tExtentToBVisGridOffsetTiles - this.grid.tExtentToTVisGridOffsetTiles,
            this.grid.visGridStartXTilePos = Math.floor(this.grid.lExtentToLVisGridOffsetTiles),
            this.grid.visGridStartYTilePos = Math.floor(this.grid.tExtentToTVisGridOffsetTiles),
            this.grid.visGridXTileviewPortShift = this.grid.lExtentToLVisGridOffsetTiles - this.grid.visGridStartXTilePos,
            this.grid.visGridYTileviewPortShift = this.grid.tExtentToTVisGridOffsetTiles - this.grid.visGridStartYTilePos,
            this.grid.drawTileW = Math.ceil(this.grid.visGridWidthTiles) + Math.ceil(this.grid.visGridXTileviewPortShift),
            this.grid.drawTileH = Math.ceil(this.grid.visGridHeightTiles) + Math.ceil(this.grid.visGridYTileviewPortShift),
            this.grid.visGridXviewPortShift = this.grid.visGridXTileviewPortShift * this.tileSize,
            this.grid.visGridYviewPortShift = this.grid.visGridYTileviewPortShift * this.tileSize
        }
        ,
        this.initViewPort = function() {
            this.viewPort = {
                skillTree: this,
                position: new n,
                bounds: new t,
                moveStartView: null,
                moveStartWorld: null,
                zoomLevels: N,
                zoomIndex: 0,
                zoom: N[0]
            };
            var e = this;
            this.viewPort.zoomIn = function() {
                if (this.zoomIndex == this.zoomLevels.length - 1)
                    return;
                ++this.zoomIndex,
                this.zoom = this.zoomLevels[this.zoomIndex],
                this.recalcBounds()
            }
            ,
            this.viewPort.zoomOut = function() {
                if (this.zoomIndex <= 0)
                    return;
                --this.zoomIndex,
                this.zoom = this.zoomLevels[this.zoomIndex],
                this.recalcBounds()
            }
            ,
            this.viewPort.recalcBounds = function() {
                var t = !1;
                this.skillTree.recalculateExtent(),
                this.bounds.width(this.skillTree.canvas.width / this.zoom),
                this.bounds.height(this.skillTree.canvas.height / this.zoom),
                this.bounds.centerAt(this.position),
                this.bounds.br.x > e.extent.br.x && (this.position.x = e.extent.br.x - this.bounds.width() / 2,
                t = !0),
                this.bounds.br.y > e.extent.br.y && (this.position.y = e.extent.br.y - this.bounds.height() / 2,
                t = !0),
                this.bounds.tl.x < e.extent.tl.x && (this.position.x = e.extent.tl.x + this.bounds.width() / 2,
                t = !0),
                this.bounds.tl.y < e.extent.tl.y && (this.position.y = e.extent.tl.y + this.bounds.height() / 2,
                t = !0),
                t && this.bounds.centerAt(this.position)
            }
            ,
            this.viewPort.beginMove = function(e, t) {
                this.moveStartView = new n(e,t),
                this.moveStartWorld = this.position.clone()
            }
            ,
            this.viewPort.endMove = function() {
                this.moveStartView = null,
                this.moveStartWorld = null
            }
            ,
            this.viewPort.updateMove = function(e, t) {
                return this.moveStartView === null || this.moveStartView.x == e && this.moveStartView.y == t ? !1 : (this.position = this.moveStartWorld.clone(),
                this.position.translateX((this.moveStartView.x - e) / this.zoom),
                this.position.translateY((this.moveStartView.y - t) / this.zoom),
                this.recalcBounds(),
                !0)
            }
            ,
            this.viewPort.setPosition = function(e) {
                this.position = e,
                this.recalcBounds()
            }
            ,
            this.viewPort.recalcBounds()
        }
        ,
        this.initListeners = function() {
            var e = this;
            this.$window.resize(function() {
                e.fullScreen && e.updateCanvasSize()
            })
        }
        ,
        this.initKeyListeners = function() {
            var e = this;
            this.$window.keypress(function(t) {
                switch (t.which) {
                case 61:
                    e.viewPort.zoomIn(),
                    e.initTileGrid(),
                    e.drawState.dirty = !0,
                    e.trigMouseMoveHandler();
                    break;
                case 45:
                    e.viewPort.zoomOut(),
                    e.initTileGrid(),
                    e.drawState.dirty = !0,
                    e.trigMouseMoveHandler();
                    break;
                case 102:
                    e.toggleFullScreen()
                }
            })
        }
        ,
        this.clickHandler = function(e, t) {
            var n = {
                x: e,
                y: t,
                worldPosition: this.getScreenWorldPosition(e, t)
            };
            this.foreachClickable(function(e) {
                return e.onclickTest(n)
            })
        }
        ,
        this.trigMouseMoveHandler = function() {
            this.mouseMoveHandler(this.mousePos.x, this.mousePos.y)
        }
        ,
        this.mouseLeaveHander = function() {
            this.mouseUpHandler()
        }
        ,
        this.mouseUpHandler = function() {
            this.viewPort.endMove(),
            this.drawState.dirty = !0
        }
        ,
        this.mouseMoveHandler = function(e, t) {
            var n = {
                x: e,
                y: t,
                worldPosition: this.getScreenWorldPosition(e, t)
            };
            this.foreachClickable(function(e) {
                e.onmousemoveTest(n),
                e.onmouseoutTest(n)
            })
        }
        ,
        this.forceMouseOut = function() {
            this.foreachClickable(function(e) {
                return e.forceMouseOut()
            })
        }
        ,
        this.foreachVisibleGridTile = function(e) {
            for (var t = 0; t < this.grid.drawTileW; ++t)
                for (var n = 0; n < this.grid.drawTileH; ++n) {
                    var r = t + this.grid.visGridStartXTilePos
                      , i = n + this.grid.visGridStartYTilePos;
                    if (e.call(this, this.grid.tiles[i][r], r, i, t, n) === !0)
                        return
                }
        }
        ,
        this.initMouseListeners = function() {
            var t = this;
            this.$topCanvas.on("mouseout", function() {
                t.mouseLeaveHander()
            }),
            this.$topCanvas.mousedown(function(e) {
                var n = t.$topCanvas.offset();
                e.preventDefault(),
                t.viewPort.beginMove(e.pageX, e.pageY),
                t.clickHandler(e.pageX - n.left, e.pageY - n.top)
            }),
            this.$topCanvas.mouseup(function() {
                t.mouseUpHandler()
            }),
            this.$topCanvas.mousemove(function(e) {
                var n = t.$topCanvas.offset();
                t.mousePos.x = e.pageX - n.left,
                t.mousePos.y = e.pageY - n.top,
                t.trigMouseMoveHandler(),
                t.viewPort.updateMove(e.pageX, e.pageY) && (t.drawState.dirty = !0)
            }),
            this.$topCanvas.mouseout(function(e) {
                t.forceMouseOut()
            }),
            e(this.$topCanvas).bind("mousewheel", function(e, n) {
                for (var r = 0; r < n; ++r)
                    t.viewPort.zoomIn();
                for (var r = 0; r > n; --r)
                    t.viewPort.zoomOut();
                return t.initTileGrid(),
                t.trigMouseMoveHandler(),
                t.drawState.dirty = !0,
                !1
            })
        }
        ,
        this.drawDebug = function() {
            this.ctx.fillStyle = "rgb(20,200,20)",
            this.ctx.font = "10pt Arial",
            this.ctx.fillText("Zoom: " + this.viewPort.zoom, 10, 60)
        }
        ,
        this.drawDebugGridInfo = function() {
            this.ctx.fillStyle = "rgb(20,200,20)",
            this.ctx.font = "10pt Arial";
            var e = 60
              , t = 30;
            this.ctx.fillText("Visible grid | Tile W: " + this.grid.visGridWidthTiles + ", Tile H: " + this.grid.visGridWidthTiles + ", XS: " + this.grid.visGridXviewPortShift + ", YS: " + this.grid.visGridYviewPortShift, 10, e += t),
            this.ctx.fillText("Visible grid | Start X Tile: " + this.grid.visGridStartXTilePos + ", Start Y Tile: " + this.grid.visGridStartYTilePos, 10, e += t),
            this.ctx.fillText("Draw grid | W: " + this.grid.drawTileW + ", H: " + this.grid.drawTileH, 10, e += t),
            this.ctx.fillText("Grid | W: " + this.grid.tiles[0].length + ", H: " + this.grid.tiles.length, 10, e += t)
        }
        ,
        this.getCurrentImageZoomLevel = function() {
            var e = this.imageZoomLevels.length;
            for (var t = 0; t < e; ++t)
                if (this.viewPort.zoom <= this.imageZoomLevels[t])
                    return this.imageZoomLevels[t];
            return this.imageZoomLevels[e - 1]
        }
        ,
        this.loadImage = function(e, t) {
            var n = this
              , r = null;
            if (n.assets[e] !== undefined) {
                t(n.assets[e]);
                return
            }
            r = new Image,
            r.onload = function() {
                t(r),
                n.assets[e] = r
            }
            ,
            r.src = e
        }
        ,
        this.drawTile = function(e, r, i) {
            if (!e.dirty && !this.drawState.dirtyFullRedraw)
                return !1;
            e.canvas === null && (e.canvas = document.createElement("canvas"),
            e.canvas.width = this.tileSize,
            e.canvas.height = this.tileSize);
            var s = e.canvas
              , o = s.getContext("2d")
              , u = s.width
              , a = s.height
              , f = this.getCurrentImageZoomLevel()
              , l = i / f
              , c = this
              , h = new t;
            h.tl.x = r.x,
            h.tl.y = r.y,
            h.width(s.width / i),
            h.height(s.height / i);
            var p = h.clone();
            p.grow(this.getOrbitRadius(4) * 2 + 480),
            this.drawBackgroundTile(o, r, f, l),
            this.foreachGroup(function(e) {
                if (!p.contains(e.position))
                    return;
                var t = e.position.clone();
                t.inverseTranslate(h.tl),
                t.scale(i),
                e.isAscendancy || this.drawGroupBackground(o, e, t, f, l);
                var n = this;
                e.foreachNode(function(e) {
                    var t = n.getNodePositionInfo(e)
                      , r = t.position;
                    r.inverseTranslate(h.tl),
                    r.scale(i);
                    for (var s = 0, u = e.startPositionClasses.length; s < u; ++s)
                        n.drawStartNodeBackground(o, r, f, l, e.startPositionClasses[s]);
                    if (u > 0)
                        return
                })
            });
            var d = this.ascendancyStartNode.group;
            if (d && this.isAscendancyGroupEnabled(d)) {
                var v = c.getAscendancyPositionInfo();
                d.oldPos || (d.oldPos = d.position.clone()),
                d.position = new n(v.classArtImgPoint.x,v.classArtImgPoint.y)
            }
            return this.foreachGroup(function(e) {
                if (c.isAscendancyGroupEnabled(e) && e.id != d.id && !e.oldPos) {
                    e.oldPos = e.position.clone();
                    var t = new n(d.position.x - d.oldPos.x,d.position.y - d.oldPos.y);
                    e.position = new n(e.oldPos.x + t.x,e.oldPos.y + t.y)
                } else
                    e.isAscendancy || this.drawGroupNodePaths(e, o, h, p)
            }),
            this.foreachGroup(function(e) {
                if (!p.contains(e.position))
                    return;
                this.drawGroupNodes(e, o, i, f, l, h, function(e) {
                    return !e.isAscendancy
                })
            }),
            this.drawAscendancyClassBackground(o, h),
            this.drawAscendancyClassText(o, h),
            this.drawStartNodeAscendancyButton(o, h),
            this.foreachGroup(function(e) {
                c.isAscendancyGroupEnabled(e) && this.drawGroupNodePaths(e, o, h, p)
            }),
            this.foreachGroup(function(e) {
                c.isAscendancyGroupEnabled(e) && this.drawGroupNodes(e, o, i, f, l, h, function(t) {
                    return c.isAscendancyGroupEnabled(e)
                })
            }),
            e.dirty = !1,
            !0
        }
        ,
        this.drawGroupNodes = function(e, n, r, i, s, o, u) {
            var a = this;
            e.foreachNode(function(f) {
                if (!u(f))
                    return;
                var l = a.getNodePositionInfo(f, e)
                  , p = l.position.clone()
                  , d = l.position;
                d.inverseTranslate(o.tl),
                d.scale(r);
                if (f.startPositionClasses.length > 0)
                    return;
                var v = null;
                f.isMastery() ? v = "mastery" : f.notable ? v = "notable" + (f.active ? "Active" : "Inactive") : f.keyStone ? v = "keystone" + (f.active ? "Active" : "Inactive") : v = "normal" + (f.active ? "Active" : "Inactive");
                var m = a.skillSprites[v][a.viewPort.zoomIndex].coords[f.skill.icon];
                f.isAscendancyStartNode && (m = !1);
                if (m) {
                    var g = a.assets[v][i]
                      , y = m.w * s
                      , b = y / 2;
                    y = Math.round(y),
                    n.drawImage(g, m.x, m.y, m.w, m.h, Math.round(d.x - b), Math.round(d.y - b), y, y)
                }
                if (!f.isMastery()) {
                    var w = null;
                    f.isKeyStone() ? w = a.assets["KeystoneFrame" + (f.active ? "Allocated" : f.canAllocate ? "CanAllocate" : "Unallocated")][i] : f.notable ? f.isAscendancy ? w = a.assets["PassiveSkillScreenAscendancyFrameLarge" + (f.active ? "Allocated" : f.canAllocate ? "CanAllocate" : "Normal")][i] : w = a.assets["NotableFrame" + (f.active ? "Allocated" : f.canAllocate ? "CanAllocate" : "Unallocated")][i] : f.isAscendancyStartNode ? w = a.assets.PassiveSkillScreenAscendancyMiddle[i] : f.isAscendancy ? w = a.assets["PassiveSkillScreenAscendancyFrameSmall" + (f.active ? "Allocated" : f.canAllocate ? "CanAllocate" : "Normal")][i] : f.isJewel ? w = a.assets["JewelFrame" + (f.active ? "Allocated" : f.canAllocate ? "CanAllocate" : "Unallocated")][i] : f.active ? w = a.assets.PSSkillFrameActive[i] : f.canAllocate ? w = a.assets.PSSkillFrameHighlighted[i] : w = a.assets["PSSkillFrame" + (f.active ? "Active" : "")][i];
                    var E = w.width * s
                      , S = E / 2;
                    E = Math.round(E),
                    n.drawImage(w, 0, 0, w.width, w.height, Math.round(d.x - S), Math.round(d.y - S), E, E)
                }
                if (f.isJewel && f.isSocketedJewel()) {
                    var x = "JewelSocketActive";
                    f.skill.jewel.type == "JewelInt" ? x += "Blue" : f.skill.jewel.type == "JewelDex" ? x += "Green" : x += "Red";
                    var T = a.assets[x][i]
                      , E = T.width * s
                      , S = E / 2;
                    E = Math.round(E),
                    n.drawImage(T, 0, 0, T.width, T.height, Math.round(d.x - S), Math.round(d.y - S), E, E)
                }
                if (f.clickable === null && !f.isMastery()) {
                    var N = new t, C;
                    f.isKeyStone() ? C = a.nodeRadiusKeystone : f.isMastery() ? C = a.nodeRadiusMastery : C = a.nodeRadius,
                    N.tl.x = p.x - C,
                    N.tl.y = p.y - C,
                    N.br.x = p.x + C,
                    N.br.y = p.y + C;
                    var k = new c(N);
                    f.clickable = k,
                    k.onclick = function(e) {
                        a.drawState.dirty = !0,
                        a.drawState.dirtyFullRedraw = !0;
                        var t = !1;
                        f.active ? a.passiveAllocation.unallocate(f.skill.getHash()) && (t = !0) : a.passiveAllocation.allocate(f.skill.getHash(), !0) && (t = !0);
                        if (t && a.settings.highlightShortestPaths && f.pathHighlighterGroup !== null) {
                            f.pathHighlighterGroup.end();
                            var n = a.getShortestPathsFromActiveNodes(f);
                            f.pathHighlighterGroup = new h(a,n),
                            f.pathHighlighterGroup.begin()
                        }
                    }
                    ,
                    k.onmousemove = function(e) {
                        var t = e.x
                          , n = e.y;
                        a.drawState.dirty = !0,
                        f.renderState.hover = !0,
                        f.isSocketedJewel() ? f.skill.item.handleItemMouseover(e) : f.popup = a.createPopup(a.midCanvas, Math.round(t + 10), Math.round(n - 10), 300, 200, function(e, t, n) {
                            var r = 0
                              , i = 0
                              , s = Math.round(21 * a.scaleFactor)
                              , o = Math.round(19 * a.scaleFactor)
                              , u = s * 3
                              , l = o * 2;
                            n.fillStyle = "rgb(200,200,200)",
                            n.font = s + "pt FontinBold",
                            t ? (i = n.measureText(f.skill.displayName).width,
                            i > r && (r = i)) : n.fillText(f.skill.displayName, 5, Math.round(s * 2));
                            var c = function(e, n, s) {
                                if (!e)
                                    return !1;
                                s && (u += l);
                                for (var o = 0, a = e.length; o < a; ++o) {
                                    u += l;
                                    if (t) {
                                        i = n.measureText(e[o]).width,
                                        i > r && (r = i);
                                        var f = e[o].split("\n");
                                        for (var c in f)
                                            c > 0 && (u += l)
                                    } else {
                                        var f = e[o].split("\n");
                                        for (var c in f)
                                            c > 0 && (u += l),
                                            n.fillText(f[c], 5, Math.round(u))
                                    }
                                }
                            };
                            n.save(),
                            n.font = o + "pt FontinBold",
                            c(f.skill.skillDescription, n),
                            n.font = "italic " + o + "pt FontinBold",
                            n.fillStyle = "#AF6025",
                            c(f.skill.flavourText, n, !0),
                            n.fillStyle = "#808080",
                            c(f.skill.reminderText, n, !0),
                            n.restore(),
                            t && e.resize(r + 10, Math.round(u + l / 2))
                        }),
                        a.settings.highlightSimilarNodes && a.highlightSimilarNodes(f);
                        if (a.settings.highlightShortestPaths && f.pathHighlighterGroup === null) {
                            var r = a.getShortestPathsFromActiveNodes(f);
                            f.pathHighlighterGroup = new h(a,r),
                            f.pathHighlighterGroup.begin()
                        }
                    }
                    ,
                    k.onmouseout = function(e) {
                        a.drawState.dirty = !0,
                        f.renderState.hover = !1,
                        f.isSocketedJewel() ? f.skill.item.handleItemMouseout() : a.removePopup(f.popup),
                        f.similarNodeHighlighter !== null && f.similarNodeHighlighter.end().done(function(e, t) {
                            return function() {
                                e.similarNodeHighlighter === t && (e.similarNodeHighlighter = null)
                            }
                        }(f, f.similarNodeHighlighter)),
                        f.pathHighlighterGroup !== null && (f.pathHighlighterGroup.end(),
                        f.pathHighlighterGroup = null)
                    }
                }
            })
        }
        ,
        this.drawNode = function(e, t) {
            t(e, this.getNodePositionInfo(e))
        }
        ,
        this.drawPathBetweenNodes = function(e, t, n, r) {
            var i = this.getNodePositionInfo(e)
              , s = this.getNodePositionInfo(t);
            if (e.group.id != t.group.id || e.orbit != t.orbit)
                n(i, s);
            else {
                var o = e.group.position.clone()
                  , u = i.angle
                  , a = s.angle
                  , f = u < a;
                u = f ? i.angle : s.angle,
                a = f ? s.angle : i.angle;
                var l = a - u;
                if (l > Math.PI) {
                    var c = 2 * Math.PI - l;
                    u = a,
                    a = u + c
                }
                var h = this.orbitRadii[e.orbit];
                r(o, u, a, h)
            }
        }
        ,
        this.drawLoading = function(e) {
            var t = E.translate("Loading") + "... " + (Math.round(e * 100) + "%")
              , n = 20
              , r = this.canvas.width / 2
              , i = this.canvas.height / 2
              , s = this.ctx.measureText(t);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height),
            this.ctx.fillStyle = "rgb(251,243,241)",
            this.ctx.font = n + "pt FontinBold",
            this.ctx.fillText(t, Math.round(r - s.width / 2), Math.round(i - n / 2))
        }
        ,
        this.draw = function() {
            this.drawState.active = !0,
            this.calcTileGrid();
            if (this.drawState.dirtyFullRedraw || !this.lastDrawBounds || this.lastDrawBounds.neq(this.viewPort.bounds))
                this.lastDrawBounds = this.viewPort.bounds.clone(),
                this.foreachVisibleGridTile(function(e, t, n, r, i) {
                    this.drawTilePos(t, n),
                    this.ctx.drawImage(e.canvas, 0, 0, this.tileSize, this.tileSize, Math.round(r * this.tileSize - this.grid.visGridXviewPortShift), Math.round(i * this.tileSize - this.grid.visGridYviewPortShift), this.tileSize, this.tileSize)
                });
            this.drawMidCanvas(),
            this.drawTopCanvas();
            for (var e = 0, t = this.finalDrawFuncs.length; e < t; ++e)
                this.finalDrawFuncs[e]();
            this.finalDrawFuncs = [];
            for (var n in this.popups)
                this.popups[n].draw();
            this.errorMessage !== null && (this.ctx.fillStyle = "rgb(251,30,30)",
            this.ctx.font = "10pt FontinBold",
            this.ctx.fillText(this.errorMessage, 10, this.canvas.height - 20)),
            this.drawState.lastFrame = new Date,
            this.beginIdle(),
            this.drawState.dirty = !1,
            this.drawState.dirtyFullRedraw = !1,
            this.drawState.active = !1
        }
        ,
        this.drawImageTiled = function(e, t, n, r, i, s, o, u) {
            var a = e.width * n
              , f = e.height * r
              , l = o - i
              , c = u - s;
            for (var h = 0, p = Math.ceil(l / a); h < p; ++h) {
                var d = h * a + i;
                for (var v = 0, m = Math.ceil(c / f); v < m; ++v) {
                    t.save(),
                    t.translate(d, v * f + s);
                    var g = e.width
                      , y = a
                      , b = e.height
                      , w = f;
                    if (h == p - 1) {
                        var E = l % a
                          , S = a - E;
                        E !== 0 && (y -= S,
                        g *= E / a)
                    }
                    if (v == m - 1) {
                        var E = Math.round(c) % Math.round(f)
                          , x = f - E;
                        E !== 0 && (w -= x,
                        b *= E / f)
                    }
                    t.drawImage(e, 0, 0, g, b, 0, 0, y, w),
                    t.restore()
                }
            }
        }
        ,
        this.createRotatedCanvasImage = function(e, t, n, r) {
            var i = document.createElement("canvas");
            i.width = n,
            i.height = r;
            var s = i.getContext("2d");
            return s.save(),
            s.translate(n / 2, r / 2),
            s.rotate(t),
            s.drawImage(e, -e.width / 2, -e.height / 2),
            s.restore(),
            i
        }
        ,
        this.drawTopCanvas = function() {
            if (!this.drawState.topDirty)
                return;
            this.topCtx.clearRect(0, 0, this.topCanvas.width, this.topCanvas.height),
            this.drawBorder(),
            this.drawHeader(),
            this.drawState.topDirty = !1
        }
        ,
        this.drawMidCanvas = function() {
            this.midCtx.clearRect(0, 0, this.midCanvas.width, this.midCanvas.height),
            this.midDrawObjects.foreachObject(function(e) {
                e.draw()
            })
        }
        ,
        this.drawBorder = function() {
            var e = this.assets.imgPSFadeCorner[1]
              , t = this.assets.imgPSFadeSide[1]
              , n = this.scaleFactor
              , r = e.width * n
              , i = e.height * n
              , s = t.height * n
              , o = this.createRotatedCanvasImage(e, Math.PI / 2, e.width, e.height)
              , u = this.createRotatedCanvasImage(e, Math.PI, e.width, e.height)
              , a = this.createRotatedCanvasImage(e, -Math.PI / 2, e.width, e.height)
              , f = this.createRotatedCanvasImage(t, 0, t.width, t.height)
              , l = this.createRotatedCanvasImage(t, Math.PI, t.width, t.height)
              , c = this.createRotatedCanvasImage(t, -Math.PI / 2, t.height, t.width)
              , h = this.createRotatedCanvasImage(t, Math.PI / 2, t.height, t.width);
            this.topCtx.drawImage(e, 0, 0, e.width, e.height, 0, 0, r, i),
            this.topCtx.drawImage(o, 0, 0, o.width, o.height, this.topCanvas.width - r, 0, r, i),
            this.topCtx.drawImage(u, 0, 0, u.width, u.height, this.topCanvas.width - r, this.topCanvas.height - i, r, i),
            this.topCtx.drawImage(a, 0, 0, a.width, a.height, 0, this.topCanvas.height - i, r, i),
            this.drawImageTiled(l, this.topCtx, n, n, r, this.topCanvas.height - s, this.topCanvas.width - r, this.canvas.height, "rgb(200,200,0)"),
            this.drawImageTiled(f, this.topCtx, n, n, r, 0, this.topCanvas.width - r, s, "rgb(200,20,200)"),
            this.drawImageTiled(c, this.topCtx, n, n, 0, i, c.width * n, this.topCanvas.height - i, "rgb(0,20,200)"),
            this.drawImageTiled(h, this.topCtx, n, n, this.topCanvas.width - h.width * n, i, this.topCanvas.width, this.canvas.height - i)
        }
        ,
        this.drawHeader = function() {
            if (this.readonly)
                return;
            var e = this.passiveAllocation.getPassiveSkillPointsAvailable()
              , t = this.passiveAllocation.getAscendancyPassiveSkillPointsAvailable();
            if (e > 0 || t > 0) {
                var n = this.assets.PSPointsFrame[1]
                  , r = this.scaleFactor
                  , i = n.width * r
                  , s = n.height * r
                  , o = i / 2
                  , u = Math.round(s / 2)
                  , a = this.topCanvas.width / 2;
                this.topCtx.drawImage(n, 0, 0, n.width, n.height, Math.round(a - i), 20 - u, Math.round(i), Math.round(s)),
                this.topCtx.drawImage(n, 0, 0, n.width, n.height, Math.round(a), 20 - u, Math.round(i), Math.round(s)),
                this.topCtx.fillStyle = "rgb(251,243,241)",
                this.topCtx.font = "10pt FontinBold";
                var f = "Point" + (e == 1 ? "" : "s") + " Left"
                  , l = e + " " + E.translate(f)
                  , c = this.topCtx.measureText(l)
                  , h = t + " " + E.translate("Ascendancy") + " " + E.translate(f)
                  , p = this.topCtx.measureText(h);
                this.topCtx.fillText(l, Math.round(a - o - c.width / 2), 20 - u + 16),
                this.topCtx.fillText(h, Math.round(a + o - p.width / 2), 20 - u + 16)
            }
        }
        ,
        this.drawIdle = function() {
            this.calcTileGrid();
            for (var e = 0; e < this.grid.visGridWidthTiles + 2; ++e)
                for (var t = 0; t < this.grid.visGridHeightTiles + 2; ++t) {
                    var n = e + this.grid.visGridStartXTilePos - 1
                      , r = t + this.grid.visGridStartYTilePos - 1;
                    if (this.grid.tiles[r] === undefined || this.grid.tiles[r][n] === undefined)
                        continue;
                    if (this.drawTilePos(n, r)) {
                        this.drawState.lastFrame = new Date,
                        this.beginIdle();
                        return
                    }
                }
        }
        ,
        this.getNodeRadius = function(e) {
            return e.notable ? this.nodeRadiusNotable : e.isKeyStone() ? this.nodeRadiusKeystone : e.isMastery() ? this.nodeRadiusMastery : e.isJewel ? this.nodeRadiusJewel : e.isClassStartNode ? this.nodeRadiusClassStart : this.nodeRadius
        }
        ,
        this.beginIdle = function() {
            var e = this;
            setTimeout(function() {
                var t = new Date;
                t.getTime() - e.drawState.lastFrame.getTime() >= 200 && e.drawIdle()
            }, 250)
        }
        ,
        this.getScreenWorldPosition = function(e, t) {
            return new n(this.viewPort.bounds.tl.x + e / this.viewPort.zoom,this.viewPort.bounds.tl.y + t / this.viewPort.zoom)
        }
        ,
        this.worldToScreen = function(e) {
            return new n((e.x - this.viewPort.bounds.tl.x) * this.viewPort.zoom,(e.y - this.viewPort.bounds.tl.y) * this.viewPort.zoom)
        }
        ,
        this.getTileWorldPosition = function(e, t) {
            var r = new n;
            return r.x = e * this.tileSize / this.viewPort.zoom + this.extent.tl.x,
            r.y = t * this.tileSize / this.viewPort.zoom + this.extent.tl.y,
            r
        }
        ,
        this.drawTilePos = function(e, t) {
            var n = this.getTileWorldPosition(e, t);
            return this.drawTile(this.grid.tiles[t][e], n, this.viewPort.zoom)
        }
        ,
        this.getAscendancyPositionInfo = function(e) {
            var r = this.getNodePositionInfo(this.startNode).position
              , i = 270
              , s = 0
              , o = 1
              , u = Math.sqrt(r.x * r.x + r.y * r.y)
              , a = Math.abs(r.x) < 10 && Math.abs(r.y) < 10;
            a || (s = r.x / u,
            o = -r.y / u);
            var f = this.viewPort.zoom
              , l = Math.atan2(s, o)
              , c = this.assets[this.ascendancyButton.state][f]
              , h = r.x + i * Math.cos(l + Math.PI / 2)
              , p = r.y + i * Math.sin(l + Math.PI / 2)
              , d = new n(h,p)
              , v = this.assets["Classes" + this.ascendancyClassName()][f]
              , m = r.x + (i + v.height / f / 2) * Math.cos(l + Math.PI / 2)
              , g = r.y + (i + v.height / f / 2) * Math.sin(l + Math.PI / 2)
              , y = new n(m,g)
              , b = new n(y.x - v.width / f / 2,y.y - v.height / f / 2)
              , w = new n(y.x + v.width / f / 2,y.y + v.height / f / 2)
              , E = new t;
            E.tl = new n(y.x - v.width / f / 2,y.y - v.height / f / 2),
            E.br = new n(y.x + v.width / f / 2,y.y + v.height / f / 2),
            e && (r.inverseTranslate(e.tl),
            d.inverseTranslate(e.tl),
            y.inverseTranslate(e.tl));
            var S = {
                distanceFromStartNodeCenter: i,
                distToCenter: u,
                dirX: s,
                dirY: o,
                isCentered: a,
                worldPos: r,
                ascButtonRot: l,
                img: c,
                buttonPoint: d,
                classArtImg: v,
                classArtImgPoint: y,
                classArtImgBounds: E
            };
            if (this.ascendancyStartNode) {
                var x = this.getNodePositionInfo(this.ascendancyStartNode).position
                  , T = m - x.x
                  , N = g - x.y;
                S.startNodeDX = T,
                S.startNodeDY = N
            }
            return S
        }
        ,
        this.drawStartNodeAscendancyButton = function(e, r) {
            var i = this.viewPort.zoom
              , s = this.assets[this.ascendancyButton.state][i];
            if (this.ascendancyClass && this.ascendancyClass > 0) {
                var o = this.getAscendancyPositionInfo(r)
                  , u = o.buttonPoint.clone();
                u.scale(i);
                var a = o.worldPos;
                a.scale(i),
                e.save(),
                e.translate(a.x, a.y),
                e.rotate(o.ascButtonRot),
                e.drawImage(s, -s.width / 2, (o.distanceFromStartNodeCenter - s.height / i / 2) * i, s.width, s.height),
                e.restore();
                var f = new t
                  , l = this.getAscendancyPositionInfo();
                f.tl = new n(l.buttonPoint.x - s.height / i / 2,l.buttonPoint.y - s.height / i / 2),
                f.br = new n(l.buttonPoint.x + s.height / i / 2,l.buttonPoint.y + s.height / i / 2);
                var h = this;
                this.ascendancyButton.clickable = new c(f),
                this.ascendancyButton.clickable.onmousemove = function() {
                    h.ascendancyButton.state != "PassiveSkillScreenAscendancyButtonHighlight" && (h.ascendancyButton.state = "PassiveSkillScreenAscendancyButtonHighlight",
                    h.drawState.dirty = !0,
                    h.drawState.dirtyFullRedraw = !0)
                }
                ,
                this.ascendancyButton.clickable.onmouseout = function() {
                    h.ascendancyButton.state = "PassiveSkillScreenAscendancyButton",
                    h.drawState.dirty = !0,
                    h.drawState.dirtyFullRedraw = !0
                }
                ,
                this.ascendancyButton.clickable.onclick = function(e) {
                    h.ascendancyButton.state = "PassiveSkillScreenAscendancyButtonPressed",
                    h.ascendancyClassPopupHidden = !h.ascendancyClassPopupHidden,
                    h.drawState.dirty = !0,
                    h.drawState.dirtyFullRedraw = !0,
                    h.lastQuery && h.lastQuery != "" && h.highlightSearchQuery(h.lastQuery),
                    h.drawState.topDirty = !0
                }
            }
        }
        ,
        this.isAscendancyGroupEnabled = function(e) {
            return e && e.isAscendancy && e.ascendancyName == this.ascendancyClassName() && !this.ascendancyClassPopupHidden
        }
        ,
        this.ascendancyClassName = function() {
            return this.characterClass >= 0 && this.ascendancyClass && this.ascendancyClass != 0 && this.ascendancyClasses[this.characterClass].classes[this.ascendancyClass] ? this.ascendancyClasses[this.characterClass].classes[this.ascendancyClass].name : !1
        }
        ,
        this.drawAscendancyClassBackground = function(e, t) {
            if (this.ascendancyClassPopupHidden || !this.ascendancyClass)
                return !1;
            var n = this.getAscendancyPositionInfo(t)
              , r = n.classArtImg
              , i = n.classArtImgPoint;
            i.scale(this.viewPort.zoom),
            e.drawImage(r, i.x - r.width / 2, i.y - r.height / 2, r.width, r.height)
        }
        ,
        this.drawAscendancyClassText = function(e, t) {
            if (this.ascendancyClassPopupHidden || !this.ascendancyClass)
                return !1;
            var r = this.getAscendancyPositionInfo(t)
              , i = this.ascendancyClasses[this.characterClass].classes[this.ascendancyClass]
              , s = i.flavourTextRect.split(",")
              , o = new n(s[0],s[1])
              , u = r.classArtImg
              , a = r.classArtImgPoint
              , f = i.flavourText.split("\n");
            a.scale(this.viewPort.zoom),
            o.scale(this.viewPort.zoom),
            e.save(),
            e.translate(a.x - u.width / 2, a.y - u.height / 2);
            var l = 0
              , c = 4
              , h = 48
              , p = h * this.viewPort.zoom;
            e.font = "" + Math.round(p) + "px FontinItalic";
            for (var d in f)
                l += Math.round(p + c * this.viewPort.zoom),
                e.fillStyle = "black",
                e.strokeText(f[d], o.x, o.y + l),
                e.fillStyle = "rgb(" + i.flavourTextColour + ")",
                e.fillText(f[d], o.x, o.y + l);
            e.restore()
        }
        ,
        this.drawStartNodeBackground = function(e, t, n, r, i) {
            var s = i == this.characterClass
              , o = this.assets[s ? "centerduelist" : "PSStartNodeBackgroundInactive"][n]
              , u = o.width * r
              , a = o.height * r
              , f = u / 2
              , l = a / 2
              , c = "PSStartNodeBackgroundInactive";
            if (s)
                switch (i) {
                case this.constants.classes.StrClass:
                    c = "centermarauder";
                    break;
                case this.constants.classes.DexClass:
                    c = "centerranger";
                    break;
                case this.constants.classes.IntClass:
                    c = "centerwitch";
                    break;
                case this.constants.classes.StrDexClass:
                    c = "centerduelist";
                    break;
                case this.constants.classes.StrIntClass:
                    c = "centertemplar";
                    break;
                case this.constants.classes.DexIntClass:
                    c = "centershadow";
                    break;
                case this.constants.classes.StrDexIntClass:
                    c = "centerscion"
                }
            o = this.assets[c][n],
            e.drawImage(o, 0, 0, o.width, o.height, Math.round(t.x - f), Math.round(t.y - l), Math.round(u), Math.round(a));
            if (s) {
                var h = Math.ceil(25 * this.viewPort.zoom);
                e.font = h + "pt FontinRegular";
                var p = 300 * (Math.PI / 180)
                  , d = t.x + this.constants.PSSCentreInnerRadius * this.viewPort.zoom * Math.sin(p)
                  , v = t.y + this.constants.PSSCentreInnerRadius * this.viewPort.zoom * Math.cos(p);
                e.fillStyle = "rgb(235,46,16)";
                var m = e.measureText(this.stats.getAttribute(this.constants.characterAttributes.Strength));
                e.fillText(this.stats.getAttribute(this.constants.characterAttributes.Strength), d - m.width / 2, v + h / 2);
                var p = 60 * (Math.PI / 180)
                  , d = t.x + this.constants.PSSCentreInnerRadius * this.viewPort.zoom * Math.sin(p)
                  , v = t.y + this.constants.PSSCentreInnerRadius * this.viewPort.zoom * Math.cos(p);
                e.beginPath(),
                e.fillStyle = "rgb(1,217,1)";
                var m = e.measureText(this.stats.getAttribute(this.constants.characterAttributes.Dexterity));
                e.fillText(this.stats.getAttribute(this.constants.characterAttributes.Dexterity), d - m.width / 2, v + h / 2);
                var p = 180 * (Math.PI / 180)
                  , d = t.x + this.constants.PSSCentreInnerRadius * this.viewPort.zoom * Math.sin(p)
                  , v = t.y + this.constants.PSSCentreInnerRadius * this.viewPort.zoom * Math.cos(p);
                e.beginPath(),
                e.fillStyle = "rgb(88,130,255)";
                var m = e.measureText(this.stats.getAttribute(this.constants.characterAttributes.Intelligence));
                e.fillText(this.stats.getAttribute(this.constants.characterAttributes.Intelligence), d - m.width / 2, v + h / 2)
            }
        }
        ,
        this.drawGroupBackground = function(e, t, n, r, i) {
            if (t.isOccupiedOrbit(3)) {
                var s = this.assets.PSGroupBackground3[r]
                  , o = s.width * i
                  , u = o / 2;
                e.drawImage(s, 0, 0, s.width, s.height, Math.round(n.x - u), Math.round(n.y - u), Math.round(o), Math.round(u)),
                e.save(),
                e.translate(Math.round(n.x), Math.round(n.y)),
                e.rotate(Math.PI),
                u = Math.round(u),
                e.translate(0, -u),
                e.drawImage(this.assets.PSGroupBackground3[r], 0, 0, this.assets.PSGroupBackground3[r].width, this.assets.PSGroupBackground3[r].height, -u, 0, o, u),
                e.restore()
            }
            if (t.isOccupiedOrbit(2)) {
                var s = this.assets.PSGroupBackground2[r]
                  , o = Math.round(s.width * i)
                  , u = o / 2;
                e.drawImage(s, 0, 0, s.width, s.height, Math.round(n.x - u), Math.round(n.y - u), o, o)
            }
            if (t.isOccupiedOrbit(1)) {
                var s = this.assets.PSGroupBackground1[r]
                  , o = Math.round(s.width * i)
                  , u = o / 2;
                e.drawImage(s, 0, 0, s.width, s.height, Math.round(n.x - u), Math.round(n.y - u), o, o)
            }
        }
        ,
        this.drawBackgroundTile = function(e, t, n, r) {
            var i = this.assets.Background1[n]
              , s = t.x - this.extent.tl.x
              , o = t.y - this.extent.tl.y
              , u = i.width * r
              , a = i.height * r
              , f = s % u
              , l = o % a;
            for (var c = 0, h = Math.ceil((this.tileSize + f) / u); c < h; ++c)
                for (var p = 0, d = Math.ceil((this.tileSize + l) / a); p < d; ++p)
                    e.drawImage(i, 0, 0, i.width, i.height, Math.round(-f + c * u), Math.round(-l + p * a), Math.round(u), Math.round(a))
        }
        ,
        this.drawGroupNodePaths = function(e, t, n, r) {
            if (!r.contains(e.position))
                return;
            var i = this.viewPort.zoom
              , s = this.getCurrentImageZoomLevel()
              , o = i / s
              , u = this;
            e.foreachNode(function(r) {
                var a = u.getNodePositionInfo(r, e)
                  , f = a.position;
                f.inverseTranslate(n.tl),
                f.scale(i);
                if (r.startPositionClasses.length > 0)
                    return;
                r.foreachOutNode(function(e) {
                    var a = u.getNodePositionInfo(e)
                      , f = a.position
                      , l = null;
                    f.inverseTranslate(n.tl),
                    f.scale(i);
                    if (r.isAscendancy && !e.isAscendancy)
                        return;
                    if (e.startPositionClasses.length > 0)
                        return;
                    if (e.isAscendancyStartNode)
                        return;
                    u.drawPathBetweenNodes(r, e, function(a, f) {
                        var l = a.position
                          , c = f.position;
                        l.inverseTranslate(n.tl),
                        l.scale(i),
                        c.inverseTranslate(n.tl),
                        c.scale(i);
                        var h = "Normal";
                        if (r.active && e.active)
                            h = "Active";
                        else if (r.active || e.active)
                            h = "Intermediate";
                        u.drawStraightPath(t, u.assets["LineConnector" + h][s], l, c, o, u.assets["PSLineDeco" + (r.active || e.active ? "Highlighted" : "")][s], (u.nodeRadius - 22) * i)
                    }, function(a, f, l, c) {
                        a.inverseTranslate(n.tl),
                        a.scale(i);
                        var h = "Normal";
                        if (r.active && e.active)
                            h = "Active";
                        else if (r.active || e.active)
                            h = "Intermediate";
                        var p = u.assets["Orbit" + e.orbit + h][s];
                        u.drawArc(t, p, a, f - Math.PI / 2, l - Math.PI / 2, o)
                    })
                })
            })
        }
        ,
        this.drawImageCentered = function(e, t, n, r, i) {
            var s = t.width * i
              , o = s / 2
              , u = t.height * i
              , a = u / 2;
            e.drawImage(t, 0, 0, t.width, t.height, Math.round(n.x - o), Math.round(n.y - a), Math.round(s), Math.round(u))
        }
        ,
        this.foreachGroup = function(e) {
            for (var t in this.groups)
                e.call(this, this.groups[t])
        }
        ,
        this.foreachNode = function(e) {
            for (var t in this.nodes)
                if (e.call(this, this.nodes[t]) === !0)
                    return
        }
        ,
        this.foreachClickable = function(e) {
            var t = this
              , n = this.ascendancyClassPopupHidden ? !1 : t.getAscendancyPositionInfo();
            this.foreachNode(function(r) {
                if (r.clickable === null)
                    return !1;
                if (n && !r.isAscendancy) {
                    if (r.isAscendancyStartNode)
                        return !1;
                    if (n.classArtImgBounds.contains(r.clickable.bounds.tl))
                        return !1;
                    if (n.classArtImgBounds.contains(r.clickable.bounds.br))
                        return !1
                }
                if (r.isAscendancy && !t.isAscendancyGroupEnabled(r.group))
                    return !1;
                if (e.call(t, r.clickable) === !0)
                    return
            });
            if (this.ascendancyButton && this.ascendancyButton.clickable && e.call(t, this.ascendancyButton.clickable) === !0)
                return
        }
        ,
        this.findNodes = function(e) {
            var t = [];
            for (var n in this.nodes) {
                var r = this.nodes[n];
                e.call(this, r) && t.push(r)
            }
            return t
        }
        ,
        this.getNode = function(e) {
            return this.nodes[e]
        }
        ,
        this.getGroup = function(e) {
            return this.groups[e]
        }
        ,
        this.addNode = function(e) {
            this.nodes[e.skill.getHash()] = e
        }
        ,
        this.addGroup = function(e) {
            this.groups[e.getId()] = e
        }
        ,
        this.getOrbitSkillCount = function(e) {
            return this.skillsPerOrbit[e]
        }
        ,
        this.getOrbitAngle = function(e, t) {
            var n = .017453293;
            if (t == 40)
                switch (e) {
                case 0:
                    return this.getOrbitAngle(0, 12);
                case 1:
                    return this.getOrbitAngle(0, 12) + 10 * n;
                case 2:
                    return this.getOrbitAngle(0, 12) + 20 * n;
                case 3:
                    return this.getOrbitAngle(1, 12);
                case 4:
                    return this.getOrbitAngle(1, 12) + 10 * n;
                case 5:
                    return this.getOrbitAngle(1, 12) + 15 * n;
                case 6:
                    return this.getOrbitAngle(1, 12) + 20 * n;
                case 7:
                    return this.getOrbitAngle(2, 12);
                case 8:
                    return this.getOrbitAngle(2, 12) + 10 * n;
                case 9:
                    return this.getOrbitAngle(2, 12) + 20 * n;
                case 10:
                    return this.getOrbitAngle(3, 12);
                case 11:
                    return this.getOrbitAngle(3, 12) + 10 * n;
                case 12:
                    return this.getOrbitAngle(3, 12) + 20 * n;
                case 13:
                    return this.getOrbitAngle(4, 12);
                case 14:
                    return this.getOrbitAngle(4, 12) + 10 * n;
                case 15:
                    return this.getOrbitAngle(4, 12) + 15 * n;
                case 16:
                    return this.getOrbitAngle(4, 12) + 20 * n;
                case 17:
                    return this.getOrbitAngle(5, 12);
                case 18:
                    return this.getOrbitAngle(5, 12) + 10 * n;
                case 19:
                    return this.getOrbitAngle(5, 12) + 20 * n;
                case 20:
                    return this.getOrbitAngle(6, 12);
                case 21:
                    return this.getOrbitAngle(6, 12) + 10 * n;
                case 22:
                    return this.getOrbitAngle(6, 12) + 20 * n;
                case 23:
                    return this.getOrbitAngle(7, 12);
                case 24:
                    return this.getOrbitAngle(7, 12) + 10 * n;
                case 25:
                    return this.getOrbitAngle(7, 12) + 15 * n;
                case 26:
                    return this.getOrbitAngle(7, 12) + 20 * n;
                case 27:
                    return this.getOrbitAngle(8, 12);
                case 28:
                    return this.getOrbitAngle(8, 12) + 10 * n;
                case 29:
                    return this.getOrbitAngle(8, 12) + 20 * n;
                case 30:
                    return this.getOrbitAngle(9, 12);
                case 31:
                    return this.getOrbitAngle(9, 12) + 10 * n;
                case 32:
                    return this.getOrbitAngle(9, 12) + 20 * n;
                case 33:
                    return this.getOrbitAngle(10, 12);
                case 34:
                    return this.getOrbitAngle(10, 12) + 10 * n;
                case 35:
                    return this.getOrbitAngle(10, 12) + 15 * n;
                case 36:
                    return this.getOrbitAngle(10, 12) + 20 * n;
                case 37:
                    return this.getOrbitAngle(11, 12);
                case 38:
                    return this.getOrbitAngle(11, 12) + 10 * n;
                case 39:
                    return this.getOrbitAngle(11, 12) + 20 * n
                }
            return 2 * Math.PI * e / t
        }
        ,
        this.getOrbitRadius = function(e) {
            return this.orbitRadii[e]
        }
        ,
        this.getNodePositionInfo = function(e, t) {
            var n = this.getOrbitRadius(e.orbit)
              , r = this.getOrbitAngle(e.orbitIndex, this.getOrbitSkillCount(e.orbit))
              , i = t ? t.position.clone() : e.group.position.clone();
            return i.x -= n * Math.sin(-r),
            i.y -= n * Math.cos(-r),
            {
                position: i,
                angle: r
            }
        }
        ,
        this.createPopup = function(e, t, n, r, i, s) {
            var o = new p(m,e,t,n,r,i,s);
            return this.popups[o.id] = o,
            ++this.popupId,
            o
        }
        ,
        this.removePopup = function(e) {
            delete this.popups[e.id]
        }
        ,
        this.calculateFlipPosition = function(e, t, n) {
            var r = t - e
              , i = r / n
              , s = parseInt(i) % 2
              , o = i % 1;
            return s == 0 ? o : 1 - o
        }
        ,
        this.calculateLerpPosition = function(e, t, n) {
            var r = t - e
              , i = r / n;
            return i
        }
        ,
        this.createDefaultHighlighterGroup = function(e) {
            var t = this;
            return new b({
                highlighters: [new g(this,{
                    nodes: e.filter(function(e) {
                        return !e.isMastery() && (!e.isAscendancy || t.isAscendancyGroupEnabled(e.group))
                    })
                })]
            })
        }
        ,
        this.highlightSearchQuery = function(e) {
            var t, n = !0, r = !0, i = this;
            this.lastQuery = e,
            (window.PoELocale === "zh_TW" || window.PoELocale === "zh_CN") && e.length >= 1 ? r = !1 : e.length > 2 && (r = !1);
            if (!r) {
                e = e.toLowerCase();
                var s = this.ascendancyClassPopupHidden ? !1 : i.getAscendancyPositionInfo()
                  , o = this.findNodes(function(t) {
                    if (t.isMastery())
                        return !1;
                    if (t.isAscendancy && !i.isAscendancyGroupEnabled(t.group))
                        return !1;
                    if (s && !t.isAscendancy && !i.ascendancyClassPopupHidden && t.clickable && t.clickable.bounds) {
                        if (s.classArtImgBounds.contains(t.clickable.bounds.tl))
                            return !1;
                        if (s.classArtImgBounds.contains(t.clickable.bounds.br))
                            return !1
                    }
                    if (t.skill.displayName.toLowerCase().indexOf(e) != -1)
                        return !0;
                    for (var n = 0, r = t.skill.skillDescription.length; n < r; ++n)
                        if (t.skill.skillDescription[n].toLowerCase().indexOf(e) != -1)
                            return !0;
                    return !1
                });
                t = this.createDefaultHighlighterGroup(o),
                this.searchHighlighter !== null && t.copyStateFrom(this.searchHighlighter)
            }
            this.searchHighlighter !== null && (this.searchHighlighter.endImmediately(),
            this.searchHighlighter = null,
            n = !1);
            if (r)
                return;
            this.searchHighlighter = t,
            n ? this.searchHighlighter.begin() : this.searchHighlighter.beginDefault(t.start)
        }
        ,
        this.highlightSimilarNodes = function(e) {
            if (e.similarNodeHighlighter !== null)
                return;
            var t = this
              , n = this.findNodes(function(n) {
                var r = this.ascendancyClassPopupHidden ? !1 : t.getAscendancyPositionInfo();
                if (r && !n.isAscendancy && !t.ascendancyClassPopupHidden && n.clickable && n.clickable.bounds) {
                    if (r.classArtImgBounds.contains(n.clickable.bounds.tl))
                        return !1;
                    if (r.classArtImgBounds.contains(n.clickable.bounds.br))
                        return !1
                }
                return e.skill.displayName == n.skill.displayName && (t.isAscendancyGroupEnabled(n.group) || !n.isAscendancy)
            })
              , r = this.createDefaultHighlighterGroup(n);
            e.similarNodeHighlighter = r,
            r.begin()
        }
        ,
        this.visitNodes = function(e, t, n, r) {
            var i = [];
            i.push(e),
            this.ascendancyClass && i.push(this.ascendancyStartNode);
            while (i.length > 0) {
                var s = i.pop()
                  , o = s.skill.getHash();
                n[o] === undefined && r(s) && (t.push(s),
                n[o] = !0,
                s.foreachNeighbourNode(function(e) {
                    var t = e.skill.getHash();
                    n[t] === undefined && r(e) && i.push(e)
                }))
            }
        }
        ,
        this.visitBFS = function(e, t, n, r) {
            var i = []
              , s = {}
              , o = {};
            i.push(e),
            s[e.skill.getHash()] = !0;
            var u = function(e, t) {
                o[t.skill.getHash()] === undefined && (o[t.skill.getHash()] = new d(t,e))
            }
              , a = function(e) {
                return o[e.skill.getHash()]
            };
            u(0, e);
            while (i.length > 0) {
                var f = i.shift()
                  , l = f.skill.getHash()
                  , c = o[f.skill.getHash()];
                if (t(f)) {
                    r(c, o);
                    return
                }
                f.foreachNeighbourNode(function(e) {
                    if (e.skill.getHash() === null || !n(e))
                        return;
                    u(c.depth + 1, e);
                    if (s[e.skill.getHash()] === undefined)
                        o[e.skill.getHash()].parents.push(f);
                    else {
                        var t = a(e);
                        t.depth - 1 == c.depth && o[e.skill.getHash()].parents.push(f)
                    }
                    if (s[e.skill.getHash()] !== undefined)
                        return;
                    s[e.skill.getHash()] = !0,
                    i.push(e)
                })
            }
        }
        ,
        this.getHistoryUrl = function() {
            if (!this.isHistorySupported())
                return "";
            var e = [];
            for (var t in this.passiveAllocation.allocatedSkills)
                e.push(t);
            var n = "";
            return this.accountName && this.characterName && (n += "?accountName=" + this.accountName + "&characterName=" + this.characterName),
            T(this.characterClass, this.ascendancyClass, e, this.fullScreen) + n
        }
        ,
        this.loadHistoryUrl = function(t) {
            t = t.replace(/-/g, "+").replace(/_/g, "/");
            try {
                t = e.base64.decode(t)
            } catch (n) {
                this.errorMessage = "Failed to load build from URL. Please make sure it was copied correctly.";
                var r = this
                  , i = function() {
                    r.events.pointsChanged.remove(i),
                    r.errorMessage = null
                };
                this.events.pointsChanged.add(i);
                return
            }
            var s = new v;
            s.setDataString(t);
            var o = s.readInt()
              , u = s.readInt8()
              , a = s.readInt8()
              , f = 0;
            o > 0 && (f = s.readInt8());
            if (o != C.CurrentVersion) {
                alert("The build you are trying to load is using an old version of the passive tree and will not work.");
                return
            }
            var l = [];
            while (s.hasData())
                l.push(s.readInt16());
            this.loadCharacterData(u, a, l),
            f == 1 && this.toggleFullScreen(!0)
        }
        ,
        this.drawViewportIntersectionPoint = function(e, t) {
            var n = this.viewPort.bounds.intersectionPoint(e, this.viewPort.position, 20)
              , r = 5
              , i = 2;
            !1 !== n && (n = this.worldToScreen(n),
            n.x < r ? n.x += i - 1 : n.x > this.canvas.width - r && (n.x -= i),
            n.y < r ? n.y += i - 1 : n.y > this.canvas.height - r && (n.y -= i),
            this.finalDrawFuncs.push(function() {
                t(n)
            }))
        }
        ,
        this.init()
    };
    return C.CurrentVersion = N,
    C
}),
define("PoE/PassiveSkillTree/PassiveSkillTreeControls", ["plugins", "PoE/PassiveSkillTree/PassiveSkillTree", "PoE/Helpers"], function(e, t, n) {
    var r = function(r) {
        this.init = function() {
            this.$controlsForm = e("#passiveControlsForm"),
            this.$classStartPoint = e("#classStartPoint"),
            this.$ascendancyClass = e("#ascendancyClass"),
            this.$permaLink = e("#permaLink"),
            this.$pointsUsedEl = e("#skillTreeInfo .pointsUsed"),
            this.$totalPointsEl = e("#skillTreeInfo .totalPoints"),
            this.$toggleFullScreenEl = e("#toggleFullScreen"),
            this.$treeLinkEl = e(".tree-link"),
            this.$window = e(window),
            this.$controlsContainerEl = e("#passiveSkillTreeControlsContainer"),
            this.$controlsEl = e("#passiveSkillTreeControls"),
            this.$popupContainerEl = e("#poe-popup-container"),
            this.$higlightSimilarEl = e("#highlightSimilarNodes"),
            this.$highlightShortestPathsEl = e("#highlightShortestPaths"),
            this.$searchBoxEl = e("#passiveSearchBox"),
            this.$bbcodePermaLinkEl = e("#bbcodePermaLink"),
            this.$buildNameEl = e("#buildName"),
            this.$buildNameContEl = e("#buildNameContainer"),
            this.$resetEl = e("#resetSkillTree"),
            this.bbcodePermaL = !1,
            this.defaultBuildName = "Passive skill tree build",
            this.curHistoryUrl = "",
            this.skillTree = !1,
            this.height = r.height,
            this.fullScreen = r.fullScreen ? !0 : !1,
            this.ascClasses = r.ascClasses,
            this.startClass = r.startClass,
            this.zoomLevels = r.zoomLevels,
            this.passiveSkillTreeData = r.passiveSkillTreeData;
            var i = this;
            window.top.location != document.location && (this.$treeLinkEl.show(),
            this.$toggleFullScreenEl.hide());
            var s = function() {
                var t = window.location.origin + window.location.pathname
                  , n = "";
                if (i.bbcodePermaL) {
                    var r = i.$buildNameEl.val();
                    r = r.replace(/[\[\]]/g, ""),
                    r = e.trim(r),
                    r == "" && (r = i.defaultBuildName),
                    n = '[url="' + t + '"]' + r + "[/url]"
                } else
                    n = t;
                i.$permaLink.val(n);
                if (i.$treeLinkEl.length) {
                    var s = function() {
                        window.open(t)
                    };
                    i.$treeLinkEl.off("click").on("click", s)
                }
            };
            this.skillTree = new t("passiveSkillTree","poe-popup-container",916,this.height,this.startClass,this.zoomLevels,this.passiveSkillTreeData,{
                events: {
                    classChosen: function(e) {
                        i.$classStartPoint.val(e),
                        i.setAscendancyOptions(e)
                    },
                    historyUrlSet: function(e) {
                        i.curHistoryUrl = e,
                        s()
                    },
                    pointsChanged: function() {
                        i.$pointsUsedEl.text(i.skillTree.passiveAllocation.numAllocatedSkills),
                        i.$totalPointsEl.text(i.skillTree.passiveAllocation.getTotalSkillPoints())
                    },
                    onload: function() {
                        setTimeout(function() {
                            i.$controlsEl.slideDown(500)
                        }, 500)
                    },
                    onFullScreenUpdate: function() {
                        return i.$controlsEl.css("width", i.$window.width()),
                        {
                            top: "0px",
                            left: "0px",
                            width: i.$window.width(),
                            height: i.$window.height() - i.$controlsEl.height()
                        }
                    },
                    onFullScreenBegin: function() {
                        i.$popupContainerEl.append(i.$controlsEl),
                        i.$controlsEl.css("width", i.$window.width()).css("position", "fixed").css("bottom", "0px").css("left", "0px").css("z-index", 1e3),
                        i.$toggleFullScreenEl.val(n.translate("Exit Full Screen (f)"))
                    },
                    onFullScreenEnd: function() {
                        i.$controlsEl.css("width", "auto").css("position", "relative"),
                        i.$controlsContainerEl.append(i.$controlsEl),
                        i.$toggleFullScreenEl.val(n.translate("Full Screen (f)"))
                    }
                },
                ascClasses: i.ascClasses,
                treeControls: this
            }),
            this.setAscendancyOptions = function(t) {
                i.$ascendancyClass.empty(),
                i.$ascendancyClass.append(e("<option></option>").attr("value", 0).text(n.translate("None")));
                for (var r in i.ascClasses[t].classes) {
                    var s = e("<option></option>").attr("value", r).text(i.ascClasses[t].classes[r].displayName);
                    i.skillTree.ascendancyClass && r == i.skillTree.ascendancyClass && s.attr("selected", !0),
                    i.$ascendancyClass.append(s)
                }
            }
            ,
            this.skillTree.loadStateFromUrl(),
            this.$classStartPoint.change(function(e) {
                i.skillTree.reset({
                    characterClass: e.target.value,
                    ascendancyClass: 0
                })
            }),
            this.$ascendancyClass.change(function(e) {
                i.skillTree.reset({
                    characterClass: i.skillTree.characterClass,
                    ascendancyClass: e.target.value
                })
            }),
            this.$resetEl.click(function(e) {
                i.skillTree.reset()
            }),
            this.$toggleFullScreenEl.click(function(e) {
                i.skillTree.toggleFullScreen()
            }),
            this.$permaLink.click(function() {
                i.$permaLink.select()
            }),
            i.skillTree.isHistorySupported() || i.$permaLink.hide(),
            this.$higlightSimilarEl.change(function(e) {
                i.skillTree.settings.highlightSimilarNodes = i.$higlightSimilarEl.is(":checked")
            }),
            this.$highlightShortestPathsEl.change(function(e) {
                i.skillTree.settings.highlightShortestPaths = i.$highlightShortestPathsEl.is(":checked")
            }),
            this.$bbcodePermaLinkEl.change(function(e) {
                i.bbcodePermaL = i.$bbcodePermaLinkEl.is(":checked");
                var t = function() {
                    i.skillTree.updateCanvasSize()
                };
                i.bbcodePermaL ? i.$buildNameContEl.fadeIn(200, t) : i.$buildNameContEl.fadeOut(200, t),
                s()
            }),
            this.$searchBoxEl.keypress(function(e) {
                e.stopPropagation()
            }),
            this.$buildNameEl.keypress(function(e) {
                e.stopPropagation()
            }),
            this.$buildNameEl.keyup(function(e) {
                s()
            }),
            this.$searchBoxEl.keyup(function(e) {
                i.skillTree.highlightSearchQuery(i.$searchBoxEl.val())
            })
        }
        ,
        this.init()
    };
    return r
}),
define("skilltree", ["PoE/PassiveSkillTree/PassiveSkillTree", "PoE/PassiveSkillTree/PassiveSkillTreeControls"], function(e, t) {
    return {
        view: e,
        controls: t
    }
})
