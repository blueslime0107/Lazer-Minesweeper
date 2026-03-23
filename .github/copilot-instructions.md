# Copilot Instructions — Game Engine Core

## Project Overview

PixiJS + Three.js 기반 게임 프레임워크. `main/`이 공통 코어이며, `game/`, `arithmos/`는 파생 프로젝트.
NW.js(우선) + 브라우저 겸용. 해상도 1280×720, 60FPS 고정 루프.

## Architecture

```
main/
  index.html          ← 진입점 (스크립트 로드 순서 중요!)
  script/
    __globalCustom.js  ← 커스텀 전역 선언
    _gameD.js          ← 게임 데이터/설정 (const로 선언)
    sceneTitle.js      ← 씬 구현 파일 (scene + 이름)
    sceneMainGame.js
    core/
      _global.js       ← var 전역 변수 선언
      _main.js         ← 부팅 시퀀스 + 게임 루프
      gameManagers.js  ← 모든 매니저 클래스
      gameObjects.js   ← GameObject, SceneObject 등
      uiObject.js      ← UI 컴포넌트
      utils.js         ← 유틸리티 함수
  resources/
    textures/          ← 이미지 에셋 (경로: ./resources/textures/)
    translate/         ← 언어 JSON + langList.txt
```

## Script Loading Order (CRITICAL)

index.html에서 순서가 보장되어야 함:
1. fpsmeter → __globalCustom → _global → utils
2. gameObjects → gameManagers → uiObject (module)
3. pixi.js → pixi-filters → three.module (라이브러리)
4. _gameD.js (게임 데이터)
5. _main.js (부팅, module)

## Key Global Objects

| 전역변수 | 클래스 | 역할 |
|---------|--------|------|
| `Input` | InputManager | 키보드/마우스/터치 입력 |
| `Img` | TextureManager | 스프라이트 생성 |
| `Tm` | ThreeManager | 3D 배경 관리 |
| `Am` | AudioManager | BGM/SFX 재생 |
| `Save` | SaveManager | 저장 (NW.js 파일/localStorage) |
| `Scene` | SceneManager | **씬 전환은 반드시 Scene.enter()만 사용** |
| `Data` | DataManager | 텍스트 스타일, 캐릭터, 언어 데이터 |
| `Opt` | OptionManager | 옵션/세이브/플레이타임 |
| `Lang` | LocalizeManager | 번역 텍스트 `Lang.t(tag, fallback)` |
| `Dm` | DialogManager | 대화 시스템 |
| `Rnd` | RandomManager | 시드 기반 랜덤 |

## Code Conventions

### 씬 정의
- `SceneObject`를 상속, `init()` / `enter(option)` / `update()` 구현
- 파일명: `scene{Name}.js`, gameData.scene 배열 이름과 일치
- **씬 이동은 항상 `Scene.enter(Scene.sceneList.Name, option)`으로만 수행** — 다른 매니저에 씬 이동 메서드 금지

### 매니저 패턴
```js
export class FooManager {
  constructor() { /* state */ }
}
window.Foo = new FooManager();
```

### 텍스트 스타일
- 모든 텍스트 스타일은 `_gameD.js`의 `gameTxtsty`에 정의
- `Data.styles.xxx`로 참조 — **인라인 스타일 객체 직접 작성 금지**
- `langId` 있으면 언어별 폰트 자동 적용 (LangTextStyle)

### 스프라이트/텍스트 생성
- `anchor`, `position`은 생성자 옵션에 포함 — 생성 후 `.set()` 호출 금지
```js
// Good
Img.sprite('rect', [100, 50], 'rgba(255,0,0,1)', {
  anchor: 0.5,
  position: { x: 100, y: 200 }
});

new Text({
  text: Lang.t('key', 'fallback'),
  style: Data.styles.menuItem,
  anchor: 0.5,
  position: { x: SW * 0.5, y: SH * 0.5 }
});

// Bad — 중복 호출
const t = new Text({ text: '...', style: Data.styles.menuItem });
t.anchor.set(0.5);          // ← 금지
t.position.set(640, 360);   // ← 금지
```

### 번역
- `Lang.t('tag', 'Fallback')` 사용
- 언어 파일: `resources/translate/{lang}.json`
- `langList.txt`에 언어 코드 나열

### 입력
```js
Input.isPressed(KeyBind.OK)   // 이번 프레임에 눌림
Input.isDown(KeyBind.UP)      // 누르고 있는 중
```

### 경로
- 텍스처: `./resources/textures/` (index.html 기준)
- 번역: `./resources/translate/`
- `../`로 상위 참조 금지 — 항상 `./` 기준

## Init Sequence
```
Data.earlyinit()  → 씬 import + 언어 로드 + 스테이지 로드
Img.loadTextures() → TextureAssets 로드
Tm.loadTextures()  → ThreeTextures 로드
Am.loadAudios()    → 오디오 디코딩
Data.init()        → 텍스트 스타일/키바인드/캐릭터
Opt.boot()         → 옵션/플레이어 데이터 복원
Scene.init()       → 모든 씬 init + 시작 씬 enter
```

## Anti-patterns

- ❌ 씬 이동을 Scene 외 클래스에서 수행
- ❌ `new Text({ style: { fontSize: 32, ... } })` 인라인 스타일
- ❌ `.anchor.set()` / `.position.set()` 생성 후 별도 호출
- ❌ `../resources/` 상대경로 (반드시 `./resources/`)
- ❌ `AppShell` 참조 (삭제됨 → `Opt` + `Lang`으로 분리)
