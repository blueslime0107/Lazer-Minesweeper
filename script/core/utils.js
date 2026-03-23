

/**
 * 두 점 사이에서 t(0~1) 위치의 좌표를 반환한다.
 * @param {{x:number,y:number}} start 시작점
 * @param {{x:number,y:number}} end 끝점
 * @param {number} t 위치 (0=start, 1=end)
 * @returns {{x:number,y:number}}
 */
function lerpPos(start, end, t) {
  return pos(start.x + (end.x - start.x) * t, start.y + (end.y - start.y) * t);
}


/**
 * 현재 각도와, 목표 각도, 최대변경각도를 받아서
 * 호밍 효과를 낼 수 있도록 각도를 주는 함수
 */
function getHomingAngle(currentAngle, targetAngle, maxChangeAngle) {
  const diff = normalizeAngle(targetAngle - currentAngle)
  const step = Math.min(Math.abs(diff), maxChangeAngle)
  const next = currentAngle + Math.sign(diff) * step
  return (next % 360 + 360) % 360
}


/**
 * 보더 끝 margin(px) 안에 있으면
 * 해당 방향 각도는 나오지 않게 랜덤 각도 생성
 */
function getBorderSafeAngle(pos, border, margin = 50) {

  // 허용 각도 구간들
  let ranges = [[0, 360]];

  // 각도 구간 제거
  const cut = (min, max) => {
    const next = [];
    for (const [a, b] of ranges) {
      if (b <= min || a >= max) {
        next.push([a, b]);
      } else {
        if (a < min) next.push([a, min]);
        if (b > max) next.push([max, b]);
      }
    }
    ranges = next;
  };

  // 위쪽 → 위 방향 제거
  if (pos.y < border.top + margin) {
    cut(225, 315);
  }

  // 아래쪽 → 아래 방향 제거
  if (pos.y > border.bottom - margin) {
    cut(45, 135);
  }

  // 왼쪽 → 왼쪽 방향 제거
  if (pos.x < border.left + margin) {
    cut(135, 225);
  }

  // 오른쪽 → 오른쪽 방향 제거
  if (pos.x > border.right - margin) {
    cut(315, 360);
    cut(0, 45);
  }

  // 전부 막히면 완전 랜덤
  if (ranges.length === 0) {
    return getRandom(0, 360);
  }

  // 허용 구간 하나 선택
  const [from, to] = ranges[getRandom(0, ranges.length)];

  // 해당 구간에서 정수 각도 랜덤
  return getRandom(from, to);
}
/**
 * 중앙(0)을 기준으로 좌우 대칭인 균등 간격 값 배열을 생성한다.
 * n이 홀수면 0을 포함하고, 짝수면 ±0.5 형태로 분산된다.
 *
 * @param {number} n 생성할 값의 개수
 * @param {number} [gap=1] 값 사이의 간격
 * @returns {number[]} 중앙 기준 오프셋 배열
 *
 * @example
 * centerSpread(1) // [0]
 * centerSpread(2) // [-0.5, 0.5]
 * centerSpread(3) // [-1, 0, 1]
 * centerSpread(5, 2) // [-4, -2, 0, 2, 4]
 */
function centerSpread(n, gap = 1){
  const mid = (n - 1) / 2
  return Array.from({ length: n }, (_, i) => (i - mid) * gap)
}
/**
 * 단일 값 또는 배열을 받아
 * - 단일 값 → 그대로 반환
 * - 길이 1 배열 → 요소만 반환
 * - 그 외 배열 → 배열 그대로 반환
 * @template T
 * @param {T | T[]} value
 * @returns {T | T[]}
 */
function unwrapSingle(value) {
  if (Array.isArray(value)) {
    return value.length === 1 ? value[0] : value
  }
  return value
}
/**
 * 날짜 객체를 "YYYY/MM/DD" 형식 문자열로 변환한다.
 * @param {Date} [date=new Date()] 변환할 날짜 객체
 * @returns {string} 형식화된 날짜 문자열
 */
