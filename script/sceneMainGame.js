
export class GameManager extends SceneObject {
    constructor() {
        super()
        this.session = {
            mode: 'new-game',
            stage: gameData.defaultStage,
            cow: 20,
            row: 10,
            mineAmount: 30
        }
        this.stage = null
        this.board = []
        this.boardConfig = null
        this.openedSafeCells = 0
        this.totalSafeCells = 0
        this.gameOver = false
        this.gameClear = false
        this.flagCount = 0
    }

    init() {
        this.root = new Container()
        this.addChild(this.root)

        this.headerText = new Text({
            text: 'MINESWEEPER',
            style: Data.styles.mineHeader,
            anchor: 0.5,
            position: { x: SW * 0.5, y: 70 }
        })
        this.root.addChild(this.headerText)

        this.statusText = new Text({
            text: '',
            style: Data.styles.mineStatus,
            anchor: 0.5,
            position: { x: SW * 0.5, y: 122 }
        })
        this.root.addChild(this.statusText)

        this.infoText = new Text({
            text: '',
            style: Data.styles.mineStatus,
            anchor: 0.5,
            position: { x: SW * 0.5, y: 156 }
        })
        this.root.addChild(this.infoText)

        this.helpText = new Text({
            text: '좌클릭: 개방 / 우클릭: 깃발 / Z: 새 판 / ESC: 일시정지',
            style: Data.styles.helpText,
            anchor: 0.5,
            position: { x: SW * 0.5, y: SH - 38 }
        })
        this.root.addChild(this.helpText)

        this.boardRoot = new Container()
        this.root.addChild(this.boardRoot)
    }

    enter(option = null) {
        if (option) {
            this.session = {
                ...this.session,
                ...option
            }
        }

        const shouldReset = !this.boardConfig
            || option?.mode === 'new-game'
            || Object.prototype.hasOwnProperty.call(option || {}, 'cow')
            || Object.prototype.hasOwnProperty.call(option || {}, 'row')
            || Object.prototype.hasOwnProperty.call(option || {}, 'mineAmount')

        if (shouldReset) {
            this.startNewGame()
        } else {
            this.refreshHud()
        }
    }

    update() {
        super.update()
        this.updateHover()

        if (Input.isPressed(KeyBind.CANCEL)) {
            Scene.enter(Scene.sceneList.Pause)
            return
        }

        if (Input.isPressed(KeyBind.OK)) {
            this.startNewGame()
        }
    }

    startNewGame() {
        Rnd.init()
        this.boardConfig = this.normalizeBoardConfig(this.session)
        this.board = this.createBoard(this.boardConfig)
        this.openedSafeCells = 0
        this.totalSafeCells = this.boardConfig.cow * this.boardConfig.row - this.boardConfig.mineAmount
        this.gameOver = false
        this.gameClear = false
        this.flagCount = 0
        this.renderBoard()
        this.refreshHud()
    }

    normalizeBoardConfig(option) {
        const cow = Math.max(2, Math.floor(option.cow || 10))
        const row = Math.max(2, Math.floor(option.row || 10))
        const maxMineAmount = Math.max(1, cow * row - 1)
        const mineAmount = Math.max(1, Math.min(maxMineAmount, Math.floor(option.mineAmount || 14)))

        return { cow, row, mineAmount }
    }

    createBoard(config) {
        const board = Array.from({ length: config.row }, (_, rowIndex) => {
            return Array.from({ length: config.cow }, (_, colIndex) => ({
                row: rowIndex,
                col: colIndex,
                isMine: false,
                isOpen: false,
                isFlagged: false,
                adjacent: 0,
                coverSprite: null,
                numberText: null,
                flagText: null
            }))
        })

        const positions = []
        for (let rowIndex = 0; rowIndex < config.row; rowIndex++) {
            for (let colIndex = 0; colIndex < config.cow; colIndex++) {
                positions.push({ row: rowIndex, col: colIndex })
            }
        }

        for (let index = positions.length - 1; index > 0; index--) {
            const swapIndex = Math.floor(Rnd.random() * (index + 1))
            const temp = positions[index]
            positions[index] = positions[swapIndex]
            positions[swapIndex] = temp
        }

        for (let index = 0; index < config.mineAmount; index++) {
            const { row, col } = positions[index]
            board[row][col].isMine = true
        }

        return board
    }

