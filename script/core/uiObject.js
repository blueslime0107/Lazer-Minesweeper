
class UIObject extends GameObject {
    constructor() {
        super()
        this.parentPanel = null
        this.isAvailable = true
    }

    setVisible(bool) {
        this.visible = bool;
        this.parentPanel?.updateLayout(); // Optional Chaining 사용
    }

    toggleVisible() {
        if (this.visible) {
            this.hide()
        }
        else {
            this.show()
        }
    }
}
export class TextObject extends UIObject {
    constructor(option) {
        super()
        this.textClass = new Text(option)
        this.textClass.x = 0
        this.textClass.y = 0
        if(option.position){
            this.x = option.position.x
            this.y = option.position.y
        }
        this.addChild(this.textClass)
    }
}
window.TextObject = TextObject

class CheckBox extends UIObject {
    constructor(labelText, onChange = () => { }) {
        super();
        this.name = "checkbox";
        this.object = new Container();
        this.labelText = labelText;
        this.onChange = onChange;
        this.checked = false;
        this.init();
    }

    init() {
        // 바깥 박스
        this.box = Img.sprite("rect", 32);
        this.box.anchor.set(0, 0.5);         // 왼쪽 정렬
        this.box.tint = 0xffffff;
        this.box.alpha = 1;

        // 체크 표시용 내부 박스
        this.inner = Img.sprite("rect", 24, 0x00ff88);
        this.inner.anchor.set(0.5);
        this.inner.tint = 0x00ff88;
        this.inner.alpha = 1;
        this.inner.position.set(16, 0);      // 바깥 박스 안 가운데쯤
        this.inner.visible = false;

        this.touchArea = Img.sprite("rect", 32, 0xffffff);
        this.touchArea.anchor.set(0, 0.5);
        this.touchArea.alpha = 0;
        this.touchArea.eventMode = "static";
        this.touchArea.cursor = "pointer";

        // 라벨 텍스트
        this.label = new Text({
            text: this.labelText,
            style: TXTSTY.cardEffect
        });
        this.label.anchor.set(0, 0.5);
        this.label.x = 40;
        this.label.eventMode = "static";
        this.label.cursor = "pointer";

        const toggle = () => {
            this.checked = !this.checked;
            this.inner.visible = this.checked;
            this.onChange(this.checked);
        };

        this.touchArea.on("pointertap", toggle);
        this.label.on("pointertap", toggle);

        this.object.addChild(this.box);
        this.object.addChild(this.inner);
        this.object.addChild(this.label);
        this.object.addChild(this.touchArea);
    }

    update() {
        super.update();
        this.object.position.set(this.x, this.y);
    }

    updateSize() { }
}
export class Button extends UIObject {
    /**
     * @param {Point} pos - 버튼 위치
     * @param {Object} options - 버튼 옵션
     * @param {PIXI.Sprite} options.sprite - 기본 버튼 스프라이트
     * @param {string} options.highlightMode - 'glow' | 'negative' | 'custom'
     * @param {PIXI.Sprite} [options.customSprite] - 'custom' 모드일 때 보여줄 스프라이트
     * @param {Function} onPressFunc - 클릭 시 실행될 함수
     */
    constructor(pos, options = {}, onPressFunc) {
        super();
        this.set(pos);

        // 기본 옵션 설정
        this.baseSprite = options.sprite;
        this.highlightMode = options.highlightMode || 'negative';
        this.customSprite = options.customSprite || null;
        this.pressed = onPressFunc;
        this.isAvailable = true;

        // 필터 미리 생성
        this.negFilter = new PIXI.ColorMatrixFilter();
        this.negFilter.negative();
        
        this.glowFilter = new PIXI.ColorMatrixFilter();
        this.glowFilter.brightness(1.5); // 1.5배 밝게

        this.init();
    }

