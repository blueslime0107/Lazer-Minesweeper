const gameData = {
    "resolution": [1280, 720],
    "currentLanguage": 1,
    "scaleMode": 'nearest',
    "scene":[
        "MainGame"
    ],
    "startScene": "MainGame",
    "startSceneOption": {
        stageId:1
    },
    "defaultStage": 3,
    "defaultBG": 'forest',
    isPortrait: false,
    noPortrait: true
}

const BGM = {
    //title: "audio/bgm/title.mp3"
}

const SFX = {
    //tan1: "audio/se/se_tan00.wav"
}


const KeyBind = {
    ONE: [KeyCode.Num1, KeyCode.Numpad1],
    TWO: [KeyCode.Num2, KeyCode.Numpad2],
    THREE: [KeyCode.Num3, KeyCode.Numpad3],
    FOUR: [KeyCode.Num4, KeyCode.Numpad4],
    FIVE: [KeyCode.Num5, KeyCode.Numpad5],
    SIX: [KeyCode.Num6, KeyCode.Numpad6],
    SEVEN: [KeyCode.Num7, KeyCode.Numpad7],
    EIGHT: [KeyCode.Num8, KeyCode.Numpad8],
    NINE: [KeyCode.Num9, KeyCode.Numpad9],
    OK: [KeyCode.Z, KeyCode.Enter],
    CANCEL: [KeyCode.X, KeyCode.Escape, KeyCode.Backspace],
    UP: [KeyCode.ArrowUp],
    DOWN: [KeyCode.ArrowDown],
    LEFT: [KeyCode.ArrowLeft],
    RIGHT: [KeyCode.ArrowRight],
    SKIP: [KeyCode.Control],
    SLOW: [KeyCode.Shift]
};

