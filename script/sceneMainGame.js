
import { GameBoard } from './gameBoard.js'

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
        /** @type {GameBoard} */
        this.gameBoard = null
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

        this.infoText = new Text({
            text: '',
            style: Data.styles.mineStatus,
            anchor: 0.5,
            position: { x: SW * 0.5, y: 106 }
        })
        this.root.addChild(this.infoText)

        this.helpText = new Text({
            text: '좌클릭: 개방 / 우클릭: 깃발 / Z: 새 판 / ESC: 일시정지',
            style: Data.styles.helpText,
            anchor: 0.5,
            position: { x: SW * 0.5, y: SH - 38 }
        })
        this.root.addChild(this.helpText)

        this.gameBoard = new GameBoard({
            onOpen: (r, c) => this.openCell(r, c),
            onRightClick: (r, c) => this.toggleFlag(r, c)
        })
        this.root.addChild(this.gameBoard)
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

        if (Input.isPressed(KeyBind.CANCEL)) {
            Scene.enter(Scene.sceneList.Pause)
            return
        }

        if (Input.isPressed(KeyBind.OK)) {
            this.startNewGame()
        }

        this.time++;
        this.refreshHud()
    }

    startNewGame() {
        Rnd.init()
        this.boardConfig = this.normalizeBoardConfig(this.session)
        const rawBoard = this.createRawBoard(this.boardConfig)
        this.openedSafeCells = 0
        this.totalSafeCells = this.boardConfig.cow * this.boardConfig.row - this.boardConfig.mineAmount
        this.gameOver = false
        this.gameClear = false
        this.flagCount = 0
        this.time = 0
        this.gameBoard.build(this.boardConfig, rawBoard)
        this.refreshHud()
    }

    normalizeBoardConfig(option) {
        const cow = Math.max(2, Math.floor(option.cow || 10))
        const row = Math.max(2, Math.floor(option.row || 10))
        const maxMineAmount = Math.max(1, cow * row - 1)
        const mineAmount = Math.max(1, Math.min(maxMineAmount, Math.floor(option.mineAmount || 14)))

        return { cow, row, mineAmount }
    }

    /** 지뢰 위치만 담은 원시 보드 데이터 생성 */
    createRawBoard(config) {
        const board = Array.from({ length: config.row }, (_, rowIndex) => {
            return Array.from({ length: config.cow }, (_, colIndex) => ({
                isMine: false
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

    toggleFlag(rowIndex, colIndex) {
        if (this.gameOver || this.gameClear) return
        const cell = this.gameBoard.cells[rowIndex]?.[colIndex]
        if (!cell || cell.isOpen) return

        cell.toggleFlag()
        this.flagCount += cell.isFlagged ? 1 : -1
        this.refreshHud()
    }

    openCell(rowIndex, colIndex) {
        if (this.gameOver || this.gameClear) return

        const cell = this.gameBoard.cells[rowIndex]?.[colIndex]
        if (!cell || cell.isFlagged) return

        if (cell.isMine) {
            cell.showMine()
            this.gameBoard.revealAllMines()
            this.gameOver = true
            this.refreshHud()
            return
        }

        const stack = [cell]
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

        if (this.openedSafeCells >= this.totalSafeCells) {
            this.gameClear = true
            this.refreshHud()
            return
        }

        this.gameBoard.refreshLasers()
        this.refreshHud()
    }

    refreshHud() {
        const totalSec = Math.floor(this.time / 60)
        const mm = String(Math.floor(totalSec / 60)).padStart(2, '0')
        const ss = String(totalSec % 60).padStart(2, '0')
        this.infoText.text = `지뢰 ${Math.max(0, this.boardConfig.mineAmount - this.flagCount)} / 시간 ${mm}:${ss}`
    }
}

// 우클릭 컨텍스트 메뉴 방지
window.addEventListener('contextmenu', (e) => e.preventDefault())

window.gm = new GameManager()