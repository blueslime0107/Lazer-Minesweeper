import { MineCell } from './mineCell.js'

export class GameBoard extends GameObject {
    constructor(callbacks) {
        super()
        this._callbacks = callbacks
        this.cells = []
        this.config = null
        this._cellSize = 0
        this._padding = 6
        this._boardWidth = 0
        this._boardHeight = 0
        this._hoveredRow = -1
        this._hoveredCol = -1
        this._highlightedCells = []

        // 레이어 (하 → 상): 셀 → 레이저 → 숫자
        this._bgLayer = new Container()           // 테두리 + 그리드
        this._coverLayer = new Container()        // 커버 (미개방 셀)
        this._laserGfx = new Graphics()           // 레이저 그래픽
        this._numberLayer = new Container()       // 숫자, 깃발, 지뢰

        this.addChild(this._bgLayer)
        this.addChild(this._coverLayer)
        this.addChild(this._laserGfx)
        this.addChild(this._numberLayer)

        this._laserMask = null

        // 개방된 셀 클릭을 위한 투명 히트 영역
        this._openCellHit = new Container()
        this._openCellHit.eventMode = 'static'
        this._openCellHit.cursor = 'pointer'
        this.addChild(this._openCellHit)

        // 모바일 액션 팝업 레이어 (최상단)
        this._mobilePopup = new Container()
        this._mobilePopupRow = -1
        this._mobilePopupCol = -1
        this._stageDismissOverlay = null
        this.addChild(this._mobilePopup)
    }

    /** 보드 생성 + 렌더링 */
    build(config, board2D, margins = null) {
        this._clear()

        this.config = config
        const { cow, row } = config
        const padding = this._padding
        const mLeft = margins?.left ?? 160
        const mRight = margins?.right ?? 160
        const mTop = margins?.top ?? 210
        const mBottom = margins?.bottom ?? 90

        const cellSize = Math.floor(Math.min(
            (SW - mLeft - mRight - padding * 2) / cow,
            (SH - mTop - mBottom - padding * 2) / row
        ))
        this._cellSize = cellSize
        this._boardWidth = cellSize * cow + padding * 2
        this._boardHeight = cellSize * row + padding * 2

        const availW = SW - mLeft - mRight
        const availH = SH - mTop - mBottom
        this.position.set(
            mLeft + (availW - this._boardWidth) * 0.5,
            mTop + (availH - this._boardHeight) * 0.5
        )

        // 레이저 마스크 설정
        if (this._laserMask) {
            this.removeChild(this._laserMask)
            this._laserMask.destroy()
        }
        this._laserMask = new Graphics()
        this._laserMask.rect(padding, padding, cellSize * cow, cellSize * row).fill({ color: 0xffffff })
        this.addChild(this._laserMask)
        this._laserGfx.mask = this._laserMask

        // 개방 셀 히트영역 설정 — 개방된 셀 위치에서만 true 반환하여 coverSprite 이벤트를 가리지 않음
        this._openCellHit.hitArea = {
            contains: (x, y) => {
                if (x < padding || x >= this._boardWidth - padding ||
                    y < padding || y >= this._boardHeight - padding) return false
                const c = Math.floor((x - padding) / cellSize)
                const r = Math.floor((y - padding) / cellSize)
                const cell = this.cells[r]?.[c]
                return cell ? cell.isOpen : false
            }
        }
        this._openCellHit.on('pointerdown', (e) => {
            if (e.button === 2) return
            const local = this.toLocal(e.global)
            const c = Math.floor((local.x - padding) / cellSize)
            const r = Math.floor((local.y - padding) / cellSize)
            if (r < 0 || r >= row || c < 0 || c >= cow) return
            const cell = this.cells[r]?.[c]
            if (!cell || !cell.isOpen) return
            this.showLasers(r, c)
        })
        this._openCellHit.on('rightclick', (e) => {
            const local = this.toLocal(e.global)
            const c = Math.floor((local.x - padding) / cellSize)
            const r = Math.floor((local.y - padding) / cellSize)
            if (r < 0 || r >= row || c < 0 || c >= cow) return
            this._callbacks.onRightClick(r, c)
        })

        // 프레임 & 그리드
        this._addBoardFrame()
        this._addBoardGrid()

        // 셀 생성
        this.cells = []
        for (let rowIndex = 0; rowIndex < row; rowIndex++) {
            const rowArr = []
            for (let colIndex = 0; colIndex < cow; colIndex++) {
                const src = board2D[rowIndex][colIndex]
                const cell = new MineCell(rowIndex, colIndex, cellSize, padding, {
                    onLeftClick: (r, c) => {
                        if (isMobileDevice()) {
                            this._showMobilePopup(r, c)
                        } else {
                            this._callbacks.onOpen(r, c)
                        }
                    },
                    onRightClick: (r, c) => this._callbacks.onRightClick(r, c)
                })
                cell.isMine = src.isMine

                this._numberLayer.addChild(cell.numberText)
                this._numberLayer.addChild(cell.flagText)
                this._numberLayer.addChild(cell.mineSprite)
                this._coverLayer.addChild(cell.highlightBorder)
                this._coverLayer.addChild(cell.coverSprite)
                rowArr.push(cell)
            }
            this.cells.push(rowArr)
        }

        this._laserRow = -1
        this._laserCol = -1
        this._highlightedCells = []
    }