const gameTxtsty = {
    default: {
        langId: 1,
        fontSize: 32,
        fill: 'rgba(255, 255, 255, 1)',
        align: 'left'
    },
    number: {
        langId: 1,
        fontSize: 36,
        fill: 'rgba(255, 255, 255, 1)',
        align: 'left'
    },
    dialog: {
        langId: 1,
        fontSize: 40,
        fill: 'rgba(255, 255, 255, 1)',
        align: 'left'
    },
    textBubble: {
        langId: 1,
        fontSize: 40,
        fill: 'rgba(255, 255, 255, 1)',
        align: 'center'
    },
    phazeMainText: {
        langId: 1,
        fontSize: 90,
        fill: 'rgba(255, 255, 255, 1)',
        align: 'center'
    },
    debug: {
        fontFamily: 'AnonymousPro',
        fontSize: 20,
        fill: 'rgb(255,255,255)',
        stroke: {
            color: 'rgba(0, 0, 0, 1)',
            width: 5
        }
    },
    stageTitle: {
        langId: 1,
        fontSize: 72,
        fill: 'rgba(255, 255, 255, 1)',
        stroke: {
            color: 'rgba(0, 0, 0, 1)',
            width: 10
        },
        align: 'center'
    },
    stageSubTitle: {
        langId: 1,
        fontSize: 36,
        fill: 'rgba(255, 255, 255, 1)',
        stroke: {
            color: 'rgba(0, 0, 0, 1)',
            width: 10
        },
        align: 'center'
    },
    gagueText: {
        langId: 1,
        fontSize: 32,
        fill: 'rgba(255, 255, 255, 1)',
        stroke: {
            color: 'rgba(0, 0, 0, 1)',
            width: 5
        },
        align: 'left',
        tagStyle: true
    },
    titleHeader: {
        langId: 1,
        fontSize: 64,
        fill: 'rgba(255, 255, 255, 1)',
        stroke: { color: 'rgba(16, 24, 32, 1)', width: 8 },
        align: 'center'
    },
    subtitle: {
        fontFamily: 'AnonymousPro',
        fontSize: 24,
        fill: 'rgba(216, 231, 255, 1)',
        align: 'center'
    },
    menuItem: {
        langId: 1,
        fontSize: 44,
        fill: 'rgba(255, 255, 255, 1)',
        stroke: { color: 'rgba(11, 16, 37, 1)', width: 6 },
        align: 'center'
    },
    optionItem: {
        fontFamily: 'AnonymousPro',
        fontSize: 34,
        fill: 'rgba(245, 252, 255, 1)',
        stroke: { color: 'rgba(8, 16, 32, 1)', width: 5 },
        align: 'center'
    },
    optionBack: {
        langId: 1,
        fontSize: 40,
        fill: 'rgba(255, 255, 255, 1)',
        stroke: { color: 'rgba(8, 16, 32, 1)', width: 5 },
        align: 'center'
    },
    toast: {
        fontFamily: 'AnonymousPro',
        fontSize: 28,
        fill: 'rgba(255, 246, 163, 1)',
        stroke: { color: 'rgba(0, 0, 0, 1)', width: 5 },
        align: 'center'
    },
    info: {
        fontFamily: 'AnonymousPro',
        fontSize: 26,
        fill: 'rgba(198, 212, 255, 1)',
        lineHeight: 36,
        align: 'center'
    },
    helpText: {
        fontFamily: 'AnonymousPro',
        fontSize: 22,
        fill: 'rgba(155, 176, 217, 1)',
        align: 'center'
    },
    mineHeader: {
        langId: 1,
        fontSize: 54,
        fill: 'rgba(32, 32, 32, 1)',
        stroke: { color: 'rgba(255, 255, 255, 0.9)', width: 6 },
        align: 'center'
    },
    mineStatus: {
        fontFamily: 'AnonymousPro',
        fontSize: 28,
        fill: 'rgb(255, 255, 255)',
        align: 'center'
    },
    mineCellNumber: {
        fontFamily: 'Cafe24Ohsquare',
        fontSize: 34,
        fill: 'rgb(255, 255, 255)',
        stroke: { color: 'rgba(112, 112, 112, 0.9)', width: 4 },
        align: 'center'
    },
    mineCellImogii: {
        fontFamily: 'AnonymousPro',
        fontSize: 34,
        fill: 'rgb(255, 255, 255)',
        align: 'center'
    },
    pauseTitle: {
        langId: 1,
        fontSize: 64,
        fill: 'rgba(255, 255, 255, 1)',
        stroke: { color: 'rgba(0, 0, 0, 1)', width: 8 },
        align: 'center'
    },
    pauseMenu: {
        langId: 1,
        fontSize: 44,
        fill: 'rgba(255, 255, 255, 1)',
        stroke: { color: 'rgba(0, 0, 0, 1)', width: 6 },
        align: 'center'
    },
    difficultyBtn: {
        langId: 1,
        fontSize: 38,
        fill: 'rgba(255, 255, 255, 1)',
        stroke: { color: 'rgba(0, 0, 0, 1)', width: 6 },
        align: 'center'
    },
    difficultyBtnSmall: {
        langId: 1,
        fontSize: 24,
        fill: 'rgba(255, 255, 255, 1)',
        stroke: { color: 'rgba(0, 0, 0, 1)', width: 4 },
        align: 'center'
    },
    resultTitle: {
        langId: 1,
        fontSize: 64,
        fill: 'rgba(255, 255, 255, 1)',
        stroke: { color: 'rgba(0, 0, 0, 1)', width: 8 },
        align: 'center'
    },
    resultTime: {
        fontFamily: 'AnonymousPro',
        fontSize: 32,
        fill: 'rgba(255, 255, 255, 1)',
        stroke: { color: 'rgba(0, 0, 0, 1)', width: 5 },
        align: 'center'
    },
    restartBtn: {
        langId: 1,
        fontSize: 34,
        fill: 'rgba(255, 255, 255, 1)',
        stroke: { color: 'rgba(0, 0, 0, 1)', width: 5 },
        align: 'center'
    },
    manualText: {
        langId: 1,
        fontSize: 24,
        fill: 'rgba(255, 255, 255, 1)',
        lineHeight: 34,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 540
    },
    manualTextLeft: {
        langId: 1,
        fontSize: 22,
        fill: 'rgba(220, 230, 255, 1)',
        lineHeight: 32,
        align: 'left',
        wordWrap: true,
        wordWrapWidth: 360
    },
    manualPage: {
        fontFamily: 'AnonymousPro',
        fontSize: 20,
        fill: 'rgba(180, 190, 210, 1)',
        align: 'center'
    },
    manualClose: {
        fontFamily: 'AnonymousPro',
        fontSize: 28,
        fill: 'rgba(255, 255, 255, 1)',
        align: 'center'
    }
}

const gameDialogCharacter = {
    null: { _name: "???", color: 'rgba(255, 255, 255, 1)' },
    CUA: { _name: "쿠아", color: 'rgba(20, 75, 255, 1)' },
    PRI: { _name: "프리", color: 'rgba(161, 20, 255, 1)' },
    RECT: { _name: "렉트", color: 'rgba(255, 75, 20, 1)' },
}

const Feeling = {
    NORMAL: 1,
    HAPPY: 2,
    ANGRY: 3,
    WHAT: 4,
    NAH: 5,
    BRAVE: 6
};

