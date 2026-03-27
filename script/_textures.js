
const TextureAssets = {
    player:'player.png',
    bullet:'bullet.png',
    manual1:'manual/manual1.png',
    manual2_1:'manual/manual2_1.png',
    manual2_2:'manual/manual2_2.png',
    manual3_1:'manual/manual3_1.png',
    manual3_2:'manual/manual3_2.png',
    manual3_3:'manual/manual3_3.png',
    manual4_1:'manual/manual4_1.png',
    manual4_2:'manual/manual4_2.png',
    manual4_3:'manual/manual4_3.png',

}

const Textures = {
    rect: function () {
        let g = new Graphics();
        g.rect(0, 0, 1, 1).fill({ color: 0xffffff })
        return app.generateTexture({ target: g });
    },
    circle: function () {
        let g = new Graphics();
        g.circle(0, 0, 64).fill({ color: 0xffffff })
        return app.generateTexture({ target: g });
    },
    plus: function () {
        const SIZE = 96;
        const THICK = 24;
        let g = new Graphics();
        g.rect(0, (SIZE - THICK) / 2, SIZE, THICK);
        g.rect((SIZE - THICK) / 2, 0, THICK, SIZE);
        g.fill({ color: 0xffffff });
        return app.generateTexture({
            target: g
        });
    },
    triangle: function () {
        const g = new PIXI.Graphics();

        const size = 72;
        const h = size * Math.sqrt(3) / 2;

        // 🔥 중앙 보정용 오프셋
        const offsetY = h / 3;

        g.moveTo(0, -h / 2);
        g.lineTo(-size / 2, h / 2);
        g.lineTo(size / 2, h / 2);
        g.closePath();
        g.fill(0xffffff);
        g.moveTo(0, -h / 2);
        g.lineTo(0, h / 2 + offsetY);
        g.closePath();
        g.fill(0xffffff);

        return app.textureGenerator.generateTexture({
            target: g,
            antialias: false
        });
    },
    playerIdle: function () {
        const list = []
        for(let i=0;i<8;i++){
            const tex = new PIXI.Texture({
                source: Img.assets.player,
                frame: { x: 32 * i, y: 0, width: 32, height: 48 }
            })
            list.push(tex)
        }
        return list
    },
    playerLeft: function () {
        const list = []
        for(let i=0;i<8;i++){
            const tex = new PIXI.Texture({
                source: Img.assets.player,
                frame: { x: 32 * i, y: 48, width: 32, height: 48 }
            })
            list.push(tex)
        }
        return list
    },
    playerRight: function () {
        const list = []
        for(let i=0;i<8;i++){
            const tex = new PIXI.Texture({
                source: Img.assets.player,
                frame: { x: 32 * i, y: 48*2, width: 32, height: 48 }
            })
            list.push(tex)
        }
        return list
    },
    playerOption: function () {
        const tex = new PIXI.Texture({
            source: Img.assets.player,
            frame: { x: 81, y: 146, width: 16, height: 16 }
        })
        return tex
    },
    playerMainShot: function () {
        const list = []
        for(let i=0;i<8;i++){
            const tex = new PIXI.Texture({
                source: Img.assets.player,
                frame: { x: 16*i, y: 145, width: 16, height: 16 }
            })
            list.push(tex)
        }
        return list
    },
    playerSubShot: function () {
        const tex = new PIXI.Texture({
            source: Img.assets.player,
            frame: { x: 69, y: 184, width: 58, height: 10 }
        })
        return tex
    },
    bulletLazer: ()=>smallBullet(0, 0),
    bulletSpear: ()=>smallBullet(0, 16),
    bulletRing: ()=>smallBullet(0, 16*2),
    bulletCircle: ()=>smallBullet(0, 16*3),
    bulletRice: ()=>smallBullet(0, 16*4),
    bulletKunai: ()=>smallBullet(0, 16*5),
    bulletIce: ()=>smallBullet(0, 16*6),
    bulletPaper: ()=>smallBullet(0, 16*7),
    bulletGun: ()=>smallBullet(0, 16*8),
    bulletDarkrice: ()=>smallBullet(0, 16*9),
    bulletStar: ()=>smallBullet(0, 16*10),
    bulletSmallDisappear: ()=>smallBullet(0, 16*11),
    bulletTear: ()=>smallBullet(0, 448),
    bulletDarksnow: ()=>verySmallBullet(0,192),
    bulletSmallrice: ()=>verySmallBullet(64,192),
    bulletSnow: ()=>verySmallBullet(0,240),
    bulletHeart: () => normalBullet(0,256),
    bulletArrow: () => normalBullet(0,256+32),
    bulletBigStar: () => normalBullet(256,32*0),
    bulletBig: () => normalBullet(256,32*1),
    bulletFairy: () => normalBullet(256,32*2),
    bulletKnife: () => normalBullet(256,32*3),
    bulletOval: () => normalBullet(256,32*4),
    bulletStone: () => normalBullet(256*2,32*3),
    bulletBigTear: () => normalBullet(256*2,32*4),
    bulletYinyang: () => normalBullet(256*2,32*5),
    bulletSpawn: () => normalBullet(256,32*5),
    bulletLight: function(){
        const list = []
        list.push(new PIXI.Texture({source: Img.assets.bullet,
            frame: { x: 256, y: 256, width: 64, height: 64 }
        }))
        list.push(new PIXI.Texture({source: Img.assets.bullet,
            frame: { x: 256+64, y: 256, width: 64, height: 64 }
        }))
        list.push(new PIXI.Texture({source: Img.assets.bullet,
            frame: { x: 256+64*3, y: 256+64, width: 64, height: 64 }
        }))
        list.push(new PIXI.Texture({source: Img.assets.bullet,
            frame: { x: 256+64*2, y: 256+64, width: 64, height: 64 }
        }))
        list.push(new PIXI.Texture({source: Img.assets.bullet,
            frame: { x: 256+64, y: 256+64, width: 64, height: 64 }
        }))
        list.push(new PIXI.Texture({source: Img.assets.bullet,
            frame: { x: 256, y: 256+64, width: 64, height: 64 }
        }))
        list.push(new PIXI.Texture({source: Img.assets.bullet,
            frame: { x: 256+64*3, y: 256, width: 64, height: 64 }
        }))
        list.push(new PIXI.Texture({source: Img.assets.bullet,
            frame: { x: 256+64*2, y: 256, width: 64, height: 64 }
        }))
        return list
    },
    bulletBentLazer: function () {
        const list = []
        const colorIndex = [0,2,14,13,10,8,6,4]
        for(let i=0;i<8;i++){
            const tex = new PIXI.Texture({
                source: Img.assets.bullet,
                frame: { x: 512, y: 224+36+24*colorIndex[i], width: 256, height: 16 }
            })
            list.push(tex)
        }
        return list
    },
}