    init() {
        this.eventMode = 'static';
        this.cursor = 'pointer';

        // 메인 스프라이트 추가
        if (this.baseSprite) {
            this.baseSprite.anchor.set(0.5);
            this.addChild(this.baseSprite);
        }

        // 커스텀 하이라이트 스프라이트가 있다면 미리 추가하되 숨김 처리
        if (this.highlightMode === 'custom' && this.customSprite) {
            this.customSprite.anchor.set(0.5);
            this.customSprite.visible = false;
            this.addChild(this.customSprite);
        }

        // 이벤트 리스너
        this.on('pointerover', () => this.toggleHighlight(true));
        this.on('pointerout', () => this.toggleHighlight(false));
        this.on('pointerdown', () => this.toggleHighlight(true));
        this.on('pointerup', () => {
            this.toggleHighlight(false);
            this.press();
        });
        this.on('pointerupoutside', () => this.toggleHighlight(false));
    }

    toggleHighlight(isActive) {
        if (!this.isAvailable) return;

        switch (this.highlightMode) {
            case 'glow':
                this.filters = isActive ? [this.glowFilter] : [];
                break;
            case 'negative':
                this.filters = isActive ? [this.negFilter] : [];
                break;
            case 'custom':
                if (this.customSprite && this.baseSprite) {
                    this.baseSprite.visible = !isActive;
                    this.customSprite.visible = isActive;
                }
                break;
        }
    }

    press() {
        if (this.isAvailable && this.pressed) {
            this.pressed();
        }
    }
}
window.Button = Button
class DropDown extends UIObject {
    constructor(options = [], defaultText = "선택", onSelect = () => { }, hide = false) {
        super();
        this.name = "dropdown";
        this.object = new Container();

        this.options = options;
        this.onSelect = onSelect;
        this.selected = null;
        this.isOpen = false;
        this.defaultText = defaultText;
        if (hide) { this.hide() }
        this.init();
    }

    init() {
        // 메인 박스
        this.box = Img.sprite("rect", 1, "rgba(60,60,60,1)");
        this.box.anchor.set(0, 0.5);

        // 라벨
        this.label = new Text({
            text: this.defaultText,
            style: TXTSTY.cardEffect,
        });
        this.label.anchor.set(0, 0.5);
        this.label.x = 10;

        this.caption = new Text({
            text: this.defaultText,
            style: TXTSTY.cardEffect,
        });
        this.caption.anchor.set(0, 0.5);

        // 화살표
        this.arrow = new Text({
            text: "▼",
            style: TXTSTY.cardEffect,
        });
        this.arrow.anchor.set(1, 0.5);

        // 🔥 **터치 전용 오브젝트 (투명 박스)**
        this.touchArea = Img.sprite("rect", 1, "rgba(0,0,0,0)");
        this.touchArea.alpha = 0
        this.touchArea.anchor.set(0, 0.5);
        this.touchArea.eventMode = "static";
        this.touchArea.cursor = "pointer";

        this.touchArea.on("pointertap", () => {
            this.toggle();
        });

        this.object.addChild(this.caption);
        this.object.addChild(this.box);
        this.object.addChild(this.label);
        this.object.addChild(this.arrow);
        this.object.addChild(this.touchArea);

        // 옵션 리스트
        this.listContainer = new Container();
        this.listContainer.visible = false;
        this.object.addChild(this.listContainer);

        this.makeOptions();
    }