    _clear() {
        this._bgLayer.removeChildren()
        this._laserGfx.clear()
        this._numberLayer.removeChildren()
        this._coverLayer.removeChildren()
        this._openCellHit.removeAllListeners()
        this._hideMobilePopup()
        this.cells = []
    }

    // ─── 프레임 & 그리드 ─────────────────────────

    _addBoardFrame() {
        const w = this._boardWidth
        const h = this._boardHeight
        const bw = 4

        this._bgLayer.addChild(Img.sprite('rect', [w + bw * 2, h + bw * 2], 'rgba(0,0,0,1)', {
            anchor: 0.5,
            position: { x: w * 0.5, y: h * 0.5 },
            alpha: 0.5
        }))

        const edges = [
            Img.line({ x: 0, y: 0 }, { x: w, y: 0 }, bw, 0x000000, 1),
            Img.line({ x: 0, y: h }, { x: w, y: h }, bw, 0x000000, 1),
            Img.line({ x: 0, y: 0 }, { x: 0, y: h }, bw, 0x000000, 1),
            Img.line({ x: w, y: 0 }, { x: w, y: h }, bw, 0x000000, 1)
        ]
        edges.forEach(e => this._bgLayer.addChild(e))
    }

    _addBoardGrid() {
        const { cow, row } = this.config
        const cs = this._cellSize
        const p = this._padding
        const w = this._boardWidth
        const h = this._boardHeight

        for (let c = 1; c < cow; c++) {
            this._bgLayer.addChild(Img.line(
                { x: p + c * cs, y: p },
                { x: p + c * cs, y: h - p },
                5, 0x000000, 0.18
            ))
        }
        for (let r = 1; r < row; r++) {
            this._bgLayer.addChild(Img.line(
                { x: p, y: p + r * cs },
                { x: w - p, y: p + r * cs },
                5, 0x000000, 0.18
            ))
        }
    }

    // ─── 퀸라인 계산 ─────────────────────────────

