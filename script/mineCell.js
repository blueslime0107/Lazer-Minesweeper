export class MineCell {
    static COVER_TINT = 0x9e9e9e

    constructor(rowIndex, colIndex, cellSize, padding, callbacks) {
        this.row = rowIndex
        this.col = colIndex
        this.isMine = false
        this.isOpen = false
        this.isFlagged = false
        this.adjacent = 0

        this._cellSize = cellSize
        this._padding = padding
        this._callbacks = callbacks

        this.coverSprite = null
        this.highlightBorder = null
        this.flagText = null
        this.numberText = null
        this.mineSprite = null

        this._createSprites()
    }

    get centerX() {
        return this._padding + this.col * this._cellSize + this._cellSize * 0.5
    }

    get centerY() {
        return this._padding + this.row * this._cellSize + this._cellSize * 0.5
    }

    _createSprites() {
        const cx = this.centerX
        const cy = this.centerY
        const coverSize = Math.max(6, this._cellSize - 4)

        // 미개방 상태 커버
        this.coverSprite = Img.sprite('rect', [coverSize, coverSize], 'rgb(158, 158, 158)', {
            anchor: 0.5,
            position: { x: cx, y: cy },
            eventMode: 'static',
            cursor: 'pointer'
        })
        this.coverSprite.on('pointerdown', (e) => {
            if (e.button === 2) return
            this._callbacks.onLeftClick(this.row, this.col)
        })
        this.coverSprite.on('rightclick', () => {
            this._callbacks.onRightClick(this.row, this.col)
        })

        // 하이라이트 테두리
        this.highlightBorder = Img.sprite('rect', [coverSize + 4, coverSize + 4], 'rgba(255,255,255,0.5)', {
            anchor: 0.5,
            position: { x: cx, y: cy },
            visible: false
        })

        // 깃발
        this.flagText = new Text({
            text: '🏳️',
            style: Data.styles.mineCellNumber,
            anchor: 0.5,
            position: { x: cx, y: cy },
            scale: coverSize/59*1.5,
            tint: "#ff0000",
            visible: false
        })

        // 숫자
        this.numberText = new Text({
            text: '',
            style: Data.styles.mineCellNumber,
            anchor: 0.5,
            position: { x: cx, y: cy },
            scale: coverSize/59 *1.5 ,
            visible: false
        })

        // 지뢰
        this.mineSprite = new Text({
            text: '💥',
            style: Data.styles.mineCellImogii,
            anchor: 0.5,
            position: { x: cx, y: cy },
            scale: coverSize/59 *1.5 ,
            visible: false
        })
    }

    /** 셀 상태에 따라 스프라이트 갱신 */
    applyCellState() {
        this.coverSprite.visible = !this.isOpen

        if (!this.isOpen) {
            this.numberText.visible = false
            return
        }

        if (this.adjacent > 0) {
            this.numberText.text = String(this.adjacent)
            this.numberText.tint = MineCell.getNumberTint(this.adjacent)
            this.numberText.visible = true
            return
        }

        this.numberText.visible = false
    }

    toggleFlag() {
        this.isFlagged = !this.isFlagged
        this.flagText.visible = this.isFlagged
        if (this.isFlagged && this.coverSprite.tint !== MineCell.COVER_TINT) {
            this.flagText.tint = 0xffff00
        }
    }

    showMine() {
        this.coverSprite.visible = true
        this.coverSprite.tint = 0x8b0000
        this.flagText.visible = false
        this.mineSprite.visible = true
    }

    showHighlight() {
        this.highlightBorder.visible = true
    }

    hideHighlight() {
        this.highlightBorder.visible = false
    }

    resetCoverTint() {
        this.coverSprite.tint = MineCell.COVER_TINT
        this.highlightBorder.visible = false
        if (this.isFlagged) this.flagText.tint = 0xff0000
    }

    static getNumberTint(value) {
        const palette = {
            1: "#1d4ed8",
            2: "#15803d",
            3: "#b91c1c",
            4: "#312e81",
            5: "#854d0e",
            6: "#0f766e",
            7: "#111827",
            8: "#4b5563"
        }
        return palette[value] || "#1f2937"
    }
}