    renderBoard() {
        this.boardRoot.removeChildren()

        const { cow, row } = this.boardConfig
        const padding = 6
        const marginX = 160
        const marginTop = 210
        const marginBottom = 90
        const cellSize = Math.floor(Math.min((SW - marginX * 2 - padding * 2) / cow, (SH - marginTop - marginBottom - padding * 2) / row))
        const boardWidth = cellSize * cow + padding * 2
        const boardHeight = cellSize * row + padding * 2

        this.boardRoot.position.set((SW - boardWidth) * 0.5, marginTop + (SH - marginTop - marginBottom - boardHeight) * 0.5)

        this._cellSize = cellSize
        this._padding = padding
        this._hoveredRow = -1
        this._hoveredCol = -1
        this._highlightedCells = []

        this.addBoardFrame(boardWidth, boardHeight)
        this.addBoardGrid(boardWidth, boardHeight, cellSize, padding)

        for (let rowIndex = 0; rowIndex < row; rowIndex++) {
            for (let colIndex = 0; colIndex < cow; colIndex++) {
                const cell = this.board[rowIndex][colIndex]
                const centerX = padding + colIndex * cellSize + cellSize * 0.5
                const centerY = padding + rowIndex * cellSize + cellSize * 0.5

                const coverSize = Math.max(6, cellSize - 4)
                cell.coverSprite = Img.sprite('rect', [coverSize, coverSize], 'rgb(158, 158, 158)', {
                    anchor: 0.5,
                    position: { x: centerX, y: centerY }
                })
                cell.coverSprite.eventMode = 'static'
                cell.coverSprite.cursor = 'pointer'
                cell.coverSprite.on('pointertap', (e) => {
                    if (e.button === 2) return
                    this.openCell(cell.row, cell.col)
                })
                cell.coverSprite.on('rightclick', () => {
                    this.toggleFlag(cell.row, cell.col)
                })
                this.boardRoot.addChild(cell.coverSprite)

                cell.highlightSprite = Img.sprite('rect', [coverSize, coverSize], 'rgba(255, 255, 255, 1)', {
                    anchor: 0.5,
                    position: { x: centerX, y: centerY },
                    alpha: 0.25
                })
                cell.highlightSprite.visible = false
                this.boardRoot.addChild(cell.highlightSprite)

                cell.flagText = new Text({
                    text: '▶',
                    style: Data.styles.mineCellNumber,
                    anchor: 0.5,
                    position: { x: centerX, y: centerY }
                })
                cell.flagText.tint = 0xd32f2f
                cell.flagText.visible = false
                this.boardRoot.addChild(cell.flagText)

                cell.numberText = new Text({
                    text: '',
                    style: Data.styles.mineCellNumber,
                    anchor: 0.5,
                    position: { x: centerX, y: centerY }
                })
                cell.numberText.visible = false
                cell.numberText.eventMode = 'static'
                cell.numberText.cursor = 'pointer'
                cell.numberText.on('pointertap', (e) => {
                    if (e.button === 2) return
                    this.chordCell(cell.row, cell.col)
                })
                this.boardRoot.addChild(cell.numberText)

                const mineSize = Math.max(4, coverSize * 0.55)
                cell.mineSprite = Img.sprite('circle', mineSize, 'rgba(220, 40, 40, 1)', {
                    anchor: 0.5,
                    position: { x: centerX, y: centerY }
                })
                cell.mineSprite.visible = false
                this.boardRoot.addChild(cell.mineSprite)
            }
        }
    }

    addBoardFrame(boardWidth, boardHeight) {
        const borderWidth = 4
        this.boardRoot.addChild(Img.sprite('rect', [boardWidth + borderWidth * 2, boardHeight + borderWidth * 2], 'rgba(0, 0, 0, 1)', {
            anchor: 0.5,
            position: { x: boardWidth * 0.5, y: boardHeight * 0.5 },
            alpha: 0.5
        }))
        const edges = [
            Img.line({ x: 0, y: 0 }, { x: boardWidth, y: 0 }, borderWidth, 0x000000, 1),
            Img.line({ x: 0, y: boardHeight }, { x: boardWidth, y: boardHeight }, borderWidth, 0x000000, 1),
            Img.line({ x: 0, y: 0 }, { x: 0, y: boardHeight }, borderWidth, 0x000000, 1),
            Img.line({ x: boardWidth, y: 0 }, { x: boardWidth, y: boardHeight }, borderWidth, 0x000000, 1)
        ]

        edges.forEach((edge) => {
            this.boardRoot.addChild(edge)
        })
    }

