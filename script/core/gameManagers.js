
// 입력 매니저
export class InputManager {
  constructor() {
    // 🔑 키보드 입력
    this.down = new Set(); // 현재 눌려 있는 키
    this.pressed = new Set(); // 이번 프레임에서 새로 눌린 키
    this.released = new Set(); // 이번 프레임에서 뗀 키

    // 🎯 드래그 입력
    this.currentPos = { x: 0, y: 0 };
    this.dragging = false; // 현재 드래그 중인지 여부
    this.dragStart = {
      x: 0,
      y: 0
    }; // 드래그 시작 좌표
    this.dragDelta = {
      x: 0,
      y: 0
    }; // 시작점으로부터의 상대 좌표(누적)

    this.activeTouchId = null; // 현재 조작 중인 터치 ID (멀티터치 방지용)
    this.multiTouch = false; // 두 손가락 이상 감지 여부
    // ─────────────────────────────────────────
    // 키보드
    this._downHandler = (e) => {
      if (!e.repeat && !this.down.has(e.keyCode)) {
        this.down.add(e.keyCode);
        this.pressed.add(e.keyCode);
      }
    };
    this._upHandler = (e) => {
      if (this.down.has(e.keyCode)) {
        this.down.delete(e.keyCode);
        this.released.add(e.keyCode);
      }
    };

    // ─────────────────────────────────────────
    // 마우스 / 터치
    this.mousePos = (e) => {
      const canvas = window.app?.canvas || window.app?.view; // 너가 쓰는 렌더러 캔버스
      const client = (touchLike) => ({
        x: touchLike.clientX,
        y: touchLike.clientY
      });

      let base;
      if (e.touches && e.touches.length > 0) {
        base = client(e.touches[0]);
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        base = client(e.changedTouches[0]);
      } else {
        base = client(e);
      }

      // 캔버스 정보가 없으면 그냥 client 좌표 반환
      if (!canvas) return base;

      const rect = canvas.getBoundingClientRect();

      // 화면 좌표 → Pixi 렌더러 좌표로 변환
      const x = (base.x - rect.left) * (canvas.width / rect.width);
      const y = (base.y - rect.top) * (canvas.height / rect.height);

      return { x, y };
    };

    this._startDrag = (e) => {
      if (this.dragging) return;

      const touch = e.changedTouches ? e.changedTouches[0] : e;
      this.activeTouchId = touch.identifier ?? 0;

      const pos = this.mousePos(e);
      this.dragging = true;
      this.dragStart.x = pos.x;
      this.dragStart.y = pos.y;
      this.dragDelta.x = 0;
      this.dragDelta.y = 0;
      this.multiTouch = e.touches && e.touches.length > 1;
    };

    this._moveDrag = (e) => {
      if (!this.dragging) return;

      // activeTouchId 맞는 터치 찾기
      let touch = null;
      if (e.touches && e.touches.length > 0) {
        for (let t of e.touches) {
          if ((t.identifier ?? 0) === this.activeTouchId) {
            touch = t;
            break;
          }
        }
      } else {
        touch = e;
      }
      if (!touch) return;

      const pos = this.mousePos(e);
      this.dragDelta.x = pos.x - this.dragStart.x;
      this.dragDelta.y = pos.y - this.dragStart.y;
      this.multiTouch = e.touches && e.touches.length > 1;
    };

    this._endDrag = (e) => {
      if (!this.dragging) return;
      const endedTouches = e.changedTouches ?? [e];

      for (let t of endedTouches) {
        if ((t.identifier ?? 0) === this.activeTouchId) {
          this.dragging = false;
          this.activeTouchId = null;
          this.dragDelta.x = 0;
          this.dragDelta.y = 0;
          break;
        }
      }
      this.multiTouch = e.touches && e.touches.length > 1;
    };

    // ─────────────────────────────────────────
    // 이벤트 등록
    window.addEventListener("keydown", this._downHandler);
    window.addEventListener("keyup", this._upHandler);

    window.addEventListener("mousedown", this._startDrag);
    window.addEventListener("mousemove", this._moveDrag);
    window.addEventListener("mouseup", this._endDrag);
    window.addEventListener("mousemove", (e) => {
      const pos = this.mousePos(e);
      this.currentPos.x = pos.x;
      this.currentPos.y = pos.y;
    });

    window.addEventListener("touchstart", this._startDrag);
    window.addEventListener("touchmove", this._moveDrag);
    window.addEventListener("touchend", this._endDrag);
  }

  // 키 상태
  isDown(code) {
    return this._check(this.down, code);
  }

  isPressed(code) {
    return this._check(this.pressed, code);
  }

  isReleased(code) {
    return this._check(this.released, code);
  }

  _check(container, code) {
    // 단일 키
    if (typeof code === "number") {
      return container.has(code);
    }

    // Set / Array → OR
    if (code instanceof Set || Array.isArray(code)) {
      for (const c of code) {
        if (container.has(c)) return true;
      }
      return false;
    }

    return false;
  }

  // 드래그 상태
  isDragging() {
    return this.dragging;
  }
  isMultiTouch() {
    return this.multiTouch;
  }
  getDragDelta() {
    return {
      x: this.dragDelta.x,
      y: this.dragDelta.y
    };
  }
  getDragStart() {
    return {
      x: this.dragStart.x,
      y: this.dragStart.y
    };
  }

  // 매 프레임 끝에서 호출
  endFrame() {
    this.pressed.clear();
    this.released.clear();
    // 드래그 값은 endFrame에서 초기화하지 않음
  }

  update(){

  }
}
window.Input = new InputManager();

// 랜덤 매니저
export class RandomManager {
  constructor() {
    this.seed = 0
    this._seed = 0
  }
  init(seed = Date.now()) {
    this.seed = seed
    this._seed = seed >>> 0; // 32비트 정수화
    console.log(`[RandomManager] 시드 설정 완료: ${this.seed} ${this._seed}`);
  }

