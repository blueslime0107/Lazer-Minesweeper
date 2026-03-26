
import { GameBoard } from './gameBoard.js'

export class GameManager extends SceneObject {
    constructor() {
        super()
        this.session = {
            mode: 'new-game',
            stage: gameData.defaultStage,
            cow: 10,
            row: 10,
            mineAmount: 10
        }
        this.stage = null
        /** @type {GameBoard} */
        this.gameBoard = null
        this.boardConfig = null
        this.openedSafeCells = 0
        this.totalSafeCells = 0
        this.gameOver = false
        this.gameClear = false
        this.flagCount = 0
        this.time = 0
        this.phase = 'select' // 'select' | 'playing' | 'result'
    }

    init() {
        this.root = new Container()
        this.addChild(this.root)


        // Game Board
        this.gameBoard = new GameBoard({
            onOpen: (r, c) => this.openCell(r, c),
            onRightClick: (r, c) => this.toggleFlag(r, c)
        })
        this.root.addChild(this.gameBoard)
        // HUD
        this.infoText = new Text({
            text: '',
            style: Data.styles.mineStatus,
            anchor: 0.5,
            position: { x: 644, y: 30 }
        })
        this.root.addChild(this.infoText)

        // Difficulty Select Screen
        this._createDifficultySelect()

        // Side Buttons (visible during play)
        this._createSideButtons()

        // Result Overlay (game over / clear)
        this._createResultOverlay()

        // Language Buttons
        this._createLangButtons()
    }

    // ─── Difficulty Select ───────────────────────

    _createDifficultySelect() {
        this.selectContainer = new Container()
        this.root.addChild(this.selectContainer)
        this._createDifficultySelect_content()
    }

    _createDifficultySelect_content() {
        const title = new Text({
            text: 'Lazer Minesweeper',
            style: Data.styles.titleHeader,
            anchor: 0.5,
            position: { x: SW * 0.5, y: SH * 0.2 }
        })
        this.selectContainer.addChild(title)

        const difficulties = [
            { key: 'diff_easy', fallback: '쉬움', color: 'rgba(46, 125, 50, 0.85)', id: 'easy', desc: '10 × 10  /  💣 10' },
            { key: 'diff_normal', fallback: '보통', color: 'rgba(21, 101, 192, 0.85)', id: 'normal', desc: '18 × 14  /  💣 40' },
            { key: 'diff_hard', fallback: '어려움', color: 'rgba(183, 28, 28, 0.85)', id: 'hard', desc: '28 × 16  /  💣 99' }
        ]

        const startY = SH * 0.42
        const spacing = 90

        difficulties.forEach((diff, i) => {
            const bg = Img.sprite('rect', [300, 70], diff.color, { anchor: 0.5 })
            const btn = new Button(
                { x: SW * 0.5, y: startY + i * spacing },
                { sprite: bg, highlightMode: 'glow' },
                () => this._startWithDifficulty(diff.id)
            )

            const label = new Text({
                text: Lang.t(diff.key, diff.fallback),
                style: Data.styles.difficultyBtn,
                anchor: 0.5,
                position: { x: 0, y: -10 }
            })
            btn.addChild(label)

            const desc = new Text({
                text: diff.desc,
                style: Data.styles.helpText,
                anchor: 0.5,
                position: { x: 0, y: 20 }
            })
            btn.addChild(desc)

            this.selectContainer.addChild(btn)
        })
    }

    // ─── Side Buttons ────────────────────────────build

    _createSideButtons() {
        this.sideContainer = new Container()
        this.root.addChild(this.sideContainer)
        this._createSideButtons_content()
    }

    _createSideButtons_content() {
        const difficulties = [
            { key: 'diff_easy', fallback: '쉬움', color: 'rgba(46, 125, 50, 0.85)', id: 'easy' },
            { key: 'diff_normal', fallback: '보통', color: 'rgba(21, 101, 192, 0.85)', id: 'normal' },
            { key: 'diff_hard', fallback: '어려움', color: 'rgba(183, 28, 28, 0.85)', id: 'hard' }
        ]

        const btnY = SH - 22
        const startX = SW * 0.5 - 160
        const spacing = 160

        difficulties.forEach((diff, i) => {
            const bg = Img.sprite('rect', [140, 44], diff.color, { anchor: 0.5 })
            const btn = new Button(
                { x: startX + i * spacing, y: btnY },
                { sprite: bg, highlightMode: 'glow' },
                () => this._startWithDifficulty(diff.id)
            )

            const label = new Text({
                text: Lang.t(diff.key, diff.fallback),
                style: Data.styles.difficultyBtnSmall,
                anchor: 0.5,
                position: { x: 0, y: 0 }
            })
            btn.addChild(label)

            this.sideContainer.addChild(btn)
        })
    }

