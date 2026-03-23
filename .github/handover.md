# 인수인계 문서 — Chord(자동 개방) 기능

## 요청 사항

개방된 셀(빈 셀 포함)을 클릭했을 때:
1. 그 셀의 퀸라인 가시 셀(검사 대상) 중 깃발 수를 센다
2. 깃발 수 === cell.adjacent(표시된 숫자, 빈 셀은 0)이면
3. 깃발이 없는 나머지 가시 셀을 모두 `openCell`로 개방한다

## 현재 상태 (sceneMainGame.js)

### 완료된 작업

- **클릭 처리 방식 변경**: 개별 `coverSprite`의 이벤트 → `boardRoot` 컨테이너에 `hitArea` + `pointertap` 핸들러로 전환
  - 이유: PixiJS에서 `visible=false`, `alpha=0`, `renderable=false` 스프라이트는 히트 테스트에서 제외됨
  - `boardRoot.hitArea`에 `contains()` 함수를 정의하여 보드 영역 내 클릭만 수신
  - 클릭 좌표를 셀 좌표(row, col)로 변환 후 `cell.isOpen` 여부에 따라 `chordCell` / `openCell` 분기

- **`chordCell` 메서드 구현** (현재 코드):
  ```js
  chordCell(rowIndex, colIndex) {
      const cell = this.board[rowIndex][colIndex]
      const visibleCells = this.getVisibleQueenLineCells(this.board, rowIndex, colIndex)
      const flaggedCount = visibleCells.filter(n => n.isFlagged).length
      if (flaggedCount !== cell.adjacent) return
      visibleCells.forEach(n => {
          if (!n.isFlagged) this.openCell(n.row, n.col)
      })
  }
  ```

- **`chordCell`에서 `adjacent === 0` 가드 제거**: 빈 셀(adjacent=0)도 chord 대상

### 미해결 버그

**개방된 셀 클릭 시 chord가 동작하지 않는 문제**

여러 차례 시도한 접근과 실패 원인:

| 시도 | 방법 | 실패 원인 |
|------|------|-----------|
| 1 | `coverSprite`에 이벤트, `alpha=0`으로 투명화 | PixiJS: `worldAlpha=0`이면 히트 테스트 제외 |
| 2 | 별도 `openBgSprite` (`rgba(0,0,0,0)`) 추가 | `Img.sprite`가 색상 alpha를 스프라이트 alpha에 설정 → alpha=0 → 이벤트 미수신 |
| 3 | `openBgSprite` (`rgba(255,255,255,1)`) + `alpha=0.01` | `visible=false`에서 시작 → PixiJS: visible=false면 이벤트 미수신 |
| 4 | `coverSprite`에 `renderable=false` 사용 | PixiJS: renderable=false도 히트 테스트에서 제외될 수 있음 |
| 5 | `boardRoot` 컨테이너에 `hitArea` + `pointertap` | **현재 방식** — 클릭 이벤트 수신은 해결됐으나, 동작 여부 미확인 |

### 디버깅 시 확인할 점

1. **`boardRoot.pointertap` 이벤트가 발생하는가?**
   - `boardRoot.on('pointertap', ...)` 핸들러 진입 확인
   - `e.global` 좌표가 올바른 셀로 매핑되는지 확인

2. **`chordCell`이 호출되는가?**
   - `cell.isOpen === true`인지 확인
   - `chordCell` 진입 후 `visibleCells` 목록 확인

3. **`openCell`이 실제로 셀을 여는가?**
   - `openCell` 진입 시 `cell.isOpen`이 이미 `true`인 경우 → while 루프에서 `current.isOpen` 체크로 `continue` → 아무것도 안 열림
   - 이것은 정상 동작(이미 열린 셀은 건너뜀)이지만, chord에서 넘어온 셀이 이미 열려있다면 문제

4. **`recalculateVisible` 부작용 확인**
   - `openCell`의 while 루프 안에서 매 셀 개방마다 `recalculateVisible()` 호출
   - 이것이 `adjacent` 값을 바꾸면서 chord 조건에 영향을 줄 수 있음

## 관련 메서드 요약

| 메서드 | 역할 |
|--------|------|
| `getVisibleQueenLineCells` | 8방향 퀸라인으로 각 방향의 첫 번째 **미개방** 셀 반환 |
| `countQueenLineMines` | 가시 셀 중 지뢰 수 (`adjacent` 계산용) |
| `getNeighborCells` | 8칸 인접 셀 (일반 지뢰찾기의 인접 셀) |
| `getQueenLineCells` | 8방향 퀸라인 전체 셀 (사용 안 함) |
| `recalculateVisible` | 모든 개방 셀의 `adjacent` 재계산 + `applyCellState` |
| `applyCellState` | `coverSprite.visible`, `numberText` 표시 갱신 |

## 게임 구조 특이사항

- **퀸라인 지뢰찾기**: 일반 지뢰찾기와 달리, 8방향으로 **직선 연장**하여 첫 미개방 셀까지 검사
- `adjacent`(숫자)는 퀸라인 가시 셀 중 지뢰 수 (일반 지뢰찾기의 인접 8칸이 아님)
- 셀이 개방될 때마다 `recalculateVisible()`로 **전체 보드의 adjacent를 재계산**
- `openCell`의 flood fill은 `getNeighborCells`(8칸 인접)을 사용하여 확산
