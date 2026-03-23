class SceneTitle extends SceneObject {
  constructor() {
    super();
    this.menuItems = [];
    this.optionItems = [];
    this.menuIndex = 0;
    this.optionIndex = 0;
    this.menuMode = 'menu';
    this.toastTimer = 0;
  }

  init() {

    this.bgTop = Img.sprite('rect', [SW, SH * 0.5], 'rgba(35, 105, 165, 1)', { anchor: { x: 0.5, y: 0 }, position: { x: SW * 0.5, y: 0 } });
    this.bgBottom = Img.sprite('rect', [SW, SH * 0.5], 'rgba(18, 24, 44, 1)', { anchor: { x: 0.5, y: 0 }, position: { x: SW * 0.5, y: SH * 0.5 } });

    this.titleText = new TextObject({
      text: 'Common Game Core',
      style: Data.styles.titleHeader,
      anchor: 0.5,
      position: { x: SW * 0.5, y: -48} // SH * 0.16 
    });
    this.titleText.MoveTime(pos(SW * 0.5, SH * 0.16), 30, Easing.easeOutCubic);
    this.addChildUpdate(this.titleText)

    this.subTitle = new TextObject({
      text: 'Menu / Option / Save / MainGame',
      style: Data.styles.subtitle,
      anchor: 0.5,
      position: { x: SW * 0.5, y: SH * 0.24 }
    });
    this.addChildUpdate(this.subTitle)

    this.menuContainer = new Container({
         position: { x: SW * 0.5, y: SH * 0.45 }
    });
    this.addChild(this.menuContainer);

    this.optionContainer = new Container();
    this.optionContainer.position.set(SW * 0.5, SH * 0.45);
    this.optionContainer.visible = false;

    this.toast = new Text({
      text: '',
      style: Data.styles.toast,
      anchor: 0.5,
      position: { x: SW * 0.5, y: SH * 0.85 }
    });
    this.toast.visible = false;

    this.buildMenu();
    this.buildOptionMenu();
  }

  buildMenu() {
    this.menuContainer.removeChildren();
    this.menuItems.length = 0;

    const entries = [
      {
        key: 'menu_start',
        fallback: 'Start Game',
        onSelect: () => Scene.enter(Scene.sceneList.MainGame, { mode: 'new-game' })
      },
      {
        key: 'menu_continue',
        fallback: 'Continue',
        onSelect: () => Scene.enter(Scene.sceneList.MainGame, { mode: 'continue' })
      },
      {
        key: 'menu_option',
        fallback: 'Option',
        onSelect: () => this.openOption()
      },
      {
        key: 'menu_save',
        fallback: 'Save Now',
        onSelect: () => {
          Opt.saveAll();
          this.showToast(Lang.t('saved_done', 'Saved.'));
        }
      },
      {
        key: 'menu_exit',
        fallback: 'Exit',
        onSelect: () => {
          if (typeof nw !== 'undefined') {
            nw.Window.get().close();
          } else {
            window.close();
          }
        }
      }
    ];

    entries.forEach((entry, i) => {
      const label = new Text({
        text: Lang.t(entry.key, entry.fallback),
        style: Data.styles.menuItem
      });
      label.anchor.set(0.5);
      label.y = i * 58;
      label.eventMode = 'static';
      label.cursor = 'pointer';
      label.on('pointertap', () => {
        this.menuIndex = i;
        entry.onSelect();
      });

      this.menuItems.push({
        label,
        onSelect: entry.onSelect
      });

      this.menuContainer.addChild(label);
    });

    this.refreshMenuHighlight();
  }

  buildOptionMenu() {
    this.optionContainer.removeChildren();
    this.optionItems.length = 0;

    const makeOptionText = (title, valueGetter) => {
      const textObj = new Text({
        text: '',
        style: Data.styles.optionItem
      });
      textObj.anchor.set(0.5);
      textObj.updateLabel = () => {
        textObj.text = `${title} : ${valueGetter()}`;
      };
      textObj.updateLabel();
      return textObj;
    };

    const bgmText = makeOptionText('BGM', () => Math.round(Opt.option.bgmVolume * 100));
    const sfxText = makeOptionText('SFX', () => Math.round(Opt.option.sfxVolume * 100));
    const langText = makeOptionText(Lang.t('option_language', 'Language'), () => {
      const langObj = Data.languages[Opt.option.language - 1];
      return langObj?.langName || `#${Opt.option.language}`;
    });
    const fullText = makeOptionText(Lang.t('option_fullscreen', 'Fullscreen'), () => Opt.option.fullscreen ? 'ON' : 'OFF');
    const backText = new Text({
      text: Lang.t('menu_back', 'Back'),
      style: Data.styles.optionBack
    });
    backText.anchor.set(0.5);

    const options = [
      {
        label: bgmText,
        left: () => this.adjustVolume('bgmVolume', -0.01),
        right: () => this.adjustVolume('bgmVolume', 0.01)
      },
      {
        label: sfxText,
        left: () => this.adjustVolume('sfxVolume', -0.01),
        right: () => this.adjustVolume('sfxVolume', 0.01)
      },
      {
        label: langText,
        left: () => {
          const total = Data.languages.length || 1;
          const next = Opt.option.language - 1 <= 0 ? total : Opt.option.language - 1;
          Opt.setOption({ language: next });
          this.refreshLocalizedText();
        },
        right: () => {
          Lang.cycleLanguage();
          this.refreshLocalizedText();
        }
      },
      {
        label: fullText,
        left: () => {
          Opt.toggleFullscreen();
        },
        right: () => {
          Opt.toggleFullscreen();
        }
      },
      {
        label: backText,
        left: () => this.closeOption(),
        right: () => this.closeOption(),
        ok: () => this.closeOption()
      }
    ];

    options.forEach((item, i) => {
      item.label.y = i * 54;
      item.label.eventMode = 'static';
      item.label.cursor = 'pointer';
      item.label.on('pointertap', () => {
        this.optionIndex = i;
        (item.ok || item.right)();
        this.refreshOptionLabels();
      });
      this.optionItems.push(item);
      this.optionContainer.addChild(item.label);
    });

    this.refreshOptionLabels();
    this.refreshOptionHighlight();
  }

  refreshLocalizedText() {
    this.buildMenu();
    this.buildOptionMenu();
  }

  adjustVolume(key, delta) {
    const next = Math.max(0, Math.min(0.2, Opt.option[key] + delta));
    Opt.setOption({ [key]: next });
    this.refreshOptionLabels();
  }

  refreshMenuHighlight() {
    this.menuItems.forEach((item, i) => {
      const selected = i === this.menuIndex;
      item.label.style.fill = selected ? 0xfff26b : 0xffffff;
      item.label.scale.set(selected ? 1.08 : 1);
    });
  }

  refreshOptionLabels() {
    this.optionItems.forEach((item) => {
      item.label.updateLabel?.();
    });
  }

  refreshOptionHighlight() {
    this.optionItems.forEach((item, i) => {
      const selected = i === this.optionIndex;
      item.label.style.fill = selected ? 0xa1f5ff : 0xf5fcff;
      item.label.scale.set(selected ? 1.06 : 1);
    });
  }

  openOption() {
    this.menuMode = 'option';
    this.menuContainer.visible = false;
    this.optionContainer.visible = true;
    this.optionIndex = 0;
    this.refreshOptionHighlight();
  }

  closeOption() {
    this.menuMode = 'menu';
    this.menuContainer.visible = true;
    this.optionContainer.visible = false;
    this.refreshMenuHighlight();
  }

  showToast(text) {
    this.toast.text = text;
    this.toast.visible = true;
    this.toastTimer = 120;
  }

  enter() {
    Opt.boot();
    this.menuMode = 'menu';
    this.menuContainer.visible = true;
    this.optionContainer.visible = false;
    this.refreshLocalizedText();
  }

  update() {
    super.update()

    if (this.toastTimer > 0) {
      this.toastTimer -= 1;
      if (this.toastTimer <= 0) {
        this.toast.visible = false;
      }
    }

    if (this.menuMode === 'menu') {
      if (Input.isPressed(KeyBind.UP)) {
        this.menuIndex = (this.menuIndex - 1 + this.menuItems.length) % this.menuItems.length;
        this.refreshMenuHighlight();
      }
      if (Input.isPressed(KeyBind.DOWN)) {
        this.menuIndex = (this.menuIndex + 1) % this.menuItems.length;
        this.refreshMenuHighlight();
      }
      if (Input.isPressed(KeyBind.OK)) {
        this.menuItems[this.menuIndex].onSelect();
      }
      return;
    }

    if (Input.isPressed(KeyBind.UP)) {
      this.optionIndex = (this.optionIndex - 1 + this.optionItems.length) % this.optionItems.length;
      this.refreshOptionHighlight();
    }
    if (Input.isPressed(KeyBind.DOWN)) {
      this.optionIndex = (this.optionIndex + 1) % this.optionItems.length;
      this.refreshOptionHighlight();
    }

    const current = this.optionItems[this.optionIndex];
    if (Input.isPressed(KeyBind.LEFT)) {
      current.left?.();
      this.refreshOptionLabels();
    }
    if (Input.isPressed(KeyBind.RIGHT)) {
      current.right?.();
      this.refreshOptionLabels();
    }
    if (Input.isPressed(KeyBind.OK)) {
      (current.ok || current.right)?.();
      this.refreshOptionLabels();
    }
    if (Input.isPressed(KeyBind.CANCEL)) {
      this.closeOption();
    }
  }
}

window.sceneTitle = new SceneTitle();