    makeOptions() {
        this.listContainer.removeChildren();

        let yOffset = 50;
        let width = this.width
        this.options.forEach((opt, idx) => {
            const item = new Container();
            // 배경
            const bg = Img.sprite("rect", 0, 0x404040);
            bg.scale.set(width, 40)
            bg.anchor.set(0, 0.5); // Graphics이면 anchor 없음 → 무시됨
            item.addChild(bg);

            // 텍스트
            const text = new Text({
                text: opt,
                style: TXTSTY.cardEffect,
            });
            text.anchor.set(0, 0.5);
            text.x = 10;
            item.addChild(text);

            // 🔥 터치 전용 오브젝트
            const touchArea = Img.sprite("rect", 1, "rgba(0,0,0,0)");
            touchArea.width = width;
            touchArea.height = 40;
            touchArea.anchor?.set?.(0, 0.5);
            touchArea.eventMode = "static";
            touchArea.cursor = "pointer";
            touchArea.alpha = 0

            // 클릭 이벤트는 반드시 touchArea에만!
            touchArea.on("pointertap", () => {
                this.select(idx);
            });

            // hover 효과도 touchArea에서만 처리
            touchArea.on("pointerover", () => {
                bg.tint = 0x777777;
            });
            touchArea.on("pointerout", () => {
                bg.tint = 0x404040;
            });

            item.addChild(touchArea);

            item.y = yOffset;
            yOffset += 45;

            this.listContainer.addChild(item);
        });

    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.object.zIndex = 999
        this.isOpen = true;
        this.listContainer.visible = true;
    }

    close() {
        this.object.zIndex = 0
        this.isOpen = false;
        this.listContainer.visible = false;
    }

    select(index) {
        this.selected = index;
        this.label.text = this.options[index]; // 텍스트 표시
        this.close();
        this.onSelect(index); // 콜백에도 index 반환
    }

    update() {
        this.object.position.set(this.x, this.y);

        const w = this.width || 200;
        const h = this.height || 50;

        // 메인 박스
        this.box.width = w;
        this.box.height = h;

        // 🔥 터치 영역도 동일하게 맞춰줌
        this.touchArea.width = w;
        this.touchArea.height = h;

        // 옵션들도 크기 동기화
        this.resizeOptions(w);
    }


    updateSize(width, height) {
        this.box.x = this.caption.width
        this.touchArea.x = this.caption.width
        this.label.x = this.caption.width + 5
        this.width = width - this.caption.width
        this.height = height;
        this.caption.x = 0
        this.arrow.x = this.width + this.caption.width - 20
        this.resizeOptions(width);
    }

    resizeOptions(width) {
        if (!this.listContainer) return;

        for (let item of this.listContainer.children) {
            const bg = item.children[0];        // 배경
            const touch = item.children[2];     // 터치 영역

            bg.x = this.box.x
            item.children[1].x = this.box.x + 5
            bg.width = width;
            touch.width = width;

        }
    }
}
class TextBox extends UIObject {
    constructor(placeholder = "", onChange = () => { }, hide = false) {
        super();
        this.name = "textbox";
        this.object = new Container();

        this.placeholder = placeholder;
        this.onChange = onChange;

        this.textValue = "";
        this.active = false;
        this.isComposing = false;  // IME 조합 중인지 여부
        this.init();
        if (hide) { this.hide() }
    }

    init() {
        // 배경 박스
        this.box = Img.sprite("rect", 1, "rgba(60,60,60,1)");
        this.box.anchor.set(0, 0.5);

        // 표시 텍스트
        this.label = new Text({
            text: this.placeholder,
            style: TXTSTY.cardEffect,
        });
        this.label.anchor.set(0, 0.5);
        this.label.x = 10;

        // 커서
        this.cursor = new Text({
            text: "|",
            style: TXTSTY.cardEffect,
        });
        this.cursor.anchor.set(0, 0.5);
        this.cursor.visible = false;

        // 터치 전용 영역
        this.touchArea = Img.sprite("rect", 1);
        this.touchArea.alpha = 0
        this.touchArea.anchor.set(0, 0.5);
        this.touchArea.eventMode = "static";
        this.touchArea.cursor = "text";

        this.touchArea.on("pointertap", () => {
            this.activate();
        });

        this.object.addChild(this.box);
        this.object.addChild(this.label);
        this.object.addChild(this.cursor);
        this.object.addChild(this.touchArea);

        // 🔥 숨겨진 input 생성 (IME용)
        this.createHiddenInput();

        // 커서 깜빡임
        this._blinkState = false;
        this._blinkTimer = setInterval(() => {
            if (this.active) {
                this._blinkState = !this._blinkState;
                this.cursor.visible = this._blinkState;
            } else {
                this.cursor.visible = false;
            }
        }, 500);

        // 전역 클릭하면 포커스 해제
        app.stage.eventMode = "static";
        app.stage.on("pointerdown", (e) => {
            if (!this.active) return;

            // TextBox 내부 클릭인지 확인
            const b = this.object.getBounds();
            const p = e.global;

            const inside =
                p.x >= b.x &&
                p.x <= b.x + b.width &&
                p.y >= b.y &&
                p.y <= b.y + b.height;

            if (!inside) {
                this.deactivate();  // ← 여기서 커서 완전 숨김
            }
        });

    }