function getFormattedDate(date = new Date()) {
  return date.getFullYear() + '/' +
    String(date.getMonth() + 1).padStart(2, '0') + '/' +
    String(date.getDate()).padStart(2, '0');
}
/** rgba(r,g,b,a) 형식을 {color:0xRRGGBB, alpha:a} 형식으로 바꾼다 */
function rgbaSplit(rgba) {
  if(typeof rgba === "number"){
    return {
        color: rgba,
        alpha: 1
    }
  }
    const [r, g, b, a = 1] =
        rgba.match(/[\d.]+/g).map(Number);

    return {
        color: (r << 16) | (g << 8) | b,
        alpha: a
    };
}


/**
 * 도를 라디안으로 바꾼다
 * @param {number} num 변환할 각도
 * @returns {number} 라디안으로 변환된 값
 */
function radian(num){ 
  return num * Math.PI/180
}
/**
 * 라디안을 각도로 바꾼다
 * @param {number} num 변환할 라디안
 * @returns {number} 각도로 변환된 값
 */
function degree(num){ 
  return num * 180/Math.PI
}


/**
 * 삼각파 형태의 수열을 생성한다. (ex: 1 2 3 4 5 6 5 4 3 2 ...)
 * @param {number} n 입력 값(프레임 등)
 * @param {number} [min=1] 최소값
 * @param {number} [max=6] 최대값
 * @returns {number} min ↗ max ↘ min 형태로 반복되는 값
 */
function triangleWave(n, min = 1, max = 6) {
  const period = (max - min) * 2;
  const pos = (n - min) % period;
  return pos < (max - min)
    ? min + pos
    : max - (pos - (max - min));
}


/**
 * 문자열 끝에서 연속된 숫자를 찾아 정수로 반환한다.
 * @param {string} str 검사할 문자열
 * @returns {number|null} 끝 숫자 또는 null
 */
function getLastNumber(str) {
  const match = str.match(/\d+$/);
  return match ? parseInt(match[0]) : null;
}


/**
 * A→B 방향의 단위 벡터를 계산한다.
 * @param {{x:number,y:number}} A 시작점
 * @param {{x:number,y:number}} B 도착점
 * @returns {{x:number,y:number}} 정규화된 방향 벡터
 */
function getNormalizedDirection(A, B) {
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const len = Math.hypot(dx, dy);
  return { x: dx / len, y: dy / len };
};


/**
 * min 이상 max 미만의 랜덤 정수
 * @param {number} min 최소값 포함
 * @param {number} max 최대값 미포함
 * @returns {number}
 */
function getRandom(min, max) {
  return Math.floor(Rnd.random() * (max - min)) + min;
}


/**
 * -1 또는 +1을 50% 확률로 반환한다.
 * @returns {number} -1 또는 1
 */
function getRandBuho() {
  return (getRandom(0, 2) === 1) ? -1 : 1;
}


/**
 * min 이상 max 미만의 랜덤 실수
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function getRandomF(min, max) {
  return Rnd.random() * (max - min) + min;
}


/**
 * min 이상 max 미만의 숫자를 모두 포함하는 배열을 만들어 랜덤 셔플한다.
 * @param {number} min 포함
 * @param {number} max 미포함
 * @returns {number[]}
 */
function getRandomList(min, max) {
  const numbers = [];
  for (let i = min; i < max; i++) numbers.push(i);

  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Rnd.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers;
}


/**
 * 연속된 숫자 차이가 2 미만이 되지 않는 랜덤 숫자 배열을 만든다.
 * @param {number} min 포함
 * @param {number} max 미포함
 * @returns {number[]}
 */
function uniqueRandomList(min, max) {
  const numbers = [];
  for (let i = min; i < max; i++) numbers.push(i);

  while (true) {
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Rnd.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    let valid = true;
    for (let i = 0; i < numbers.length - 1; i++) {
      if (Math.abs(numbers[i] - numbers[i + 1]) < 2) {
        valid = false;
        break;
      }
    }
    if (valid) return numbers.slice();
  }
}


/**
 * 배열을 피셔-예이츠 방식으로 무작위 섞기
 * @template T
 * @param {T[]} arr 
 * @returns {T[]} 같은 배열을 섞어서 반환
 */