  random() {
    let t = (this._seed += 0x6D2B79F5); // mulberry32
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  getSeed() {
    return this.seed;
  }
}
window.Rnd = new RandomManager();

// 텍스쳐 매니져
export class TextureManager {
  constructor() {
    this.basePath = './resources/textures/'
    /** @type {TextureAssets} */
    this.assets = {}
    /** @type {Textures} */
    this.texture = {}
  }

  async loadTextures() {
    PIXI.TextureStyle.defaultOptions.scaleMode = 'nearest';
    for (let asset in TextureAssets) {
      this.assets[asset] = await PIXI.Assets.load(`${this.basePath}${TextureAssets[asset]}`);
    }
    await LoadTexture()
    for (let texture in Textures) {
      Textures[texture] = Textures[texture]()
      this.texture[texture] = Textures[texture]
    }
  }

  object(_texture, size, color = 'rgba(255,255,255,1)', anchor = 0.5) {
    let sprite = this.sprite(_texture, size, color, anchor)
    let obj = new GameObject()
    obj.radius = size
    obj.addChild(sprite)
    return obj
  }

  sprite(_texture, size, color = 'rgba(255,255,255,1)', option) {
    let colDat = rgbaSplit(color)
    let texture = (typeof _texture == "string") ? Textures[_texture] : _texture
    let sprite = new Sprite({
      texture,
      tint: colDat.color,
      alpha: colDat.alpha,
      anchor:0.5,
      ...option
    })
    if (Array.isArray(size)) {
      sprite.scale.set(size[0] / texture.width, size[1] / texture.height)
    } else {
      sprite.scale.set(size / texture.width)
    }
    if (texture == Textures.circle) {
      sprite.scale.set(sprite.scale.x * 2)
    }
    return sprite
  }

  line(startPos, endPos, width, color = 0xffffff, alpha = 1) {
    const sprite = new Sprite(Textures.rect);
    sprite.anchor.set(0, 0.5); // 왼쪽 중앙 기준

    // 두 점 사이 거리
    const dx = endPos.x - startPos.x;
    const dy = endPos.y - startPos.y;
    const length = getDist(startPos, endPos)


    // width = 두께
    sprite.scale.set(length, width)

    // 회전
    sprite.rotation = Math.atan2(dy, dx);

    // 위치
    sprite.x = startPos.x;
    sprite.y = startPos.y;

    // 색상 + 알파
    sprite.tint = color;
    sprite.alpha = alpha;

    return sprite;
  }

}
window.Img = new TextureManager()

export class ThreeManager {
  constructor() {
    this.basePath = './resources/textures/'
    this.background = null
    // bg Parameters
    this.scrollSpeed = 0.5
    this.active = []
    this.nextSpawnX = -100
    /* ===== 테마 시스템 ===== */
    this.loopSegments = []        // 반복할 세그먼트 이름 배열
    this.loopIndex = 0            // 현재 반복 인덱스
    this.transitionQueue = []     // 전환 세그먼트 대기열
    /* ===== 세그먼트 풀 ===== */
    this.segmentPool = {}         // { name=[segment, segment, ...] }
    this.segments = {}            // 템플릿 데이터 참조용
    /* ===== 스카이 ===== */
    this.sky = null
    this.skyRadius = 220
    this.skyHeight = 80
    this.skyY = 10
  }

  get camX() {
    return three.camera.position.x
  }

  async loadTextures() {
    const loadImage = (src) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = reject;
      });

    for (const key in ThreeTextures) {
      const { texture, crop } = ThreeTextures[key];
      const [x, y, w, h] = crop;

      const img = await loadImage(`${this.basePath}${texture}.png`);

      const cvs = document.createElement('canvas');
      cvs.width = w;
      cvs.height = h;

      const ctx = cvs.getContext('2d', { alpha: true });
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, x, y, w, h, 0, 0, w, h);

      const tex = new THREE.CanvasTexture(cvs)
      tex.colorSpace = THREE.SRGBColorSpace;   // 🔥 색 틀어짐 방지
      tex.generateMipmaps = true;
      tex.anisotropy = three.renderer.capabilities.getMaxAnisotropy?.() || 8;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;