    // ─── Result Overlay ──────────────────────────

    _createResultOverlay() {
        this.resultOverlay = new Container()
        this.root.addChild(this.resultOverlay)

        this.resultBg = Img.sprite('rect', [SW, SH], 'rgba(0, 0, 0, 0.7)', {
            anchor: 0.5,
            position: { x: SW * 0.5, y: SH * 0.5 }
        })
        this.resultBg.eventMode = 'static'
        this.resultOverlay.addChild(this.resultBg)

        this.resultTitle = new Text({
            text: '',
            style: Data.styles.resultTitle,
            anchor: 0.5,
            position: { x: SW * 0.5, y: SH * 0.33 }
        })
        this.resultOverlay.addChild(this.resultTitle)

        this.resultTime = new Text({
            text: '',
            style: Data.styles.resultTime,
            anchor: 0.5,
            position: { x: SW * 0.5, y: SH * 0.45 }
        })
        this.resultOverlay.addChild(this.resultTime)

        const restartBg = Img.sprite('rect', [220, 54], 'rgba(33, 150, 243, 0.9)', { anchor: 0.5 })
        this.restartBtn = new Button(
            { x: SW * 0.5, y: SH * 0.58 },
            { sprite: restartBg, highlightMode: 'glow' },
            () => {
                this._showPhase('playing')
                this.startNewGame()
            }
        )
        const restartLabel = new Text({
            text: Lang.t('restart', '재시작'),
            style: Data.styles.restartBtn,
            anchor: 0.5,
            position: { x: 0, y: 0 }
        })
        this.restartBtn.addChild(restartLabel)
        this.resultOverlay.addChild(this.restartBtn)
    }

    // ─── Language Buttons ─────────────────────────

    _createLangButtons() {
        this.langContainer = new Container()
        this.root.addChild(this.langContainer)

        const langs = [
            { flag: '🇰🇷', langIndex: 1 },
            { flag: '🇺🇸', langIndex: 2 },
            { flag: '🇯🇵', langIndex: 3 }
        ]

        const startX = 40
        const btnY = SH - 22
        const spacing = 50

        this._langLabels = []

        langs.forEach((lang, i) => {
            const bg = Img.sprite('rect', [42, 36], 'rgba(80, 80, 80, 0.7)', { anchor: 0.5 })
            const btn = new Button(
                { x: startX + i * spacing, y: btnY },
                { sprite: bg, highlightMode: 'glow' },
                () => this._changeLanguage(lang.langIndex)
            )

            const label = new Text({
                text: lang.flag,
                style: Data.styles.helpText,
                anchor: 0.5,
                position: { x: 0, y: 0 }
            })
            btn.addChild(label)

            this.langContainer.addChild(btn)
        })
    }

    _changeLanguage(langIndex) {
        Opt.setOption({ language: langIndex })
        this._refreshAllTexts()
    }

    _refreshAllTexts() {
        // Refresh HUD
        if (this.boardConfig) this.refreshHud()

        // Rebuild difficulty select labels
        this.selectContainer.removeChildren()
        this._createDifficultySelect_content()

        // Rebuild side button labels
        this.sideContainer.removeChildren()
        this._createSideButtons_content()

        // Refresh result overlay texts
        this.restartBtn.children.forEach(c => {
            if (c instanceof Text) c.text = Lang.t('restart', '재시작')
        })
    }

    // ─── Phase Management ────────────────────────

    _showPhase(phase) {
        this.phase = phase
        this.selectContainer.visible = phase === 'select'
        this.gameBoard.visible = phase !== 'select'
        this.sideContainer.visible = phase === 'playing'
        this.infoText.visible = phase !== 'select'
        this.resultOverlay.visible = phase === 'result'
    }

    _startWithDifficulty(difficulty) {
        const configs = {
            easy: { cow: 10, row: 10, mineAmount: 10 },
            normal: { cow: 18, row: 14, mineAmount: 40 },
            hard: { cow: 28, row: 16, mineAmount: 99 }
        }
        this.session = { ...this.session, ...configs[difficulty] }
        this._showPhase('playing')
        this.startNewGame()
    }