const BData = {
    lazer: { radius: 2, spinMode:1,z:0},
    spear: { radius: 2, spinMode:1,z:0},
    ring: { radius: 2, spinMode:0,z:0},
    circle: { radius: 2, spinMode:0,z:0},
    kunai: { radius: 2, spinMode:1,z:0},
    ice: { radius: 2, spinMode:1,z:0},
    rice: { radius: 2, spinMode:1,z:0},
    paper: { radius: 2, spinMode:1,z:0},
    gun: { radius: 2, spinMode:1,z:0},
    darkrice: { radius: 2, spinMode:1,z:0},
    star: { radius: 2, spinMode:2,z:0},
    tear: { radius: 2, spinMode:1,z:0},

    darksnow: { radius: 4, spinMode:2,z:1},
    smallrice: { radius: 4, spinMode:1,z:1},
    snow: { radius: 4, spinMode:0,z:1},

    heart: { radius: 6, spinMode:1,z:-1},
    arrow: { radius: 2, spinMode:1,z:-1},
    bigStar: { radius: 6, spinMode:2,z:-1},
    big: { radius: 6, spinMode:0,z:-1},
    fairy: { radius: 6, spinMode:1,z:-1},
    knife: { radius: 6, spinMode:1,z:-1},
    oval: { radius: 6, spinMode:1,z:-1},
    stone: { radius: 6, spinMode:1,z:-1},
    bigtear: { radius: 6, spinMode:1,z:-1},
    yinyang: { radius: 6, spinMode:2,z:-1},

    light: { radius: 8, spinMode:0,z:-2},
}