      ThreeTextures[key] = tex;
    }
  }

  resetBGSetting() {
    three.camera.x = 0
    this.nextSpawnX = -100;
    this.active = [];
    this.transitionQueue = [];
    this.loopIndex = 0;
  }

  init() {
    const bg = ThreeBG[gameData.defaultBG]
    this.initBG(bg)
    this.initSky(bg)
  }

  initBG(bg) {
    this.resetBGSetting()
    this.scrollSpeed = bg.scrollSpeed
    three.camera.position.set(bg.camPosition.x, bg.camPosition.y, bg.camPosition.z);
    const d2r = Math.PI / 180;
    three.camera.rotation.set(bg.comRotation.x * d2r, bg.comRotation.y * d2r, bg.comRotation.z * d2r);
    three.camera.updateProjectionMatrix();
    three.fog.color.set(bg.fogSetting.color);
    three.fog.near = bg.fogSetting.near || 300//0
    three.fog.far = bg.fogSetting.far || 500//66
    // 세그먼트 데이터 맵 생성
    for (const d in bg.segmentsData) {
      const data = bg.segmentsData[d]
      this.segments[data.name] = data;
      this.segmentPool[data.name] = [];
    }
    this.loopSegments = [...new Set(bg.initialSegments)];
    // 초기 세그먼트 배치
    for (const name of bg.initialSegments) {
      this._spawnSegment(name);
    }
  }

  initSky(bg) {
    const skyTex = ThreeTextures[bg.sky]
    skyTex.needsUpdate = true;
    skyTex.wrapS = THREE.RepeatWrapping;
    skyTex.wrapT = THREE.ClampToEdgeWrapping;
    skyTex.repeat.set(4, 2);

    const skyGeo = new THREE.CylinderGeometry(
      this.skyRadius, this.skyRadius,
      this.skyHeight, 48, 1, true
    );
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
      depthWrite: false
    });

    this.sky = new THREE.Mesh(skyGeo, skyMat);
    this.sky.position.set(0, this.skyY, 0);
    three.scene.add(this.sky);
  }

  _spawnSegment(name) {
    let segment;

    // 풀에서 가져오거나 새로 생성
    if (this.segmentPool[name].length > 0) {
      segment = this.segmentPool[name].pop();
    } else {
      const data = this.segments[name];
      if (!data) {
        console.error(`Segment "${name}" not found!`);
        return null;
      }
      segment = new BGSegment(data);
      three.scene.add(segment.group);
    }

    // 위치 설정 및 표시
    segment.setPosition(this.nextSpawnX);
    segment.show();

    // respawn 콜백 호출 (데코레이션 리셋 등)
    segment._respawn?.();

    this.nextSpawnX += segment.segLen;
    this.active.push(segment);

    return segment;
  }
  _despawnSegment(segment) {
    segment.hide();
    this.segmentPool[segment.name].push(segment);
  }
  changeTheme(loopList, transitionList = []) {
    // 전환 세그먼트를 큐에 추가 (순서대로)
    this.transitionQueue.push(...transitionList);

    // 새로운 반복 세그먼트 설정
    this.loopSegments = loopList
    this.loopIndex = 0

    console.log(`Theme changing → transition: [${transitionList}] → loop: [${loopList}]`);
  }
  _getNextSegmentName() {
    // 1. 전환 큐가 있으면 먼저 소비
    if (this.transitionQueue.length > 0) {
      return this.transitionQueue.shift();
    }
    // 2. 반복 세그먼트에서 순환
    const name = this.loopSegments[this.loopIndex];
    this.loopIndex = (this.loopIndex + 1) % this.loopSegments.length;
    return name;
  }


  update() {
    three.camera.position.x += this.scrollSpeed;
    this.sky.position.x = three.camera.position.x;

    // 앞쪽 빈 공간 채우기 (미리 스폰)
    const spawnThreshold = this.camX + 100;
    while (this.nextSpawnX < spawnThreshold) {
      const nextName = this._getNextSegmentName();
      this._spawnSegment(nextName);
    }

    // 뒤쪽 세그먼트 회수 (화면 밖으로 나가면)
    const despawnThreshold = this.camX - 150;
    while (this.active.length > 0) {
      const seg = this.active[0];
      if (seg.xEnd < despawnThreshold) {
        this._despawnSegment(seg);
        this.active.shift();
      } else {
        break;
      }
    }
  }
}
window.Tm = new ThreeManager();
// 오디오 매니저
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.bgmGain = null;
    this.sfxGain = null;

    this.decodeCache = new Map();
    this.bgmBuffers = {};
    this.sfxBuffers = {};
    this.bgmSourcesMap = {};
    this.sfxSourcesMap = {};
    this.sfxPlaying = {};

    this.currentBGMName = null;
    this.currentBGMSource = null;

    this.bgmVolume = 1.0;
    this.sfxVolume = 1.0;

    this.startTime = 0;
    this.pauseTime = 0

    this._initContextIfNeeded();
  }

  _initContextIfNeeded() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.bgmGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.bgmGain.gain.value = this.bgmVolume;
    this.sfxGain.gain.value = this.sfxVolume;
    this.bgmGain.connect(this.ctx.destination);
    this.sfxGain.connect(this.ctx.destination);

    document.addEventListener("visibilitychange", () => {
      if (!this.ctx) return;
      if (document.hidden) this.ctx.suspend().catch(() => { });
      else this.ctx.resume().catch(() => { });
    });
  }

  async _ensureCtxResumed() {
    this._initContextIfNeeded();
    if (this.ctx.state === "suspended") {
      // try {await this.ctx.resume(); } catch { }
    }
  }

  _decodeArrayBufferToAudioBuffer(ab) {
    return new Promise((resolve, reject) => {
      const maybePromise = this.ctx.decodeAudioData(
        ab,
        buf => resolve(buf),
        err => reject(err)
      );
      if (maybePromise && typeof maybePromise.then === "function") {
        maybePromise.then(resolve).catch(reject);
      }
    });
  }

  _decodeOnce(url) {
    if (this.decodeCache.has(url)) return this.decodeCache.get(url);
    const p = fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Fetch failed: ${url}`);
        return res.arrayBuffer();
      })
      .then(ab => this._decodeArrayBufferToAudioBuffer(ab));
    this.decodeCache.set(url, p);
    return p;
  }

  // async loadAudios(bgmSources = {}, sfxSources = {}) {
  //   Object.assign(this.bgmSourcesMap, bgmSources);
  //   Object.assign(this.sfxSourcesMap, sfxSources);

  //   const tasks = [];
  //   for (const [k, url] of Object.entries(bgmSources)) {
  //     tasks.push(this._decodeOnce(url).then(buf => this.bgmBuffers[k] = buf));
  //   }
  //   for (const [k, url] of Object.entries(sfxSources)) {
  //     tasks.push(this._decodeOnce(url).then(buf => this.sfxBuffers[k] = buf));
  //   }
  //   await Promise.allSettled(tasks);
  // }

  async loadAudios(bgmSources = {}, sfxSources = {}, onProgress) {
    Object.assign(this.bgmSourcesMap, bgmSources);
    Object.assign(this.sfxSourcesMap, sfxSources);

    const entries = [
      ...Object.entries(bgmSources).map(([k, url]) => ({ type: "bgm", k, url })),
      ...Object.entries(sfxSources).map(([k, url]) => ({ type: "sfx", k, url })),
    ];

    const total = entries.length;
    let loaded = 0;

    const update = () => {
      loaded++;
      if (onProgress) onProgress((loaded / total) * 100);
    };

    const tasks = entries.map(({ type, k, url }) =>
      this._decodeOnce(url)
        .then(buf => {
          if (type === "bgm") this.bgmBuffers[k] = buf;
          else this.sfxBuffers[k] = buf;
          update(); // 개별 오디오 로딩 완료 시 호출
        })
        .catch(() => update()) // 실패해도 진행률은 증가
    );

    await Promise.allSettled(tasks);
  }


  _createSource(buffer, { loop = false } = {}) {
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = !!loop;
    return src;
  }

  // 🔊 SFX 재생 (동기 호출 가능, 중복 방지 + 항상 새로 시작)
  playSFX(name) {
    (async () => {
      // 버퍼 준비
      if (!this.sfxBuffers[name]) {
        const url = this.sfxSourcesMap[name];
        if (!url) return console.warn(`SFX '${name}' 없음`);
        try {
          const buf = await this._decodeOnce(url);
          this.sfxBuffers[name] = buf;
        } catch (e) {
          console.error(`SFX decode error (${name}):`, e);
          return;
        }
      }

      await this._ensureCtxResumed();

      // 기존 재생 중이면 stop 후 제거
      if (this.sfxPlaying[name]) {
        try { this.sfxPlaying[name].source.stop(); } catch { }
        delete this.sfxPlaying[name];
      }

      // 새 BufferSource 생성 후 재생
      const src = this._createSource(this.sfxBuffers[name]);
      src.connect(this.sfxGain);
      try { src.start(0); } catch (e) { console.warn("SFX start error:", e); }

      this.sfxPlaying[name] = { source: src };
      src.onended = () => {
        if (this.sfxPlaying[name]?.source === src) delete this.sfxPlaying[name];
      };
    })().catch(e => console.error(e));
  }

  // 🎵 BGM 재생 (loop)
  playBGM(name) {
    (async () => {
      if (!this.bgmBuffers[name]) {
        const url = this.bgmSourcesMap[name];
        if (!url) return console.warn(`BGM '${name}' 없음`);
        try {
          const buf = await this._decodeOnce(url);
          this.bgmBuffers[name] = buf;
        } catch (e) { console.error(`BGM decode error (${name}):`, e); return; }
      }

      await this._ensureCtxResumed();

      if (this.currentBGMName === name) return;
      if (this.bgmGain) this.bgmGain.gain.value = this.bgmVolume;
      // 기존 BGM 정지
      if (this.currentBGMSource) {
        try { this.currentBGMSource.stop(); } catch { }
        try { this.currentBGMSource.disconnect(); } catch { }
        this.currentBGMSource = null;
        this.currentBGMName = null;
      }

      const src = this._createSource(this.bgmBuffers[name], { loop: true });
      src.connect(this.bgmGain);
      try { src.start(0); } catch (e) { console.warn("BGM start error:", e); }
      this.startTime = this.ctx.currentTime;
      this.pauseTime = 0;
      this.currentBGMSource = src;
      this.currentBGMName = name;
    })().catch(e => console.error(e));
  }

  pauseBGM() {
    if (this.currentBGMSource) {
      this.pauseTime = this.ctx.currentTime - this.startTime;
      this.currentBGMSource.stop()
      // this.currentBGMSource = null;
    }
  }
  resumeBGM() {
    if (this.currentBGMSource) {
      if (!this.bgmBuffers[this.currentBGMName] || this.pauseTime === 0) return;

      const source = this._createSource(this.bgmBuffers[this.currentBGMName], { loop: true });
      source.connect(this.bgmGain);
      source.start(0, this.pauseTime); // 저장된 offset부터 이어서 재생
      this.currentBGMSource = source;
      this.startTime = this.ctx.currentTime - this.pauseTime;
    }
  }

  stopBGM() {
    if (this.currentBGMSource) {
      try { this.currentBGMSource.stop(); } catch { }
      try { this.currentBGMSource.disconnect(); } catch { }
      this.currentBGMSource = null;
      this.currentBGMName = null;
    }
  }

  setBGMVolume(v) {
    this.bgmVolume = Math.max(0, Math.min(0.2, v));
    if (this.bgmGain) this.bgmGain.gain.value = this.bgmVolume;
  }
  setSFXVolume(v) {
    this.sfxVolume = Math.max(0, Math.min(0.2, v));
    if (this.sfxGain) this.sfxGain.gain.value = this.sfxVolume;
  }

  // 원본 맵 추가 가능
  addSources(bgm = {}, sfx = {}) {
    Object.assign(this.bgmSourcesMap, bgm);
    Object.assign(this.sfxSourcesMap, sfx);
  }

  fadeOutBGM(duration = 2.0) { // 기본 2초 동안 페이드아웃
    if (!this.bgmGain || !this.currentBGMSource) return;

    const now = this.ctx.currentTime;

    // 현재 볼륨 가져오기
    const currentGain = this.bgmGain.gain.value;

    // 기존 automation 취소
    this.bgmGain.gain.cancelScheduledValues(now);

    // 현재값에서 시작해서 duration초 동안 0으로 감쇠
    this.bgmGain.gain.setValueAtTime(currentGain, now);
    this.bgmGain.gain.linearRampToValueAtTime(0, now + duration);

    // 페이드 끝나면 stop()
    this.currentBGMSource.stop(now + duration);
  }

}
window.Am = new AudioManager()

// 데이터 저장 매니저
export class SaveManager {
  constructor() {
    this.isNW = typeof nw !== 'undefined';
    this.optionKey = 'game_option';
    this.playerDataKey = 'player_data'
    this.playTimeKey = 'play_time'
    this.scoreKeyPrefix = 'game_score_';
    this.maxScores = 20;

    if (this.isNW) {
      const path = require('path');
      this.saveDir = path.join(process.cwd(), 'save');
    }
  }

  // 플레이 타임 저장 / 불러오기

  savePlayTime(playTime) {
    const safeTime = Number.isFinite(playTime)
      ? playTime
      : (typeof tt !== 'undefined' && Number.isFinite(tt.playTime) ? tt.playTime : 0);
    const data = { time: safeTime }
    if (this.isNW) {
      const fs = require('fs');
      const filePath = `${this.saveDir}/playTime.json`;
      if (!fs.existsSync(this.saveDir)) fs.mkdirSync(this.saveDir, { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`[SaveManager] 플레이타임 저장 완료: ${filePath}`);
    } else {
      localStorage.setItem(this.playTimeKey, JSON.stringify(data));
      console.log('[SaveManager] 플레이타임 저장 완료 (LocalStorage)');
    }
  }

  // 플레이 타임 불러오기
  loadPlayTime() {
    const defaultPlayTime = {
      time: 0
    };

    if (this.isNW) {
      const fs = require('fs');
      const filePath = `${this.saveDir}/playTime.json`;

      // 파일이 없으면 기본 옵션으로 새로 생성
      if (!fs.existsSync(filePath)) {
        if (!fs.existsSync(this.saveDir)) fs.mkdirSync(this.saveDir, { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(defaultPlayTime, null, 2), 'utf8');
        console.log(`[SaveManager] 플레이타임 파일이 없어 새로 생성: ${filePath}`);
        return defaultPlayTime;
      }

      // 파일이 존재하면 로드
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log('[SaveManager] 플레이타임 로드 완료 (NW.js)');
      return data;
    } else {
      const raw = localStorage.getItem(this.playTimeKey);
      if (!raw) {
        // 없으면 기본 옵션 생성 및 저장
        localStorage.setItem(this.playTimeKey, JSON.stringify(defaultPlayTime));
        console.log('[SaveManager] 플레이타임 데이터가 없어 새로 생성 (LocalStorage)');
        return defaultPlayTime;
      }

      console.log('[SaveManager] 플레이타임 로드 완료 (Web)');
      return JSON.parse(raw);
    }
  }

  // ---------------------------
  // 옵션 저장 / 불러오기
  // ---------------------------
  saveOption(optionData) {
    if (this.isNW) {
      const fs = require('fs');
      const filePath = `${this.saveDir}/option.json`;
      if (!fs.existsSync(this.saveDir)) fs.mkdirSync(this.saveDir, { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(optionData, null, 2));
      console.log(`[SaveManager] 옵션 저장 완료: ${filePath}`);
    } else {
      localStorage.setItem(this.optionKey, JSON.stringify(optionData));
      console.log('[SaveManager] 옵션 저장 완료 (LocalStorage)');
    }
  }

  loadOption() {
    const defaultOption = {
      bgmVolume: 0.1,
      sfxVolume: 0.1,
      language: 1,
      fullscreen: 0
    };
    const sysLang = this.getSystemLanguage()
    const langIndex = Data.languages.findIndex(x => x.name == sysLang)
    defaultOption.language = (langIndex >= 0) ? langIndex + 1 : 1

    if (this.isNW) {
      const fs = require('fs');
      const filePath = `${this.saveDir}/option.json`;

      // 파일이 없으면 기본 옵션으로 새로 생성
      if (!fs.existsSync(filePath)) {
        if (!fs.existsSync(this.saveDir)) fs.mkdirSync(this.saveDir, { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(defaultOption, null, 2), 'utf8');
        console.log(`[SaveManager] 옵션 파일이 없어 새로 생성: ${filePath}`);
        return defaultOption;
      }

      // 파일이 존재하면 로드
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log('[SaveManager] 옵션 로드 완료 (NW.js)');
      return data;
    } else {
      const raw = localStorage.getItem(this.optionKey);
      if (!raw) {
        // 없으면 기본 옵션 생성 및 저장
        localStorage.setItem(this.optionKey, JSON.stringify(defaultOption));
        console.log('[SaveManager] 옵션 데이터가 없어 새로 생성 (LocalStorage)');
        return defaultOption;
      }

      console.log('[SaveManager] 옵션 로드 완료 (Web)');
      return JSON.parse(raw);
    }
  }


  // ---------------------------
  // 스코어 저장 / 불러오기
  // ---------------------------
  saveScore(index, scoreData) {
    if (index < 0 || index >= this.maxScores) throw new Error('Invalid score index');

    if (this.isNW) {
      const fs = require('fs');
      const filePath = `${this.saveDir}/score_${index}.json`;
      if (!fs.existsSync(this.saveDir)) fs.mkdirSync(this.saveDir, { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(scoreData, null, 2));
      console.log(`[SaveManager] 스코어 저장 완료: ${filePath}`);
    } else {
      localStorage.setItem(this.scoreKeyPrefix + index, JSON.stringify(scoreData));
      console.log(`[SaveManager] 스코어 저장 완료 (slot ${index})`);
    }
  }

  loadScore(index) {
    if (index < 0 || index >= this.maxScores) throw new Error('Invalid score index');

    if (this.isNW) {
      const fs = require('fs');
      const filePath = `${this.saveDir}/score_${index}.json`;
      if (!fs.existsSync(filePath)) return null;
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else {
      const raw = localStorage.getItem(this.scoreKeyPrefix + index);
      return raw ? JSON.parse(raw) : null;
    }
  }

  savePlayerData(playerData) {
    const safeData = playerData ?? (typeof tt !== 'undefined' ? tt.playerData : null);
    if (!safeData) {
      console.warn('[SaveManager] PlayerData 저장 실패: 저장할 데이터가 없습니다.');
      return;
    }
    if (this.isNW) {
      const fs = require('fs');
      const filePath = `${this.saveDir}/player_data.json`;
      if (!fs.existsSync(this.saveDir)) fs.mkdirSync(this.saveDir, { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(safeData, null, 2));
      console.log(`[SaveManager] PlayerData 저장 완료: ${filePath}`);
    } else {
      localStorage.setItem(this.playerDataKey, JSON.stringify(safeData));
      console.log('[SaveManager] PlayerData 저장 완료 (LocalStorage)');
    }
  }

  loadPlayerData() {
    const defaultOption = {
      "lastName": "",
      "keyboardScore": [
        { name: "BBY22", score: 182130428, difficulty: 1, time: "2025/10/27" },
        { name: "matoriL", score: 163386450, difficulty: 1, time: "2025/10/31" },
        { name: "alme", score: 121724135, difficulty: 0, time: "2025/10/26" },
      ],
      "touchScore": [
        { name: "matoriL", score: 219721541, difficulty: 1, time: "2025/10/31" }
      ],
      "playCount": 0,
      "clearCount": 0,
      "missCount": 0,
      "spellHistory": [
      ]
    }

    if (this.isNW) {
      const fs = require('fs');
      const filePath = `${this.saveDir}/player_data.json`;

      // 파일이 없으면 기본 옵션으로 새로 생성
      if (!fs.existsSync(filePath)) {
        if (!fs.existsSync(this.saveDir)) fs.mkdirSync(this.saveDir, { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(defaultOption, null, 2), 'utf8');
        console.log(`[SaveManager] PlayerData 파일이 없어 새로 생성: ${filePath}`);
        return defaultOption;
      }

      // 파일이 존재하면 로드
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log('[SaveManager] PlayerData 로드 완료 (NW.js)');
      return data;
    } else {
      const raw = localStorage.getItem(this.playerDataKey);
      if (!raw || raw == 'null') {
        // 없으면 기본 옵션 생성 및 저장
        localStorage.setItem(this.playerDataKey, JSON.stringify(defaultOption));
        console.log('[SaveManager] PlayerData 데이터가 없어 새로 생성 (LocalStorage)');
        return defaultOption;
      }

      console.log('[SaveManager] PlayerData 로드 완료 (Web)');
      return JSON.parse(raw);
    }
  }

  saveReplay(index, data) {
    if (this.isNW) {
      const fs = require('fs');
      const filePath = `${this.saveDir}/replay/songpyeon${String(index).padStart(2, '0')}.json`;

      if (!fs.existsSync(this.saveDir)) fs.mkdirSync(this.saveDir, { recursive: true });

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`[SaveManager] 리플레이 저장 완료: ${filePath}`);
    } else {
      const key = `songpyeon${String(index).padStart(2, '0')}`;
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`[SaveManager] 리플레이 저장 완료 (key: ${key})`);
    }
  }


  loadReplays() {
    let obj = {}
    if (this.isNW) {
      const fs = require('fs');
      const path = require('path');

      if (!fs.existsSync(this.saveDir)) return obj;
      const replayPath = `${this.saveDir}/replay`
      if (!fs.existsSync(replayPath)) return obj;
      // saveDir 안에서 replay 파일 패턴 찾기
      const files = fs.readdirSync(replayPath)
        .filter(f => /^replay\/?songpyeon\d+\.json$/.test(f) || /^songpyeon\d+\.json$/.test(f));

      for (const file of files) {
        const filePath = path.join(replayPath, file);
        try {
          console.log(filePath)
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          obj[getLastNumber(file.slice(0, -5))] = data;
        } catch (err) {
          console.warn(`[SaveManager] 리플레이 로드 실패: ${file}`, err);
        }
      }

      console.log(`[SaveManager] NW.js 리플레이 ${Object.keys(obj).length}개 로드 완료`);
      return obj;
    } else {
      const keys = Object.keys(localStorage).filter(k => /^songpyeon\d+$/.test(k))

      for (const key of keys) {

        try {
          const data = JSON.parse(localStorage.getItem(key));
          obj[getLastNumber(key)] = data;
        } catch (err) {
          console.warn(`[SaveManager] 리플레이 로드 실패 (key: ${key})`, err);
        }
      }

      console.log(`[SaveManager] Web 리플레이 ${Object.keys(obj).length}개 로드 완료`);
      return obj;
    }
  }

  downloadReplay(index) {
    if (this.isNW) {
      console.warn('[SaveManager] NW.js 환경에서는 다운로드 기능이 필요하지 않습니다.');
      return;
    }

    const key = `songpyeon${String(index).padStart(2, '0')}`;
    const json = localStorage.getItem(key);

    if (!json) {
      console.warn(`[SaveManager] 다운로드 실패: ${key} 데이터가 존재하지 않습니다.`);
      return;
    }

    const filename = `${key}.json`;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`[SaveManager] 리플레이 파일 다운로드 완료: ${filename}`);
  }

  // ---------------------------
  // 전체 스코어 불러오기
  // ---------------------------
  loadAllScores() {
    const scores = [];
    for (let i = 0; i < this.maxScores; i++) {
      const s = this.loadScore(i);
      if (s) scores.push({ index: i, ...s });
    }
    return scores;
  }

  // ---------------------------
  // 전체 데이터 삭제
  // ---------------------------
  clearAll() {
    if (this.isNW) {
      const fs = require('fs');
      const path = require('path');
      if (fs.existsSync(this.saveDir)) {
        fs.readdirSync(this.saveDir).forEach(f => {
          const target = path.join(this.saveDir, f);
          const stat = fs.statSync(target);
          if (stat.isDirectory()) {
            fs.rmSync(target, { recursive: true, force: true });
          } else {
            fs.unlinkSync(target);
          }
        });
      }
      console.log('[SaveManager] 모든 로컬 저장 삭제 완료');
    } else {
      localStorage.clear();
      console.log('[SaveManager] LocalStorage 전체 삭제 완료');
    }
  }

  getSystemLanguage() {
    let langCode = 'en';

    if (typeof nw !== 'undefined') {
      const os = require('os');
      const envLang =
        process.env.LANG ||
        process.env.LC_ALL ||
        process.env.LC_MESSAGES ||
        process.env.LANGUAGE;

      if (envLang) {
        langCode = envLang.replace(/\.UTF-8/i, '').slice(0, 2).toLowerCase();
      } else if (navigator.language) {
        langCode = navigator.language.slice(0, 2).toLowerCase();
      }
    } else {
      const langs = navigator.languages || [navigator.language];
      if (langs[0]) langCode = langs[0].slice(0, 2).toLowerCase();
    }

    return langCode;
  }
}
window.Save = new SaveManager();

// 씬 매니져
export class SceneManager {
  constructor() {
    this.curScene = null
    this.sceneList = {}
    this.nameIndex = 0
  }

  addScene(scene){
    let name = gameData.scene[this.nameIndex]
    this.sceneList[name] = scene
    this.nameIndex++
  }

  init() {
    for (let s in this.sceneList) {
      const scene = this.sceneList[s]
      scene.init()
      app.stage.addChild(scene);
    }
    this.enter(this.sceneList[gameData.startScene], gameData.startSceneOption)
  }

  enter(scene, option = null) {
    if(!scene){return}
    if (this.curScene?.exitHide) {
      this.curScene.visible = false
    }
    this.curScene = scene
    scene.visible = true
    this.curScene.enter(option)
    app.stage.setChildIndex(this.curScene, app.stage.children.length - 1)
  }

  update() {
    if (this.curScene) this.curScene.update()

  }
  lateUpdate() {
    if (this.curScene) this.curScene.lateUpdate()

  }
}
window.Scene = new SceneManager();

//대화 시스템
export class DialogManager extends GameObject {
  constructor() {
    super()
  }

  init() {
    this.textBox = new Container()
    this.textBFrame = this.textBox.addChild(Img.sprite("rect", [800, 160], 'rgba(0,0,0,1)', 0.8))
    this.textNameFrame = this.textBox.addChild(Img.sprite("rect", [300, 45], 'rgba(0,0,0,1)', 0.8))
    this.textNameFrame.position.set(0, -110)
    this.textObj = this.textBox.addChild(new Text({ text: "", style: Data.styles.dialog }))
    this.textObj.anchor.set(0, 0.5)
    this.textObj.position.set(-350, 0)
    this.nameObj = this.textBox.addChild(new Text({ text: "", style: Data.styles.dialog }))
    this.nameObj.anchor.set(0.5)
    this.nameObj.position.set(this.textNameFrame.position.x, this.textNameFrame.position.y)
    this.textBFrame.scale.x = 0
    this.textNameFrame.scale.x = 0
    this.plzInputArrow = this.textBox.addChild(Img.sprite("rect", 16, 0xffffff))
    this.plzInputArrow.rotation = Math.PI / 4
    this.plzInputArrow.position.set(0, 70)
    this.startRoutine("arrow", function (self) {
      if (this.whileTime(0)) {
        if ((this.repeat % 60) < 30) {
          self.plzInputArrow.y += 0.5
        } else {
          self.plzInputArrow.y -= 0.5
        }
      }
    })
    this.plzInputArrow.visible = false
    this.addChild(this.textBox)
    this.initValue()
  }

  initValue() {
    this.curText = ""
  }

  startDialog() {
    if (!this.parent) { console.warn("DialogManager has No Parent!"); return }
    this.startRoutine("start", function () {
      if (this.whileTime(0, this.repeat < 30)) {
        this.self.textBFrame.scale.x = frameMove(0, 800, this.repeat, 30, Easing.easeOutBack)
        this.self.textNameFrame.scale.x = frameMove(0, 300, this.repeat, 30, Easing.easeOutCirc)
      }
    })
  }

  addStand() {

  }

  dialog(char, feel, text, option) {
    if (!this.parent) { console.warn("DialogManager has No Parent!"); return }
    this.plzInputArrow.visible = false
    this.nameObj.text = char._name
    this.nameObj.tint = char.color
    if (option.unknownName) {
      this.nameObj.text = Data.chars.null._name
      this.nameObj.tint = 0xffffff
    }
    this.curText = text
    this.startRoutine("texting", function () {
      if (this.whileTime(0, this.repeat < this.self.curText.length)) {
        this.self.textObj.text = this.self.curText.slice(0, this.repeat)
      }
      if (this.whenTime(0)) {
        this.self.plzInputArrow.visible = true
      }
    })
  }

  endDialog() {
    if (!this.parent) { console.warn("DialogManager has No Parent!"); return }
    this.nameObj.text = ""
    this.textObj.text = ""
    this.plzInputArrow.visible = false
    this.startRoutine("end", function (self) {
      if (this.whileTime(0, this.repeat < 30)) {
        self.textBFrame.scale.x = frameMove(800, 0, this.repeat, 30, Easing.easeOutSine)
        self.textNameFrame.scale.x = frameMove(300, 0, this.repeat, 30, Easing.easeOutSine)
      }
    })
  }
}
window.Dm = new DialogManager()

// 데이터 매니져 베이스
export class DataManager {
  constructor() {
    this.currentLanguage = gameData.currentLanguage
    this.languages = []
    /**@type {typeof gameTxtsty}*/
    this.styles = {}
    /**@type {typeof gameDialogCharacter}*/
    this.chars = {}
    this.stages = [null]
    this.scaleMode = gameData.scaleMode
  }

  async earlyinit() {
    await this.loadScene()
    await this.loadLanguages()
    await this.loadStages()
  }

  async loadScene(){
    for (let s of gameData.scene) {
      try {
        await import(`../scene${s}.js`);
      } catch (err) {
        console.error(`[DataManager] scene${s}.js 로딩 실패`, err);
      }
    }
  }

  async loadLanguages() {
    const path = './resources/translate/'
    // 1️⃣ langList.txt 읽기
    const listText = await fetch(path + 'langList.txt').then(r => r.text());
    const langList = listText
      .split(/\r?\n/)        // 줄단위로 나누기
      .map(l => l.trim())    // 공백 제거
      .filter(l => l.length); // 빈 줄 제외

    // 2️⃣ 각 언어 파일 로드
    for (const langName of langList) {
      const jsonPath = `${path}${langName}.json`;
      try {
        const data = await fetch(jsonPath).then(r => r.json());
        data["name"] = langName
        this.languages.push(data);
        console.log(`[LANG] Loaded: ${langName}`);
      } catch (err) {
        console.error(`[LANG] Failed to load ${langName}.json`, err);
      }
    }
  }

  async loadStages() {
    for (let i = 1; ; i++) {
      try {
        const mod = await import(`../stage/stage${String(i).padStart(3, "0")}.js`);
        this.stages.push(mod.stage);
      } catch {
        console.log("stage load end")
        break;
      }
    }
  }

  init() {
    PIXI.TextureStyle.defaultOptions.scaleMode = this.scaleMode;
    this.loadTextStyles()
    this.loadKeyBind()
    this.loadDialogCharacters()
    Scene.startScene = Scene.sceneList[gameData.startScene]
  }

  loadTextStyles() {
    for (let style in gameTxtsty) {
      if (gameTxtsty[style].langId) {
        this.styles[style] = new LangTextStyle(gameTxtsty[style])
      } else {
        this.styles[style] = new TextStyle(gameTxtsty[style])
      }
    }
    this.updateLangFont()
  }
  updateLangFont = function () {
    for (let sty in this.styles) {
      const style = this.styles[sty]
      if (style.langId == undefined) { continue }
      style.fontFamily = Data.getLangFont(style.langId)
    }
  }

  loadKeyBind() {
    for (let key in KeyBind) {
      KeyBind[key] = new Set(KeyBind[key])
    }
  }
  loadDialogCharacters() {
    for (let index in gameDialogCharacter) {
      const char = gameDialogCharacter[index]
      this.chars[index] = char
    }
  }

  
  text(tag, fallback = null) {
    const lang = this.languages[this.currentLanguage - 1]
    if (!lang) {
      return fallback ?? tag.toString()
    }
    return lang[tag.toString()] ?? fallback ?? tag.toString()

  }
  getLangFont(id) {
    const lang = this.languages[this.currentLanguage - 1]
    if (!lang || !Array.isArray(lang.font)) {
      return 'Arial'
    }
    return lang.font[id - 1] ?? lang.font[0] ?? 'Arial'
  }
}
window.Data = new DataManager()
window.KeyBind = {};

// 옵션 매니져
export class OptionManager {
  constructor() {
    this.booted = false;
    this.option = null;
    this.playerData = null;
    this.playTime = 0;
    this.session = {
      mode: 'arcade',
      stage: gameData.defaultStage,
      startedAt: 0
    };

    this.optionDefaults = {
      bgmVolume: 0.1,
      sfxVolume: 0.1,
      language: 1,
      fullscreen: 0
    };

    this.playerDefaults = {
      lastName: '',
      keyboardScore: [],
      touchScore: [],
      playCount: 0,
      clearCount: 0,
      missCount: 0,
      spellHistory: []
    };
  }

  boot() {
    if (this.booted) return;

    const loadedOption = Save.loadOption() || {};
    const loadedPlayer = Save.loadPlayerData() || {};
    const loadedPlayTime = Save.loadPlayTime() || { time: 0 };

    this.option = { ...this.optionDefaults, ...loadedOption };
    this.playerData = { ...this.playerDefaults, ...loadedPlayer };
    this.playTime = Number.isFinite(loadedPlayTime.time) ? loadedPlayTime.time : 0;

    this.applyOption(this.option);
    this.booted = true;
  }

  applyOption(option) {
    const normalized = { ...this.optionDefaults, ...option };
    normalized.bgmVolume = Math.max(0, Math.min(0.2, normalized.bgmVolume));
    normalized.sfxVolume = Math.max(0, Math.min(0.2, normalized.sfxVolume));
    normalized.language = Math.max(1, normalized.language);
    normalized.fullscreen = normalized.fullscreen ? 1 : 0;

    this.option = normalized;

    Am.setBGMVolume(normalized.bgmVolume);
    Am.setSFXVolume(normalized.sfxVolume);
    Data.currentLanguage = normalized.language;
    Data.updateLangFont();

    if (typeof nw !== 'undefined') {
      const win = nw.Window.get();
      if (normalized.fullscreen) win.enterFullscreen();
      else win.leaveFullscreen();
    }
  }

  setOption(patch) {
    const next = { ...this.option, ...patch };
    this.applyOption(next);
    Save.saveOption(this.option);
  }

  toggleFullscreen() {
    this.setOption({ fullscreen: this.option.fullscreen ? 0 : 1 });
    return this.option.fullscreen;
  }

  tickPlayTime(seconds = 0) {
    this.playTime += seconds;
    return this.playTime;
  }

  saveAll() {
    Save.saveOption(this.option);
    Save.savePlayerData(this.playerData);
    Save.savePlayTime(this.playTime);
  }
}
window.Opt = new OptionManager();

// 로컬라이즈 매니져
export class LocalizeManager {

  constructor(){
    this.styles = []
    this.texts = []
  }

  t(tag, fallback) {
    return Data.text(tag, fallback ?? tag);
  }

  cycleLanguage() {
    const total = Data.languages.length || 1;
    const next = (Opt.option.language % total) + 1;
    Opt.setOption({ language: next });
    return next;
  }
}
window.Lang = new LocalizeManager();