    _showResult(isClear) {
        this._showPhase('result')

        const totalSec = Math.floor(this.time / 60)
        const mm = String(Math.floor(totalSec / 60)).padStart(2, '0')
        const ss = String(totalSec % 60).padStart(2, '0')

        if (isClear) {
            this.resultTitle.text = Lang.t('game_clear', '클리어!')
            this.resultTime.visible = true
            this.resultTime.text = `${Lang.t('time_label', '걸린 시간')}: ${mm}:${ss}`
        } else {
            this.resultTitle.text = Lang.t('game_over', '실패')
            this.resultTime.visible = false
        }
    }

    // ─── Scene Lifecycle ─────────────────────────

    enter(option = null) {
        if (!this.boardConfig) {
            this._showPhase('select')
        }
    }

    update() {
        super.update()

        if (this.phase === 'playing') {
            if (!this.gameOver && !this.gameClear) {
                this.time++
                this.refreshHud()
            }
        }
    }

    // ─── Game Logic ──────────────────────────────

    startNewGame() {
        Rnd.init()
        this.boardConfig = this.normalizeBoardConfig(this.session)
        const emptyBoard = this.createEmptyBoard(this.boardConfig)
        this.openedSafeCells = 0
        this.totalSafeCells = this.boardConfig.cow * this.boardConfig.row - this.boardConfig.mineAmount
        this.gameOver = false
        this.gameClear = false
        this.flagCount = 0
        this.time = 0
        this.firstClick = true
        this.gameBoard.build(this.boardConfig, emptyBoard, {
            left: 20,
            right: 20,
            top: 60,
            bottom: 50
        })
        this.refreshHud()
    }

    normalizeBoardConfig(option) {
        const cow = Math.max(2, Math.floor(option.cow || 10))
        const row = Math.max(2, Math.floor(option.row || 10))
        const maxMineAmount = Math.max(1, cow * row - 1)
        const mineAmount = Math.max(1, Math.min(maxMineAmount, Math.floor(option.mineAmount || 14)))

        return { cow, row, mineAmount }
    }

    /** 지뢰 없는 빈 보드 생성 */
    createEmptyBoard(config) {
        return Array.from({ length: config.row }, () => {
            return Array.from({ length: config.cow }, () => ({
                isMine: false
            }))
        })
    }