    addBoardGrid(boardWidth, boardHeight, cellSize, padding) {
        for (let colIndex = 1; colIndex < this.boardConfig.cow; colIndex++) {
            this.boardRoot.addChild(Img.line(
                { x: padding + colIndex * cellSize, y: padding },
                { x: padding + colIndex * cellSize, y: boardHeight - padding },
                5,
                0x000000,
                0.18
            ))
        }

        for (let rowIndex = 1; rowIndex < this.boardConfig.row; rowIndex++) {
            this.boardRoot.addChild(Img.line(
                { x: padding, y: padding + rowIndex * cellSize },
                { x: boardWidth - padding, y: padding + rowIndex * cellSize },
                5,
                0x000000,
                0.18
            ))
        }
    }

    toggleFlag(rowIndex, colIndex) {
        if (this.gameOver || this.gameClear) return
        const cell = this.board[rowIndex]?.[colIndex]
        if (!cell || cell.isOpen) return

        cell.isFlagged = !cell.isFlagged
        cell.flagText.visible = cell.isFlagged
        this.flagCount += cell.isFlagged ? 1 : -1
        this.refreshHud()
    }

    chordCell(rowIndex, colIndex) {
        if (this.gameOver || this.gameClear) return
        const cell = this.board[rowIndex]?.[colIndex]
        if (!cell || !cell.isOpen || cell.adjacent === 0) return

        const visibleMines = this.getVisibleQueenLineCells(this.board, rowIndex, colIndex)
        const flaggedCount = visibleMines.filter((n) => n.isFlagged).length
        if (flaggedCount !== cell.adjacent) return

        const neighbors = this.getNeighborCells(this.board, rowIndex, colIndex)
        neighbors.forEach((n) => {
            if (!n.isOpen && !n.isFlagged) {
                this.openCell(n.row, n.col)
            }
        })
    }

    openCell(rowIndex, colIndex) {
        if (this.gameOver || this.gameClear) {
            return
        }

        const cell = this.board[rowIndex]?.[colIndex]
        if (!cell || cell.isOpen || cell.isFlagged) {
            return
        }

        if (cell.isMine) {
            this.showMine(cell)
            this.revealAllMines()
            this.gameOver = true
            this.refreshHud()
            return
        }

        const stack = [cell]
        while (stack.length > 0) {
            const current = stack.pop()
            if (!current || current.isOpen || current.isMine) {
                continue
            }

            current.isOpen = true
            this.openedSafeCells += 1

            this.recalculateVisible()

            if (current.adjacent === 0) {
                const neighbors = this.getNeighborCells(this.board, current.row, current.col)
                neighbors.forEach((neighbor) => {
                    if (!neighbor.isOpen && !neighbor.isMine) {
                        stack.push(neighbor)
                    }
                })
            }
        }

        if (this.openedSafeCells >= this.totalSafeCells) {
            this.gameClear = true
            this.refreshHud()
            return
        }

        this.refreshHud()
        this._hoveredRow = -1
        this._hoveredCol = -1
    }

    showMine(cell) {
        cell.coverSprite.tint = 0x8b0000
        cell.flagText.visible = false
        cell.mineSprite.visible = true
    }

    revealAllMines() {
        for (let rowIndex = 0; rowIndex < this.board.length; rowIndex++) {
            for (let colIndex = 0; colIndex < this.board[rowIndex].length; colIndex++) {
                const cell = this.board[rowIndex][colIndex]
                if (!cell.isMine) continue
                this.showMine(cell)
            }
        }
    }

    applyCellState(cell) {
        cell.coverSprite.visible = !cell.isOpen
        cell.coverSprite.eventMode = cell.isOpen ? 'passive' : 'static'
        cell.coverSprite.cursor = cell.isOpen ? 'default' : 'pointer'

        if (!cell.isOpen) {
            cell.numberText.visible = false
            return
        }

        if (cell.adjacent > 0) {
            cell.numberText.text = String(cell.adjacent)
            cell.numberText.tint = this.getNumberTint(cell.adjacent)
            cell.numberText.visible = true
            return
        }

        cell.numberText.visible = false
    }

    getNumberTint(value) {
        const palette = {
            1: 0x1d4ed8,
            2: 0x15803d,
            3: 0xb91c1c,
            4: 0x312e81,
            5: 0x854d0e,
            6: 0x0f766e,
            7: 0x111827,
            8: 0x4b5563
        }

        return palette[value] || 0x1f2937
    }