    createHiddenInput() {
        const input = document.createElement("input");
        input.type = "text";
        input.style.position = "absolute";
        input.style.opacity = "0";
        input.style.pointerEvents = "none";
        input.style.zIndex = "-1";
        // 필요하면 ime-mode 추가
        // input.style.imeMode = "active"; // 일부 브라우저만

        document.body.appendChild(input);
        this.inputEl = input;

        input.addEventListener("compositionstart", () => {
            this.isComposing = true;
        });

        input.addEventListener("compositionupdate", () => {
            // 조합 중에도 계속 UI에 반영해야 즉시 표시됨
            this.syncFromInput();
        });

        input.addEventListener("compositionend", () => {
            this.isComposing = false;
            this.syncFromInput();
        });

        input.addEventListener("input", () => {
            // IME든 일반 입력이든 모두 즉시 반영
            this.syncFromInput();
        });

        // Enter 처리 (조합 끝난 후)
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                this.deactivate();
            }
        });
    }

    syncFromInput() {
        this.textValue = this.inputEl.value;
        this.updateLabel();
        this.onChange(this.textValue);
    }

    activate() {
        this.active = true;
        // 현재 값 → input으로 복사
        this.inputEl.value = this.textValue;
        this.inputEl.focus();
        this.updateLabel();
    }

    deactivate() {
        this.active = false;
        this.inputEl.blur();
        this.updateLabel();
    }

    updateLabel() {
        if (!this.active && this.textValue === "") {
            // 비활성 + 내용 없음 → placeholder 표시
            this.label.text = this.placeholder;
            this.cursor.visible = false;
        } else {
            this.label.text = this.textValue;
            // 커서 위치: 텍스트 뒤
            this.cursor.x = this.label.x + this.label.width + 2;
            this.cursor.y = this.label.y;
        }
    }

    update() {
        this.object.position.set(this.x, this.y);

        const w = this.width || 200;
        const h = this.height || 50;

        this.box.width = w;
        this.box.height = h;

        this.touchArea.width = w;
        this.touchArea.height = h;
    }

    updateSize(width, height) {
        this.width = width;
        this.height = height;
    }
}
class UIPanel extends UIObject {
    constructor(width = 400, height = 600, options = {}) {
        super();
        this.name = "panel";
        this.object = new Container();

        // 기본 스타일
        this.panelWidth = width;
        this.panelHeight = height;

        this.padding = options.padding ?? 20;
        this.gap = options.gap ?? 15;

        this.elements = [];

        this.init();
    }

    init() {
        // 패널 배경
        this.bg = Img.sprite("rect", 1, "rgba(30,30,30,0.9)");
        this.bg.anchor.set(0.5);
        this.object.addChild(this.bg);

        // 요소들을 담는 Container
        this.content = new Container();
        this.object.addChild(this.content);

        this.updateLayout();
    }
    addElement(elem) {
        elem.parentPanel = this; // 👈 패널 참조 저장
        this.elements.push(elem);
        this.content.addChild(elem.object);
        this.updateLayout();
    }