    /** 첫 클릭 후 지뢰 배치 (excludeSet 위치에는 지뢰를 놓지 않음) */
    placeMines(config, safeRow, safeCol) {
        const excludeSet = new Set()
        excludeSet.add(`${safeRow},${safeCol}`)
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue
                const nr = safeRow + dr
                const nc = safeCol + dc
                if (nr >= 0 && nr < config.row && nc >= 0 && nc < config.cow) {
                    excludeSet.add(`${nr},${nc}`)
                }
            }
        }

        const positions = []
        for (let r = 0; r < config.row; r++) {
            for (let c = 0; c < config.cow; c++) {
                if (!excludeSet.has(`${r},${c}`)) {
                    positions.push({ row: r, col: c })
                }
            }
        }

        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Rnd.random() * (i + 1))
            const temp = positions[i]
            positions[i] = positions[j]
            positions[j] = temp
        }

        const mineCount = Math.min(config.mineAmount, positions.length)
        for (let i = 0; i < mineCount; i++) {
            const { row, col } = positions[i]
            this.gameBoard.cells[row][col].isMine = true
        }
    }

    toggleFlag(rowIndex, colIndex) {
        if (this.gameOver || this.gameClear) return
        const cell = this.gameBoard.cells[rowIndex]?.[colIndex]
        if (!cell || cell.isOpen) return

        cell.toggleFlag()
        this.flagCount += cell.isFlagged ? 1 : -1
        this.refreshHud()

        if (this.checkClear()) return
    }

    openCell(rowIndex, colIndex) {
        if (this.gameOver || this.gameClear) return

        const cell = this.gameBoard.cells[rowIndex]?.[colIndex]
        if (!cell || cell.isFlagged) return

        // 첫 클릭 시 지뢰 배치 + 첫 셀 인접 수 0 보장
        if (this.firstClick) {
            this.firstClick = false
            this.placeMines(this.boardConfig, rowIndex, colIndex)
            this._ensureFirstCellZero(rowIndex, colIndex)

            if (this.checkClear()) return
            this.gameBoard.refreshLasers()
            this.refreshHud()
            return
        }

        if (cell.isMine) {
            cell.showMine()
            this.gameBoard.revealAllMines()
            this.gameOver = true
            this._showResult(false)
            return
        }

        this._doFloodFill(cell)

        if (this.checkClear()) return

        this.gameBoard.refreshLasers()
        this.refreshHud()
    }

    /** flood-fill 개방 */
    _doFloodFill(startCell) {
        const stack = [startCell]
        while (stack.length > 0) {
            const current = stack.pop()
            if (!current || current.isOpen || current.isMine || current.isFlagged) continue

            current.isOpen = true
            this.openedSafeCells += 1

            this.gameBoard.recalculateVisible()

            if (current.adjacent === 0) {
                const neighbors = this.gameBoard.getNeighborCells(current.row, current.col)
                neighbors.forEach((neighbor) => {
                    if (!neighbor.isMine) {
                        stack.push(neighbor)
                    }
                })
            }
        }
    }

    /** 첫 클릭 셀의 표시 숫자가 0이 되도록 지뢰 재배치 */
    _ensureFirstCellZero(firstRow, firstCol) {
        const maxAttempts = 50
        const firstCell = this.gameBoard.cells[firstRow][firstCol]

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            this._doFloodFill(firstCell)

            if (firstCell.adjacent === 0) return

            // 첫 셀의 퀸라인에 보이는 지뢰 찾기
            const visibleMines = this.gameBoard.getVisibleQueenLineCells(firstRow, firstCol)
                .filter(c => c.isMine)

            // 재배치 후보: 지뢰가 아니고 개방되지 않은 셀
            const candidates = []
            for (let r = 0; r < this.boardConfig.row; r++) {
                for (let c = 0; c < this.boardConfig.cow; c++) {
                    const cell = this.gameBoard.cells[r][c]
                    if (!cell.isMine && !cell.isOpen) {
                        candidates.push(cell)
                    }
                }
            }

            for (const mine of visibleMines) {
                if (candidates.length === 0) break
                const idx = Math.floor(Rnd.random() * candidates.length)
                const target = candidates[idx]
                mine.isMine = false
                target.isMine = true
                candidates.splice(idx, 1)
            }

            // 보드 리셋 후 재시도
            this._resetAllCells()
        }

        // 최대 시도 초과 시 그대로 flood-fill 진행
        this._doFloodFill(firstCell)
    }

    /** 모든 셀을 미개방 상태로 리셋 */
    _resetAllCells() {
        const { row, cow } = this.boardConfig
        for (let r = 0; r < row; r++) {
            for (let c = 0; c < cow; c++) {
                const cell = this.gameBoard.cells[r][c]
                cell.isOpen = false
                cell.adjacent = 0
                cell.applyCellState()
            }
        }
        this.openedSafeCells = 0
    }

    checkClear() {
        if (this.gameOver || this.gameClear) return false

        // 안전한 셀 모두 개방
        if (this.openedSafeCells >= this.totalSafeCells) {
            this.gameClear = true
            this._showResult(true)
            return true
        }

        // 모든 지뢰에 깃발이 정확히 놓여있는지 확인
        if (this.flagCount === this.boardConfig.mineAmount) {
            const { row, cow } = this.boardConfig
            let allMinesFlagged = true
            for (let r = 0; r < row && allMinesFlagged; r++) {
                for (let c = 0; c < cow && allMinesFlagged; c++) {
                    const cell = this.gameBoard.cells[r][c]
                    if (cell.isMine && !cell.isFlagged) allMinesFlagged = false
                }
            }
            if (allMinesFlagged) {
                this.gameClear = true
                this._showResult(true)
                return true
            }
        }

        return false
    }

    refreshHud() {
        const totalSec = Math.floor(this.time / 60)
        const mm = String(Math.floor(totalSec / 60)).padStart(2, '0')
        const ss = String(totalSec % 60).padStart(2, '0')
        this.infoText.text = `${Lang.t('hud_mine', '지뢰')} ${Math.max(0, this.boardConfig.mineAmount - this.flagCount)} / ${Lang.t('hud_time', '시간')} ${mm}:${ss}`
    }
}

// 우클릭 컨텍스트 메뉴 방지
window.addEventListener('contextmenu', (e) => e.preventDefault())

window.gm = new GameManager()