const EFC = {
    enemyBlast: {
        init: function () {
            let circle = Img.sprite('circle', 32)
            this.addChild(circle)
        },
        update: function (self) {
            if (this.whileTime(0, this.repeat < 60)) {
                self.scale.set(frameMove(1, 2, this.repeat, 60, Easing.easeOutSine))
                self.alpha = (1 - this.repeat / 60)
            }
            this.$die()
        }
    },
    bBarrierCircle: {
        /**@type {{ owner: import("./sceneBullet").Player , power: Number}}*/op: null,
        init: function () {
            this.radius = 60
            let circle = Img.sprite('circle', 60,'rgba(255,0,0,0.5)')
            this.addChild(circle)
        },
        update: function (self) {
            for(let b of self.op.owner.getBullets()){
                if(collideCircle(self,b)){
                    b.owner = self.op.owner
                    b.MoveDir(getRandom(-45,45)+self.op.owner.faceDir,b.speed)
                }
            }
            if (this.whileTime(0, this.repeat < 60)) {
                self.radius = frameMove(60, 60*self.op.power, this.repeat, 60, Easing.easeOutSine)
                self.alpha = frameMove(1,0.2,this.repeat,60,Easing.easeOutSine)
                self.scale.set(self.radius/60)
            }
            this.$die()
        }
    },
    bullet: {
        init: function () {
            let circle = Img.sprite('circle', 32)
            this.addChild(circle)
        },
        update() { }
    },
    enemyShot: {
        /**@type {{ radius:number, color:string, damage:number }}*/op: null,
        init: function () {
            this.radius = 16
            this.damage = this.op.damage
            let circle = Img.sprite('circle', this.radius, this.op.color)
            this.addChild(circle)
        },
        update(self) {
            this.whenTime(1)
            if (this.whileTime(0)) {
                for (let enemy of gm.enemyGroup) {
                    if (collideCircle(self, enemy)) {
                        enemy.dealDamage(self.damage)
                        self.stopMove()
                        this.endWhile()
                        break
                    }
                }
            }
            if (this.whileTime(0, this.repeat < 60)) {
                self.scale.set(frameMove(1, 2, this.repeat, 60, Easing.easeOutCubic))
                self.alpha = frameMove(1, 0, this.repeat, 60, Easing.easeOutCubic)
            }
            this.$die()
        }
    },
    line: {
        /**@type {{ endPos:any, width:number, color:string }}*/op: null,
        init: function () {
            this.line = Img.line(this, this.op.endPos, this.op.width, this.op.color)
            this.line.position.x -= this.x
            this.line.position.y -= this.y
            this.addChild(this.line)
            this.zIndex = 1
        },
        update(self) {
            if (this.whileTime()) {
                self.line.scale.y -= self.op.width / 30
                if (self.line.scale.y <= 0) {
                    this.die()
                }
            }
        }
    },
    textBubble: {
        init: function () {
            this.text = this.addChild(new Text({ text: this.op.text, style: Data.styles.textBubble }))
            this.text.anchor.set(0.5)
            this.text.alpha = 0
        },
        update(self) {
            if (this.whileTime(0, this.repeat < 30)) {
                self.text.alpha = this.repeat / 30
            }
            if (!self.op.noDisappear) {
                if (self.op.waitInput) {
                    this.waitIf(Input.isPressed(KeyBind.OK))
                } else {
                    this.whenTime(60)
                }
                if (this.whileTime(0, this.repeat < 30)) {
                    self.text.alpha = 1 - this.repeat / 30
                }
                this.$die()
            }
        }
    },
    phazeAlert: {
        init: function () {
            this.mainText = this.addChild(new Text({ text: `Phaze ${this.op.num}`, style: Data.styles.phazeMainText }))
            this.mainText.anchor.set(0.5)
            this.mainText.skew.x = 0.2
            this.mainText.y = 170
            this.subText = this.addChild(new Text({ text: this.op.text, style: Data.styles.phazeMainText }))
            this.subText.anchor.set(0.5)
            this.subText.scale.set(0.5)
            this.subText.skew.x = 0.2
            this.subText.y = 240
            this.saveX = 0.5
        },
        update(self) {
            if (this.whileTime(0, this.repeat < 30)) {
                self.mainText.x = frameMove(SW, 340, this.repeat, 40, Easing.easeOutExpo)
                self.subText.x = frameMove(0, 340, this.repeat, 40, Easing.easeOutExpo)
            }
            if (this.whileTime(0, this.repeat < 240)) {
                self.mainText.x -= self.saveX
                self.subText.x += self.saveX
                if (this.repeat > 90) {
                    self.saveX += 0.1 * (this.repeat - 90) * 0.5
                }
            }
            this.$die()
        }
    },
    /**option: 
     * kills 
     * */
    phazeEnd: {
        init: function () {
            this.mainText = this.addChild(new Text({ text: `Phaze End`, style: Data.styles.default }))
            this.mainText.anchor.set(0, 0.5)
            this.mainText.skew.x = 0.2
            this.mainText.y = 520
            this.subTexts = []
            for (let i = 1; i < 4; i++) {
                let text = this.addChild(new Text({ text: `Phaze End`, style: Data.styles.default }))
                text.anchor.set(0, 0.5)
                text.skew.x = 0.2
                text.x = -500
                text.y = this.mainText.y + 40 * i
                text.text = [`해치운 적: ${this.op.kills}`, `최대콤보: ${this.op.combo}`, `최종 점수: ${0}`][i - 1]
                this.subTexts.push(text)
            }
        },
        update: function (self) {
            if (this.whileTime(0, this.repeat < 32)) {
                self.mainText.x = frameMove(-500, 10, this.repeat, 20, Easing.easeOutExpo)
                for (let i = 0; i < 3; i++) {
                    self.subTexts[i].x = frameMove(-500, 10 + 10 * (i + 1), this.repeat - 4 * (i + 1), 20, Easing.easeOutExpo)
                }
            }
            this.whenTime(60)
            if (this.whileTime(0, this.repeat < 32)) {
                self.mainText.x = frameMove(10, -500, this.repeat, 20, Easing.easeOutExpo)
                for (let i = 0; i < 3; i++) {
                    self.subTexts[i].x = frameMove(10 + 10 * (i + 1), -500, this.repeat - 4 * (i + 1), 20, Easing.easeOutExpo)
                }
            }
            this.$die()
        }
    },
    plus: {
        /**@type {{ size:number, width:number, color:string, time:number }}*/op: null,
        init() {
            let plus = new BitmapGraphic()
            plus.drawLine(-200, 0, 200, 0, 50, 'rgba(255,255,255,1)')
            this.addChild(plus)
            this.plus = plus
        },
        update(self) {
            if (this.whileTime(0)) {
                let size = frameMove(0, self.op.size, this.repeat, self.op.time, Easing.easeOutCirc)
                self.plus.clear()
                self.plus.drawLine(-size, 0, size, 0, self.op.width, self.op.color)
                self.plus.drawLine(0, -size, 0, size, self.op.width, self.op.color)
            }
        }
    },
    triangle: {
        init: function () {
            this.tri = Img.sprite("triangle", 64, 'rgba(255, 81, 0, 1)')
            this.addChild(this.tri)
        },
        update: function (self) {
            if (this.whileTime(0)) {
                self.tri.rotation += 0.1
            }
        }
    }
}
