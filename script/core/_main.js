const W = gameData.resolution[0]
const H = gameData.resolution[1]

window.IsPortrait = gameData.isPortrait; // 세로 회상도
window.noPortrait = gameData.noPortrait; // 세로 회상도 비활성
window.SW = W
window.SH = H

function resizeCanvas() {

  if (!noPortrait) {
    IsPortrait = window.innerHeight > window.innerWidth
    SW = (IsPortrait) ? H : W
    SH = (IsPortrait) ? W : H
  }

  const scaleX = window.innerWidth / SW;
  const scaleY = window.innerHeight / SH;
  const scale = Math.min(scaleX, scaleY);
  const canvasWidth = SW * scale;
  const canvasHeight = SH * scale;
  const left = (window.innerWidth - canvasWidth) / 2;
  const top = (window.innerHeight - canvasHeight) / 2;

  // PixiJS 캔버스 스타일 설정
  app.resize(SW, SH)
  app.canvas.style.width = `${canvasWidth}px`;
  app.canvas.style.height = `${canvasHeight}px`;
  app.canvas.style.left = `${left}px`;
  app.canvas.style.top = `${top}px`;
  app.canvas.style.position = 'absolute';
  app.canvas.style.imageRendering = 'pixelated';

  resize()
}

window.addEventListener('resize', resizeCanvas);

/* Three Inint */
const threeScene = new THREE.Scene();
const _camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000);
const threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
threeRenderer.setSize(W, H);
threeScene.background = new THREE.Color(0x000000);
threeScene.fog = new THREE.Fog(
  'rgb(0,0,0)',   // 안개 색 (하늘/배경색과 맞추는 게 핵심)
  300,         // fogNear
  500         // fogFar
);
export const __three = {
  scene: threeScene,
  camera: _camera,
  background: threeScene.background,
  fog: threeScene.fog,
  renderer: threeRenderer
};



window.three = __three;

/* lil-gui: Three.js 디버그 패널 */
const gui = new GUI({ title: 'Three.js Debug' });

// 카메라 위치
const camPos = gui.addFolder('Camera Position');
camPos.add(_camera.position, 'x', -500, 500, 0.1).name('pos X').listen();
camPos.add(_camera.position, 'y', -500, 500, 0.1).name('pos Y').listen();
camPos.add(_camera.position, 'z', -500, 500, 0.1).name('pos Z').listen();

// 카메라 회전 (도 단위로 표시)
const camRot = gui.addFolder('Camera Rotation');
const rotProxy = { x: 0, y: 0, z: 0 };
const degToRad = Math.PI / 180;
const radToDeg = 180 / Math.PI;
camRot.add(rotProxy, 'x', -180, 180, 0.1).name('rot X (°)').listen().onChange(v => { _camera.rotation.x = v * degToRad; });
camRot.add(rotProxy, 'y', -180, 180, 0.1).name('rot Y (°)').listen().onChange(v => { _camera.rotation.y = v * degToRad; });
camRot.add(rotProxy, 'z', -180, 180, 0.1).name('rot Z (°)').listen().onChange(v => { _camera.rotation.z = v * degToRad; });

// 안개
const fogFolder = gui.addFolder('Fog');
const fogParams = {
  color: '#000000',
  near: threeScene.fog.near,
  far: threeScene.fog.far
};
fogFolder.addColor(fogParams, 'color').name('Fog Color').listen().onChange(v => {
  threeScene.fog.color.set(v);
  threeScene.background.set(v);
});
fogFolder.add(fogParams, 'near', 0, 1000, 1).name('Fog Near').listen().onChange(v => { threeScene.fog.near = v; });
fogFolder.add(fogParams, 'far', 0, 2000, 1).name('Fog Far').listen().onChange(v => { threeScene.fog.far = v; });

// 외부 변경 → GUI 동기화
function syncDebugGui() {
  rotProxy.x = _camera.rotation.x * radToDeg;
  rotProxy.y = _camera.rotation.y * radToDeg;
  rotProxy.z = _camera.rotation.z * radToDeg;
  fogParams.near = threeScene.fog.near;
  fogParams.far = threeScene.fog.far;
  fogParams.color = '#' + threeScene.fog.color.getHexString();
}

gui.domElement.style.position = 'absolute';
gui.domElement.style.top = '0';
gui.domElement.style.right = '0';
gui.domElement.style.zIndex = '100';
window.debugGui = gui;
gui.hide();

(async () => {
  //  PIXI init
  window.app = new PIXI.WebGLRenderer();
  await window.app.init({
    width: W,
    height: H,
    hello: true,
    backgroundAlpha: 0,
    resolution: 1,
  });
  document.body.appendChild(window.app.canvas);
  window.app.stage = new Container()

  // Three.js → PixiJS 렌더러 통합 (오프스크린 Three.js 캔버스를 배경 스프라이트로 사용)
  threeBgTex = PIXI.Texture.from(threeRenderer.domElement);
  threeBgSprite = new PIXI.Sprite(threeBgTex);
  threeBgSprite.width = W;
  threeBgSprite.height = H;
  app.stage.addChild(threeBgSprite);

  // 폰트 로딩
  await document.fonts.load('24px Cafe24Oneprettynight');
  await document.fonts.load('24px AnonymousPro');
  await document.fonts.load('24px KaiseiHarunoUmi');
  await document.fonts.ready;

  // 텍스쳐 로딩
  await Img.loadTextures()
  await Tm.loadTextures()

  // 오디오 로딩
  await Am._ensureCtxResumed();
  Am.addSources(
    Data.bgmList,
    Data.sfxList
  );


  // async 로딩
  await Data.earlyinit()
  init()
  resizeCanvas()
  requestAnimationFrame(loop);
})();

let threeBgTex = null;
let threeBgSprite = null;

let lastFrameTime = 0
const frameInterval = 1000 / 60;
let startTime = null;


const meter = new FPSMeter({
  position: 'absolute',
  top: '10px',
  left: '10px',
  heat: true,
  theme: 'dark', // light/dark/transparent/colorful
  graph: 1,
});

function loop(ts) {
  if (!startTime) startTime = ts;
  let delta = ts - lastFrameTime
  startTime = ts
  if (delta >= frameInterval) {
    lastFrameTime = ts - (delta % frameInterval)
    if (Input.isDown(KeyBind.SKIP)) {
      for (let i = 0; i < 5; i++) {
        update()
      }
    } else {
      update()
    }
    syncDebugGui()
    threeRenderer.render(threeScene, _camera);
    threeBgTex.source.update();
    app.render(app.stage)
    Input.endFrame()
    meter.tick()
  }
  requestAnimationFrame(loop);
}

function init(){
  Data.init()
  Opt.boot()
  Scene.init()
  Tm.init()
  Dm.init()
}

function update() {
  Input.update()
  Scene.update()
  Scene.lateUpdate()
  Tm.update()
}
function resize() {
}