    static DIRECTIONS = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [-1, 1], [1, -1], [1, 1]
    ]

    getNeighborCells(rowIndex, colIndex) {
        const neighbors = []
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue
                const cell = this.cells[rowIndex + dr]?.[colIndex + dc]
                if (cell) neighbors.push(cell)
            }
        }
        return neighbors
    }

    getVisibleQueenLineCells(rowIndex, colIndex) {
        const cells = []
        for (const [dr, dc] of GameBoard.DIRECTIONS) {
            let r = rowIndex + dr
            let c = colIndex + dc
            while (this.cells[r]?.[c]) {
                const target = this.cells[r][c]
                if (!target.isOpen) {
                    cells.push(target)
                    break
                }
                r += dr
                c += dc
            }
        }
        return cells
    }

    countQueenLineMines(rowIndex, colIndex) {
        return this.getVisibleQueenLineCells(rowIndex, colIndex)
            .filter(c => c.isMine).length
    }

    recalculateVisible() {
        const { row, cow } = this.config
        for (let r = 0; r < row; r++) {
            for (let c = 0; c < cow; c++) {
                const cell = this.cells[r][c]
                if (!cell.isOpen || cell.isMine) continue
                cell.adjacent = this.countQueenLineMines(r, c)
                cell.applyCellState()
            }
        }
    }

    revealAllMines() {
        const { row, cow } = this.config
        for (let r = 0; r < row; r++) {
            for (let c = 0; c < cow; c++) {
                const cell = this.cells[r][c]
                if (cell.isMine) cell.showMine()
            }
        }
    }

    // ─── 레이저 하이라이트 ───────────────────────

    /** 개방된 셀 클릭 시 레이저 표시/토글 */
    showLasers(rowIndex, colIndex) {
        // 같은 셀 다시 클릭하면 레이저 해제
        if (this._laserRow === rowIndex && this._laserCol === colIndex) {
            this.clearLasers()
            return
        }

        this._laserRow = rowIndex
        this._laserCol = colIndex
        this._drawLasers(rowIndex, colIndex)
    }

    /** 활성 레이저 다시 그리기 (셀 개방 후 갱신용) */
    refreshLasers() {
        if (this._laserRow < 0 || this._laserCol < 0) return
        const cell = this.cells[this._laserRow]?.[this._laserCol]
        if (!cell || !cell.isOpen) {
            this.clearLasers()
            return
        }
        this._drawLasers(this._laserRow, this._laserCol)
    }

    /** 8방향 레이저 그리기 */
    _drawLasers(rowIndex, colIndex) {
        this._clearVisuals()

        const origin = this.cells[rowIndex][colIndex]
        const tint = origin.adjacent > 0
            ? MineCell.getNumberTint(origin.adjacent)
            : 0xffffff
        const cs = this._cellSize
        const p = this._padding

        const ox = p + colIndex * cs + cs * 0.5
        const oy = p + rowIndex * cs + cs * 0.5

        const laserWidth = Math.max(2, Math.floor(cs * 0.5))

        const gfx = this._laserGfx
        gfx.clear()

        for (const [dr, dc] of GameBoard.DIRECTIONS) {
            let r = rowIndex + dr
            let c = colIndex + dc
            let hitCell = null

            // 레이저가 갈 수 있는 끝 지점 찾기
            while (this.cells[r]?.[c]) {
                const target = this.cells[r][c]
                if (!target.isOpen) {
                    hitCell = target
                    break
                }
                r += dr
                c += dc
            }

            let endX, endY, laserColor

            if (hitCell) {
                // 미개방 셀에 닿음 → 그 셀 중심까지, 숫자 색깔
                endX = p + hitCell.col * cs + cs * 0.5
                endY = p + hitCell.row * cs + cs * 0.5
                laserColor = tint

                // 미개방 셀의 커버 색상을 숫자 색으로 변경
                hitCell.coverSprite.tint = tint
                hitCell.showHighlight()
                if (hitCell.isFlagged) hitCell.flagText.tint = 0xffff00
                this._highlightedCells.push(hitCell)
            } else {
                // 테두리까지 → 보드 경계를 넘어서 연장, 흰색
                // 마지막으로 보드 안에 있었던 위치에서 더 연장
                const extendAmount = Math.max(this._boardWidth, this._boardHeight)
                endX = ox + dc * extendAmount
                endY = oy + dr * extendAmount
                laserColor = 0xffffff
            }

            // 레이저 선 그리기
            gfx.moveTo(ox, oy)
                .lineTo(endX, endY)
                .stroke({ width: laserWidth, color: laserColor, alpha: 0.7 })
        }
    }

    /** 레이저 그래픽과 하이라이트만 제거 (상태 유지) */
    _clearVisuals() {
        this._laserGfx.clear()
        for (const cell of this._highlightedCells) {
            cell.resetCoverTint()
        }
        this._highlightedCells = []
    }

    clearLasers() {
        this._clearVisuals()
        this._laserRow = -1
        this._laserCol = -1
    }

    // ─── 모바일 액션 팝업 ────────────────────────

    _showMobilePopup(r, c) {
        this._mobilePopup.removeChildren()
        this._mobilePopupRow = r
        this._mobilePopupCol = c

        const cs = this._cellSize
        const p = this._padding
        const btnR = Math.max(24, Math.floor(cs * 0.48))
        const gap = btnR * 2 + 10

        const cx = p + c * cs + cs * 0.5
        const cy = p + r * cs + cs * 0.5

        // 버튼 위치 계산 (보드 밖으로 나가지 않도록 클램프)
        const minX = p + btnR
        const maxX = this._boardWidth - p - btnR
        const minY = p + btnR
        const maxY = this._boardHeight - p - btnR

        const shovelX = Math.max(minX, Math.min(maxX, cx))
        const shovelY = Math.max(minY, Math.min(maxY, cy))

        // 깃발 버튼: 기본은 오른쪽, 오른쪽 공간 부족 시 왼쪽
        let flagX = shovelX + gap
        if (flagX + btnR > this._boardWidth - p) flagX = shovelX - gap
        flagX = Math.max(minX, Math.min(maxX, flagX))
        const flagY = shovelY

        // 보드 전체 오버레이 (팝업 외부 클릭 감지)
        const bw = this._boardWidth
        const bh = this._boardHeight
        const overlay = new Graphics()
        overlay.rect(0, 0, bw, bh).fill({ color: 0x000000, alpha: 0.001 })
        overlay.eventMode = 'static'
        overlay.hitArea = { contains: (x, y) => x >= 0 && x <= bw && y >= 0 && y <= bh }
        overlay.on('pointerdown', () => this._hideMobilePopup())
        this._mobilePopup.addChild(overlay)

        // 삽 버튼 (셀 개방)
        const shovelBtn = this._makeMobileCircleBtn(shovelX, shovelY, btnR, '⛏️', 0x0d2b0d, 0x44dd44)
        shovelBtn.on('pointerdown', (e) => {
            e.stopPropagation()
            this._hideMobilePopup()
            this._callbacks.onOpen(r, c)
        })
        this._mobilePopup.addChild(shovelBtn)

        // 깃발 버튼 (깃발 설치)
        const flagBtn = this._makeMobileCircleBtn(flagX, flagY, btnR, '🚩', 0x2b0d0d, 0xdd4444)
        flagBtn.on('pointerdown', (e) => {
            e.stopPropagation()
            this._hideMobilePopup()
            this._callbacks.onRightClick(r, c)
        })
        this._mobilePopup.addChild(flagBtn)

        this._mobilePopup.visible = true

        // 보드 외부 클릭 감지: stage 최하단에 전화면 오버레이 등록
        if (this._stageDismissOverlay) {
            app.stage.removeChild(this._stageDismissOverlay)
        }
        this._stageDismissOverlay = new Graphics()
        this._stageDismissOverlay.rect(0, 0, SW, SH).fill({ color: 0x000000, alpha: 0.001 })
        this._stageDismissOverlay.eventMode = 'static'
        this._stageDismissOverlay.hitArea = { contains: (x, y) => x >= 0 && x <= SW && y >= 0 && y <= SH }
        this._stageDismissOverlay.on('pointerdown', () => this._hideMobilePopup())
        // 다음 프레임에 등록 (현재 탭 이벤트가 즉시 트리거되지 않도록)
        setTimeout(() => {
            if (this._stageDismissOverlay) {
                app.stage.addChildAt(this._stageDismissOverlay, 0)
            }
        }, 0)
    }

    _hideMobilePopup() {
        if (this._stageDismissOverlay) {
            if (this._stageDismissOverlay.parent) {
                app.stage.removeChild(this._stageDismissOverlay)
            }
            this._stageDismissOverlay = null
        }
        this._mobilePopup.visible = false
        this._mobilePopup.removeChildren()
        this._mobilePopupRow = -1
        this._mobilePopupCol = -1
    }

    _makeMobileCircleBtn(x, y, radius, icon, bgColor, borderColor) {
        const container = new Container()
        container.position.set(x, y)
        container.eventMode = 'static'
        container.cursor = 'pointer'

        const gfx = new Graphics()
        gfx.circle(0, 0, radius).fill({ color: bgColor, alpha: 0.92 })
        gfx.circle(0, 0, radius).stroke({ width: 3, color: borderColor, alpha: 1 })
        container.addChild(gfx)

        const label = new Text({
            text: icon,
            style: Data.styles.mineCellImogii,
            anchor: 0.5,
            position: { x: 0, y: 0 },
            scale: radius / 30
        })
        container.addChild(label)

        return container
    }
}
