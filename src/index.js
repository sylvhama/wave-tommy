import "./styles.css";

import leftIcon from "./assets/left.png";
import rightIcon from "./assets/right.png";
import bomb from "./assets/bomb.png";
import dude from "./assets/dude.png";

const Phaser = window.Phaser;

const SCENE_WIDTH = window.innerWidth < 375 ? window.innerWidth : 375;
const SCENE_HEIGHT = window.innerHeight < 650 ? window.innerHeight : 650;
const ICON_SIZE = 32;
const LEFT_DIRECTION = "left";
const RIGHT_DIRECTION = "right";

const gameScene = {
  preload: preload,
  create: create,
  update: update
};

const config = {
  type: Phaser.AUTO,
  width: SCENE_WIDTH,
  height: SCENE_HEIGHT,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: gameScene,
  backgroundColor: "#F4F6F8"
};

let left;
let right;
let player;
let bombs;
let platforms;
let cursors;

let isButtonDown = false;
let direction;
let score = 0;
let scoreText;
let gameOver = false;

new Phaser.Game(config);

function preload() {
  this.load.image("left", leftIcon);
  this.load.image("right", rightIcon);
  this.load.image("bomb", bomb);
  this.load.spritesheet("dude", dude, {
    frameWidth: 32,
    frameHeight: 48
  });
}

function create() {
  //  A simple background for our game
  this.add.image(400, 300, "sky");

  //  The platforms group contains the ground and the 2 ledges we can jump on
  platforms = this.physics.add.staticGroup();

  const floor = this.add.rectangle(
    0,
    SCENE_HEIGHT - 100,
    SCENE_WIDTH,
    100,
    0xbbe5b3
  );
  floor.setOrigin(0, 0);

  platforms.add(floor);

  // The player and its settings
  player = this.physics.add.sprite(SCENE_WIDTH / 2, SCENE_HEIGHT / 2, "dude");

  //  Player physics properties. Give the little guy a slight bounce.
  player.setCollideWorldBounds(true);

  //  Input Events
  cursors = this.input.keyboard.createCursorKeys();

  bombs = this.physics.add.group({
    key: "bomb",
    repeat: 0,
    setXY: { x: 32, y: 0, stepX: 0 }
  });

  //  The score
  scoreText = this.add.text(16, 16, "Score: 0", {
    fontFamily: "Comic Sans MS",
    fontSize: "32px",
    fill: "#000"
  });

  //  Collide the player and the stars with the platforms
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(bombs, platforms, bombTouchesGround, null, this);

  this.physics.add.collider(player, bombs, hitBomb, null, this);

  // Add buttons
  left = this.add.image(ICON_SIZE * 2, SCENE_HEIGHT - ICON_SIZE * 1.75, "left");
  right = this.add.image(
    SCENE_WIDTH - ICON_SIZE * 2,
    SCENE_HEIGHT - ICON_SIZE * 1.75,
    "right"
  );

  left.setInteractive();
  right.setInteractive();

  left.on("pointerdown", e => {
    direction = LEFT_DIRECTION;
    isButtonDown = true;
  });
  left.on("pointerup", e => {
    isButtonDown = false;
  });

  right.on("pointerdown", e => {
    direction = RIGHT_DIRECTION;
    isButtonDown = true;
  });
  right.on("pointerup", e => {
    isButtonDown = false;
  });
}

function update() {
  if (gameOver) {
    return;
  }

  if (cursors.left.isDown) {
    direction = LEFT_DIRECTION;
  } else if (cursors.right.isDown) {
    direction = RIGHT_DIRECTION;
  } else if (!isButtonDown) {
    direction = null;
  }

  switch (direction) {
    case LEFT_DIRECTION:
      if (isButtonDown) left.setAlpha(0.6);
      player.setVelocityX(-160);
      break;
    case RIGHT_DIRECTION:
      if (isButtonDown) right.setAlpha(0.6);
      player.setVelocityX(160);
      break;
    default:
      left.setAlpha(1);
      right.setAlpha(1);
      player.setVelocityX(0);
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-200);
  }
}

function createBomb() {
  const leftInterval = player.x - 200 < 0 ? 0 : player.x - 200;
  const rightInterval =
    player.x + 200 > SCENE_WIDTH ? SCENE_WIDTH : player.x + 200;
  const nextBomb = bombs.create(
    Phaser.Math.Between(leftInterval, rightInterval),
    0,
    "bomb"
  );
  nextBomb.setVelocityY(Phaser.Math.Between(0, 300));
}

function bombTouchesGround(bomb) {
  // Destroy bomb
  bomb.disableBody(true, true);

  //  Add and update the score
  score += 10;
  scoreText.setText("Score: " + score);

  // Add next bomb(s)
  createBomb();
  if (
    [30, 80, 150, 300, 500, 800, 1000, 1500, 2000, 2500, 3000].includes(score)
  ) {
    createBomb();
  }
  // bomb.setCollideWorldBounds(true);
  // bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  // bomb.allowGravity = false;
}

function hitBomb(player) {
  this.physics.pause();

  player.setTint(0xff0000);

  gameOver = true;
}