function smallBullet(x,y){
    const list = []
    const colorIndex = [0,2,14,13,10,8,6,4,15]
    for(let i=0;i<colorIndex.length;i++){
        const tex = new PIXI.Texture({
            source: Img.assets.bullet,
            frame: { x: x+16*colorIndex[i], y: y, width: 16, height: 16 }
        })
        list.push(tex)
    }
    return list
}

function verySmallBullet(x,y){
    const list = []
    list.push(new PIXI.Texture({source: Img.assets.bullet,
        frame: { x: x, y: y, width: 8, height: 8 }
    }))
    list.push(new PIXI.Texture({source: Img.assets.bullet,
        frame: { x: x+8*2, y: y, width: 8, height: 8 }
    }))
    list.push(new PIXI.Texture({source: Img.assets.bullet,
        frame: { x: x+8*6, y: y+8, width: 8, height: 8 }
    }))
    list.push(new PIXI.Texture({source: Img.assets.bullet,
        frame: { x: x+8*5, y: y+8, width: 8, height: 8 }
    }))
    list.push(new PIXI.Texture({source: Img.assets.bullet,
        frame: { x: x+8*2, y: y+8, width: 8, height: 8 }
    }))
    list.push(new PIXI.Texture({source: Img.assets.bullet,
        frame: { x: x, y: y+8, width: 8, height: 8 }
    }))
    list.push(new PIXI.Texture({source: Img.assets.bullet,
        frame: { x: x+8*6, y: y, width: 8, height: 8 }
    }))
    list.push(new PIXI.Texture({source: Img.assets.bullet,
        frame: { x: x+8*4, y: y, width: 8, height: 8 }
    }))
    list.push(new PIXI.Texture({source: Img.assets.bullet,
        frame: { x: x+8*7, y: y+8, width: 8, height: 8 }
    }))
    return list
}

function normalBullet(x,y){
    const list = []
    const colorIndex = [0,1,7,6,5,4,3,2]
    for(let i=0;i<9;i++){
        const tex = new PIXI.Texture({
            source: Img.assets.bullet,
            frame: { x: x+32*colorIndex[i], y: y, width: 32, height: 32 }
        })
        list.push(tex)
    }
    return list
}

async function LoadTexture() {

}