    getNeighborCells(board, rowIndex, colIndex) {
        const neighbors = []

        for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
            for (let colOffset = -1; colOffset <= 1; colOffset++) {
                if (rowOffset === 0 && colOffset === 0) {
                    continue
                }

                const nextRow = rowIndex + rowOffset
                const nextCol = colIndex + colOffset
                const cell = board[nextRow]?.[nextCol]
                if (cell) {
                    neighbors.push(cell)
                }
            }
        }

        return neighbors
    }

    getQueenLineCells(board, rowIndex, colIndex) {
        const cells = []
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ]

        for (const [dr, dc] of directions) {
            let r = rowIndex + dr
            let c = colIndex + dc
            while (board[r]?.[c]) {
                cells.push(board[r][c])
                r += dr
                c += dc
            }
        }

        return cells
    }

    countQueenLineMines(board, rowIndex, colIndex) {
        return this.getVisibleQueenLineCells(board, rowIndex, colIndex)
            .filter((cell) => cell.isMine)
            .length
    }

    getVisibleQueenLineCells(board, rowIndex, colIndex) {
        const cells = []
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ]

        for (const [dr, dc] of directions) {
            let r = rowIndex + dr
            let c = colIndex + dc
            while (board[r]?.[c]) {
                const target = board[r][c]
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

    recalculateVisible() {
        for (let rowIndex = 0; rowIndex < this.board.length; rowIndex++) {
            for (let colIndex = 0; colIndex < this.board[rowIndex].length; colIndex++) {
                const cell = this.board[rowIndex][colIndex]
                if (!cell.isOpen || cell.isMine) continue
                cell.adjacent = this.countQueenLineMines(this.board, rowIndex, colIndex)
                this.applyCellState(cell)
            }
        }
    }

    refreshHud() {
        const { cow, row, mineAmount } = this.boardConfig
        this.infoText.text = `${cow} x ${row} / 지뢰 ${mineAmount}`

        if (this.gameOver) {
            this.statusText.text = '지뢰를 밟았습니다. Z 또는 Enter로 새 판을 시작합니다.'
            this.statusText.tint = 0xa61b1b
            return
        }

        if (this.gameClear) {
            this.statusText.text = '모든 안전한 칸을 열었습니다. Z 또는 Enter로 새 판을 시작합니다.'
            this.statusText.tint = 0x166534
            return
        }

        this.statusText.text = `안전 칸 ${this.openedSafeCells} / ${this.totalSafeCells}  |  깃발 ${this.flagCount} / ${this.boardConfig.mineAmount}`
        this.statusText.tint = 0x1f2937
    }

    updateHover() {
        if (!this.boardConfig || !this._cellSize) return

        const local = this.boardRoot.toLocal(Input.currentPos)
        const col = Math.floor((local.x - this._padding) / this._cellSize)
        const row = Math.floor((local.y - this._padding) / this._cellSize)

        if (row < 0 || row >= this.boardConfig.row || col < 0 || col >= this.boardConfig.cow) {
            if (this._hoveredRow !== -1) {
                this.clearHighlights()
                this._hoveredRow = -1
                this._hoveredCol = -1
            }
            return
        }

        if (this._hoveredRow === row && this._hoveredCol === col) return
        this._hoveredRow = row
        this._hoveredCol = col

        const cell = this.board[row]?.[col]
        if (!cell || !cell.isOpen) {
            this.clearHighlights()
            return
        }
        this.highlightQueenLine(row, col)
    }

    getHighlightCells(rowIndex, colIndex) {
        const cells = [this.board[rowIndex][colIndex]]
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ]

        for (const [dr, dc] of directions) {
            let r = rowIndex + dr
            let c = colIndex + dc
            while (this.board[r]?.[c]) {
                const cell = this.board[r][c]
                cells.push(cell)
                if (!cell.isOpen) break
                r += dr
                c += dc
            }
        }

        return cells
    }

    highlightQueenLine(rowIndex, colIndex) {
        this.clearHighlights()
        const origin = this.board[rowIndex][colIndex]
        const tint = origin.adjacent > 0 ? this.getNumberTint(origin.adjacent) : 0xffffff
        this._highlightedCells = this.getHighlightCells(rowIndex, colIndex)
        for (const cell of this._highlightedCells) {
            cell.highlightSprite.tint = cell.isOpen ? 0xffffff : tint
            cell.highlightSprite.visible = true
        }
    }

    clearHighlights() {
        if (!this._highlightedCells) return
        for (const cell of this._highlightedCells) {
            cell.highlightSprite.visible = false
        }
        this._highlightedCells = []
    }
}

// 우클릭 컨텍스트 메뉴 방지
window.addEventListener('contextmenu', (e) => e.preventDefault())

window.gm = new GameManager()