function shuffleList(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


/**
 * 각도를 -180 ~ +180 사이로 정규화한다.
 * @param {number} angle
 * @returns {number}
 */
function normalizeAngle(angle) {
  return ((angle + 180) % 360 + 360) % 360 - 180;
}


/**
 * 초(sec)를 "MM:SS" 문자열로 반환
 * @param {number} value 초 단위 값
 * @returns {string}
 */
function secToTime(value) {
  let min = Math.floor(value / 60)
  let sec = value % 60
  return String(min).padStart(2, '0') + ":" + String(sec).padStart(2, '0');
}


/**
 * 정수의 자릿수 길이를 반환한다.
 * @param {number} n
 * @returns {number}
 */
function digitCount(n) {
  return Math.abs(n).toString().length;
}


/**
 * 두 수의 일의 자리끼리 더했을 때 자리올림이 발생하는지 검사한다.
 * @param {number} a
 * @param {number} b
 * @returns {boolean}
 */
function isCarry(a, b) {
  const unitA = a % 10;
  const unitB = b % 10;
  return unitA + unitB >= 10;
}


/**
 * 두 점으로부터 각도를 도(degree) 단위로 계산한다.
 * @param {{x:number,y:number}} owner
 * @param {{x:number,y:number}} target
 * @returns {number} 0~360도
 */
function lookPoint(owner, target) {
  const dx = target.x - owner.x;
  const dy = target.y - owner.y;
  return (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
}

/**
 * x, y 값을 가지는 오브젝트를 생성한다
 * @param {number} x
 * @param {number} y
 * @returns {{x:number,y:number}} 0~360도
 */
function pos(x, y) {
  return { x, y }
}

const posZero = { x: 0, y: 0 }

function posCompare(pos1, pos2) {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

/**
 * 두 좌표를 더한 새로운 좌표 객체를 반환합니다.
 * * @param {{x: number, y: number}} a - x, y 속성을 가진 기본 좌표 객체
 * @param {{x: number, y: number} | number[]} b - x, y 객체 또는 [x, y] 형태의 숫자 배열
 * @returns {Object} x, y 합계가 계산된 pos 객체
 */
function posAdd(a, b) {
  // b가 배열 [x, y] 형태인 경우
  if (Array.isArray(b)) {
    return pos(a.x + b[0], a.y + b[1]);
  }
  
  // b가 오브젝트 {x, y} 형태인 경우
  return pos(a.x + b.x, a.y + b.y);
}

function getDist(p1, p2) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

function frameMove(start, end, frame, time, ease = Easing.linear) {
    // 경계 처리
    if (frame <= 0) return start;
    if (frame >= time) return end;

    // 0~1 사이의 보간 단계
    const t = frame / time;

    // easing 적용한 t
    const k = ease(t);

    // 보간된 값(lerp)
    return start + (end - start) * k;
}

/**
 * 기준점에서 angle(도) 방향으로 radius만큼 이동한 새로운 좌표를 반환한다.
 * @param {{x:number,y:number}} obj1 중심점
 * @param {number} angle degree 단위
 * @param {number} radius 이동 거리
 * @returns {Pos}
 */
function goAngle(obj1, angle, radius) {
  const _x = obj1.x + Math.cos(angle / 180 * Math.PI) * radius;
  const _y = obj1.y + Math.sin(angle / 180 * Math.PI) * radius;
  return pos(_x, _y);
}


/**
 * 점(x,y)과 방향(angleDeg)에 대해,
 * 특정 반지름의 원과 직선이 교차하는 지점을 구한다.
 * @param {number} x
 * @param {number} y
 * @param {number} angleDeg
 * @returns {number|null} 직선 파라미터 t 또는 null
 */
function distanceToCircle(x, y, angleDeg) {
  const cx = 180;
  const cy = 180;
  const r = getDist(pos(0, 0), pl)

  const angleRad = angleDeg * Math.PI / 180;
  const dx = Math.cos(angleRad);
  const dy = Math.sin(angleRad);

  const ox = x - cx;
  const oy = y - cy;

  const a = dx * dx + dy * dy;
  const b = 2 * (ox * dx + oy * dy);
  const c = ox * ox + oy * oy - r * r;

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return null;

  const sqrtD = Math.sqrt(discriminant);
  const t1 = (-b - sqrtD) / (2 * a);
  const t2 = (-b + sqrtD) / (2 * a);

  const tList = [t1, t2].filter(t => t >= 0);
  if (tList.length === 0) return null;

  return Math.min(...tList);
}


/**
 * 두께를 가진 선분과 원의 충돌 여부를 판단한다.
 * @param {{x:number,y:number}} A 시작점
 * @param {number} angleDeg 각도(deg)
 * @param {number} length 선 길이
 * @param {number} thickness 선 두께
 * @param {{x:number,y:number,radius:number}} circle 원
 * @returns {boolean}
 */
function collideLineCircle(A, angleDeg, length, thickness, circle) {
  const B = goAngle(A, angleDeg, length);

  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const abLen2 = dx * dx + dy * dy;
  const half = thickness * 0.5;

  if (abLen2 === 0) {
    const dist = getDist(A, circle);
    return dist <= circle.radius + half;
  }

  const t = Math.max(
    0,
    Math.min(1, ((circle.x - A.x) * dx + (circle.y - A.y) * dy) / abLen2)
  );

  const closestX = A.x + t * dx;
  const closestY = A.y + t * dy;

  const dist = Math.hypot(circle.x - closestX, circle.y - closestY);
  return dist <= circle.radius + half;
}

function collideCircle(a,b,offset=0){
  return getDist(a,b) < a.radius + b.radius + offset
}


/**
 * 현재 장치가 모바일인지 확인한다.
 * @returns {boolean}
 */
function isMobileDevice() {
  const ua = navigator.userAgent;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
}

// 리스트 클리어
Object.defineProperty(Array.prototype, "clear", {
  value: function () {
    this.length = 0;
  }
});

const NumToStr = ["ZERO","ONE","TWO","THREE","FOUR","FIVE","SIX","SEVEN","EIGHT","NINE","TEN"]

const Easing = {

    /* === Linear === */
    /**
     * 선형 보간
     * @param {number} t - 0~1
     * @returns {number}
     */
    linear: t => t,

    /* === Quad === */
    /** @param {number} t @returns {number} */
    easeInQuad: t => t * t,
    /** @param {number} t @returns {number} */
    easeOutQuad: t => t * (2 - t),
    /** @param {number} t @returns {number} */
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,

    /* === Cubic === */
    /** @param {number} t @returns {number} */
    easeInCubic: t => t * t * t,
    /** @param {number} t @returns {number} */
    easeOutCubic: t => 1 - Math.pow(1 - t, 3),
    /** @param {number} t @returns {number} */
    easeInOutCubic: t => t < 0.5 ?
        4 * t * t * t :
        1 - Math.pow(-2 * t + 2, 3) / 2,

    /* === Quart === */
    /** @param {number} t @returns {number} */
    easeInQuart: t => t * t * t * t,
    /** @param {number} t @returns {number} */
    easeOutQuart: t => 1 - Math.pow(1 - t, 4),
    /** @param {number} t @returns {number} */
    easeInOutQuart: t => t < 0.5 ?
        8 * t * t * t * t :
        1 - Math.pow(-2 * t + 2, 4) / 2,

    /* === Quint === */
    /** @param {number} t @returns {number} */
    easeInQuint: t => t * t * t * t * t,
    /** @param {number} t @returns {number} */
    easeOutQuint: t => 1 - Math.pow(1 - t, 5),
    /** @param {number} t @returns {number} */
    easeInOutQuint: t => t < 0.5 ?
        16 * t * t * t * t * t :
        1 - Math.pow(-2 * t + 2, 5) / 2,

    /* === Sine === */
    /** @param {number} t @returns {number} */
    easeInSine: t => 1 - Math.cos((t * Math.PI) / 2),
    /** @param {number} t @returns {number} */
    easeOutSine: t => Math.sin((t * Math.PI) / 2),
    /** @param {number} t @returns {number} */
    easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,

    /* === Expo === */
    /** @param {number} t @returns {number} */
    easeInExpo: t => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
    /** @param {number} t @returns {number} */
    easeOutExpo: t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    /** @param {number} t @returns {number} */
    easeInOutExpo: t =>
        t === 0 ? 0 :
            t === 1 ? 1 :
                t < 0.5 ?
                    Math.pow(2, 20 * t - 10) / 2 :
                    (2 - Math.pow(2, -20 * t + 10)) / 2,

    /* === Circ === */
    /** @param {number} t @returns {number} */
    easeInCirc: t => 1 - Math.sqrt(1 - t * t),
    /** @param {number} t @returns {number} */
    easeOutCirc: t => Math.sqrt(1 - (t - 1) * (t - 1)),
    /** @param {number} t @returns {number} */
    easeInOutCirc: t => t < 0.5 ?
        (1 - Math.sqrt(1 - 4 * t * t)) / 2 :
        (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,

    /* === Back === */
    /** @param {number} t @returns {number} */
    easeInBack: t => {
        const c1 = 1.70158;
        return c1 * t * t * t - c1 * t * t;
    },
    /** @param {number} t @returns {number} */
    easeOutBack: t => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    /** @param {number} t @returns {number} */
    easeInOutBack: t => {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;
        return t < 0.5 ?
            (Math.pow(2 * t, 2) * ((2 * t) * (c2 + 1) - c2)) / 2 :
            (Math.pow(2 * t - 2, 2) * ((2 * t - 2) * (c2 + 1) + c2) + 2) / 2;
    },

    /* === Elastic === */
    /** @param {number} t @returns {number} */
    easeInElastic: t => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 :
            t === 1 ? 1 :
                -Math.pow(2, 10 * t - 10) *
                Math.sin((t * 10 - 10.75) * c4);
    },
    /** @param {number} t @returns {number} */
    easeOutElastic: t => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 :
            t === 1 ? 1 :
                Math.pow(2, -10 * t) *
                Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    /** @param {number} t @returns {number} */
    easeInOutElastic: t => {
        const c5 = (2 * Math.PI) / 4.5;
        return t === 0 ? 0 :
            t === 1 ? 1 :
                t < 0.5 ?
                    -(Math.pow(2, 20 * t - 10) *
                        Math.sin((20 * t - 11.125) * c5)) / 2 :
                    (Math.pow(2, -20 * t + 10) *
                        Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
    },

    /* === Bounce === */
    /** @param {number} t @returns {number} */
    easeOutBounce: t => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) return n1 * t * t;
        else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
        else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
        else return n1 * (t -= 2.625 / d1) * t + 0.984375;
    },

    /** @param {number} t @returns {number} */
    easeInBounce: t => 1 - Easing.easeOutBounce(1 - t),

    /** @param {number} t @returns {number} */
    easeInOutBounce: t =>
        t < 0.5 ?
            (1 - Easing.easeOutBounce(1 - 2 * t)) / 2 :
            (1 + Easing.easeOutBounce(2 * t - 1)) / 2,
};

const KeyCode = {
  Backspace: 8,
  Tab: 9,
  Enter: 13,
  Shift: 16,
  Control: 17,
  Alt: 18,
  PauseBreak: 19,
  CapsLock: 20,
  Escape: 27,
  Space: 32,

  PageUp: 33,
  PageDown: 34,
  End: 35,
  Home: 36,
  ArrowLeft: 37,
  ArrowUp: 38,
  ArrowRight: 39,
  ArrowDown: 40,
  Insert: 45,
  Delete: 46,

  Num0: 48,
  Num1: 49,
  Num2: 50,
  Num3: 51,
  Num4: 52,
  Num5: 53,
  Num6: 54,
  Num7: 55,
  Num8: 56,
  Num9: 57,

  A: 65, B: 66, C: 67, D: 68, E: 69,
  F: 70, G: 71, H: 72, I: 73, J: 74,
  K: 75, L: 76, M: 77, N: 78, O: 79,
  P: 80, Q: 81, R: 82, S: 83, T: 84,
  U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90,

  LeftWindowKey: 91,
  RightWindowKey: 92,
  SelectKey: 93,

  Numpad0: 96,
  Numpad1: 97,
  Numpad2: 98,
  Numpad3: 99,
  Numpad4: 100,
  Numpad5: 101,
  Numpad6: 102,
  Numpad7: 103,
  Numpad8: 104,
  Numpad9: 105,

  Multiply: 106,
  Add: 107,
  Subtract: 109,
  DecimalPoint: 110,
  Divide: 111,

  F1: 112, F2: 113, F3: 114, F4: 115,
  F5: 116, F6: 117, F7: 118, F8: 119,
  F9: 120, F10: 121, F11: 122, F12: 123,

  NumLock: 144,
  ScrollLock: 145,

  Semicolon: 186,
  Equal: 187,
  Comma: 188,
  Dash: 189,
  Period: 190,
  Slash: 191,
  GraveAccent: 192,

  OpenBracket: 219,
  BackSlash: 220,
  CloseBracket: 221,
  Quote: 222
};


