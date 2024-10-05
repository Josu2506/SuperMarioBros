import { createAnimations } from "./animations.js";
import { initAudio } from "./audio.js";
import { checkControls } from "./controls.js";

const config = {
  autofocus: false,
  type: Phaser.AUTO,
  width: 256,
  height: 244,
  backgroundColor: "#049cd8",
  parent: "game",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload, // se ejecuta preparar recursos
    create, // se ejecuta cuando el juego comienza
    update, // se ejecuta en cada frame
  },
};

new Phaser.Game(config);

// this -> game -> el juego que se esta construyendo
function preload() {
  this.load.image("cloud1", "assets/scenery/overworld/cloud1.png");
  this.load.image("floorbricks", "assets/scenery/overworld/floorbricks.png");

  this.load.spritesheet("mario", "assets/entities/mario.png", {
    frameWidth: 18,
    frameHeight: 16,
  });

  this.load.spritesheet("goomba", "assets/entities/overworld/goomba.png", {
    frameWidth: 16,
    frameHeight: 16,
  })

  // -- audio --
  
  initAudio(this)


}

function create() {
  // image (x, y, id-del-asset)
  this.add.image(0, 0, "cloud1").setOrigin(0, 0).setScale(0.15);

  this.floor = this.physics.add.staticGroup();

  this.floor
    .create(0, config.height - 16, "floorbricks")
    .setOrigin(0, 0.5)
    .refreshBody();

  this.floor
    .create(150, config.height - 16, "floorbricks")
    .setOrigin(0, 0.5)
    .refreshBody();

  this.mario = this.physics.add
    .sprite(50, 110, "mario")
    .setOrigin(0, 1)
    .setCollideWorldBounds(true)
    .setGravityY(300);

    this.enemy = this.physics.add.sprite(120, config.height - 32, 'goomba')
    .setOrigin(0,1)
    .setGravityY(300)
    .setVelocityX(-30)


  this.physics.world.setBounds(0, 0, 2000, config.height);

  this.physics.add.collider(this.mario, this.floor);
  this.physics.add.collider(this.enemy, this.floor);
  this.physics.add.collider(this.mario, this.enemy, onHitEnemy, null, this)


  this.cameras.main.setBounds(0, 0, 2000, config.height);
  this.cameras.main.startFollow(this.mario, true, 0.05, 0.05);

  createAnimations(this);

  this.enemy.anims.play("goomba-walk", true)

  this.keys = this.input.keyboard.createCursorKeys();
}

function onHitEnemy(mario, enemy) {
  if (mario.body.touching.down && enemy.body.touching.up) {
    enemy.anims.play("goomba-dead", true)
    enemy.setVelocityX(0)
    mario.setVelocityY(-200)
    this.sound.play("goomba-stomp")
    setTimeout(() => {
      enemy.destroy()
      
    }, 300)

    mario.setVelocityY(-100);
  } else {
    //Mario die
  }
}

function update() {
  
  checkControls(this)

  const { mario, sound, scene} = this;

  //check if Mario is Dead
  if (mario.y >= config.height) {
    mario.isDead = true;
    mario.anims.play("mario-dead");
    mario.setCollideWorldBounds(false);
    sound.add("gameover", { volume: 0.2 }).play();

    setTimeout(() => {
      mario.setVelocityY(-350);
    }, 100);

    setTimeout(() => {
      scene.restart();
    }, 2000);
  }
}