    updateLayout() {
        // 패널 배경 크기
        this.bg.width = this.panelWidth;
        this.bg.height = this.panelHeight;

        // 시작 y위치
        let y = -this.panelHeight / 2 + this.padding;

        // 보이는 요소들만 정렬
        this.elements.forEach(elem => {
            if (!elem.visible) return; // 👈 숨겨진 요소는 스킵

            elem.set(
                -this.panelWidth / 2 + this.padding,
                y
            );

            elem.updateSize(
                this.panelWidth - this.padding * 2,
                elem.height ?? 50
            );

            y += (elem.height ?? 50) + this.gap;
        });
    }



    update() {
        this.object.position.set(this.x, this.y);

        // 내부 요소들 업데이트
        for (let e of this.elements) e.update();
    }

    updateSize(width, height) {
        this.panelWidth = width;
        this.panelHeight = height;
        this.updateLayout();
    }

    show() {
        this.object.visible = true;
        this.visible = true
        console.log(this.visible)
    }

    hide() {
        this.object.visible = false;
        this.visible = false
    }
}

export class GagueBar extends PIXI.Container {
    /**
     * @param {Object} options - 옵션
     * @param {number[]} options.size - 옵션
     * @param {string} options.color - 기본 버튼 스프라이트
     * @param {boolean} options.outLine - 'glow' | 'negative' | 'custom'
     * @param {string} options.background - 'custom' 모드일 때 보여줄 스프라이트
     * @param {string} options.numType - 클릭 시 실행될 함수
     * @param {Point} options.textPos - 클릭 시 실행될 함수
     */
    constructor(options) {
        super(options)
        const {
            size,
            color,
            numType = 'none',
            textPos = {x:0,y:0},
            outLine = true,
            background = 'rgba(255,255,255,0.1)'
        } = options;

        this.barWidth = size[0]
        this.barHeight = size[1]
        this.color = color
        this.numType = numType
        this.textPos = textPos
        this.outLine = outLine
        this.background = background
        this.initGague()
    }

    initGague() {
        this.innerBlack = Img.sprite("rect", 1,this.background,{anchor:{x:0,y:0.5}})

        this.inner = Img.sprite("rect", 1, this.color,{anchor:{x:0,y:1}})

        this.gagueFrame = new Graphics()
        this.setWidthHeight(this.barWidth, this.barHeight)

        this.currValueText = new BitmapText({
            text: "",
            style: Data.styles.gagueText,
            anchor: 0.5,
            position: this.textPos,
            tint: this.color
        })

        this.addChild(this.innerBlack, this.inner, this.gagueFrame, this.currValueText)
    }

    setWidthHeight(w, h) {
        this.barWidth = w
        this.barHeight = h
        this.gagueFrame.clear()
        let s = this.outLine ? 7 : 0
        let s2 = this.outLine ? 4 : 0
        this.gagueFrame.rect(0, -this.barHeight * 0.5, this.barWidth, this.barHeight).stroke({ width: s, color: this.color, alignment: 0 })
        this.gagueFrame.rect(0, -this.barHeight * 0.5, this.barWidth, this.barHeight).stroke({ width: s2, color: 0, alignment: 0 })
        this.innerBlack.scale.set(w, h)
        this.inner.position.y = this.barHeight / 2
        this.inner.scale.set(0)
    }

    update(value, maxValue) {
        const scale = this.barWidth * value / maxValue
        this.inner.scale.set((scale<0) ? 0 : scale, this.barHeight)
        if(this.numType == 'none'){
            this.currValueText.text = ""
        }
        if(this.numType == 'number'){
            this.currValueText.text = `${value}/${maxValue}`
        }
        if(this.numType == 'percent'){
            this.currValueText.text = `${String(Math.floor(value/maxValue*100)).padStart(2,'0')}%`
        }
    }
}
window.GagueBar = GagueBar
