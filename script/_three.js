
const ThreeTextures = {
    stage1_bg1: { texture: 'Bg1', crop: [0, 120, 540, 240] },
    stage1_sky: { texture: 'Bg1', crop: [0, 0, 540, 120] }
}

const ThreeBG = {
    forest: {
        scrollSpeed: 0.5,
        camPosition: { x: 0, y: 8.5, z: 8.5 },
        comRotation: { x: 0, y: -90, z: 0 },
        fogSetting: { color: '#bababa', near: 50, far: 100 },
        sky: "stage1_sky",
        segmentsData: {
            "plain": {
                name: "plain",
                segLen: 50,
                init: function () {
                    const floorGeo = new THREE.PlaneGeometry(this.segLen, 120);
                    const floorMat = new THREE.MeshBasicMaterial({
                        map: ThreeTextures.stage1_bg1,
                        side: THREE.DoubleSide
                    });
                    const floor = new THREE.Mesh(floorGeo, floorMat);
                    floor.rotation.x = -Math.PI / 2;
                    floor.position.set(this.segLen * 0.5, 0, 0);
                    this.group.add(floor);
                }
            },
            "plain2": {
                name: "plain2",
                segLen: 200,
                init: function () {
                    // ===== 바닥 =====
                    const floorGeo = new THREE.PlaneGeometry(this.segLen, 120);
                    const floorMat = new THREE.MeshBasicMaterial({
                        map: ThreeTextures.stage1_bg1,
                        side: THREE.DoubleSide
                    });
                    const floor = new THREE.Mesh(floorGeo, floorMat);
                    floor.rotation.x = -Math.PI / 2;
                    floor.position.set(this.segLen * 0.5, 0, 0);
                    this.group.add(floor);

                    // ===== 나무 =====
                    const treeCount = 100;          // 나무 개수

                    const trunkGeo = new THREE.CylinderGeometry(1.2, 1.5, 30, 8);
                    const trunkMat = new THREE.MeshBasicMaterial({
                        color: 0x6b4a2b // 갈색
                    });

                    for (let i = 0; i < treeCount; i++) {
                        const trunk = new THREE.Mesh(trunkGeo, trunkMat);

                        // 바닥 범위 내 랜덤 배치
                        const x = getRandom(1, this.segLen);
                        const z = getRandom(-50, -20) + (i % 2 === 0 ? 0 : 70)

                        trunk.position.set(x, 9, z); // y는 높이/2
                        trunk.rotation.y = Math.random() * Math.PI * 2;

                        this.group.add(trunk);
                    }
                }
            }
        },
        initialSegments: ['plain']
    }
}