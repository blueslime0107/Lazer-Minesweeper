class ScenePause extends SceneObject {
    constructor() {
        super()
        this.exitHide = true
        this.menuItems = []
        this.menuIndex = 0
    }

    init() {
        this.root = new Container()
        this.addChild(this.root)

        this.bg = Img.sprite('rect', [SW, SH], 'rgba(0, 0, 0, 0.6)', {
            anchor: 0.5,
            position: { x: SW * 0.5, y: SH * 0.5 }
        })
        this.root.addChild(this.bg)

        this.pauseTitle = new Text({
            text: Lang.t('pause_title', 'PAUSED'),
            style: Data.styles.pauseTitle,
            anchor: 0.5,
            position: { x: SW * 0.5, y: SH * 0.25 }
        })
        this.root.addChild(this.pauseTitle)

        this.menuContainer = new Container()
        this.menuContainer.position.set(SW * 0.5, SH * 0.5)
        this.root.addChild(this.menuContainer)

        this.buildMenu()
    }

    buildMenu() {
        this.menuContainer.removeChildren()
        this.menuItems.length = 0

        const entries = [
            {
                key: 'pause_resume',
                fallback: 'Resume',
                onSelect: () => this.resume()
            },
            {
                key: 'pause_save',
                fallback: 'Save',
                onSelect: () => {
                    Opt.saveAll()
                }
            },
            {
                key: 'pause_back_title',
                fallback: 'Back to Title',
                onSelect: () => {
                    Opt.saveAll()
                    Scene.enter(Scene.sceneList.Title)
                    Scene.sceneList.MainGame.visible = false
                }
            }
        ]

        entries.forEach((entry, i) => {
            const label = new Text({
                text: Lang.t(entry.key, entry.fallback),
                style: Data.styles.pauseMenu,
                anchor: 0.5,
                position: { x: 0, y: i * 58 }
            })
            label.eventMode = 'static'
            label.cursor = 'pointer'
            label.on('pointertap', () => {
                this.menuIndex = i
                entry.onSelect()
            })

            this.menuItems.push({ label, onSelect: entry.onSelect })
            this.menuContainer.addChild(label)
        })

        this.refreshHighlight()
    }

    refreshHighlight() {
        this.menuItems.forEach((item, i) => {
            const selected = i === this.menuIndex
            item.label.style.fill = selected ? 0xfff26b : 0xffffff
            item.label.scale.set(selected ? 1.08 : 1)
        })
    }

    resume() {
        Scene.enter(Scene.sceneList.MainGame)
    }

    enter() {
        this.menuIndex = 0
        this.pauseTitle.text = Lang.t('pause_title', 'PAUSED')
        this.buildMenu()
    }

    update() {
        if (Input.isPressed(KeyBind.CANCEL)) {
            this.resume()
            return
        }

        if (Input.isPressed(KeyBind.UP)) {
            this.menuIndex = (this.menuIndex - 1 + this.menuItems.length) % this.menuItems.length
            this.refreshHighlight()
        }
        if (Input.isPressed(KeyBind.DOWN)) {
            this.menuIndex = (this.menuIndex + 1) % this.menuItems.length
            this.refreshHighlight()
        }
        if (Input.isPressed(KeyBind.OK)) {
            this.menuItems[this.menuIndex].onSelect()
        }
    }
}

window.scenePause = new ScenePause()
