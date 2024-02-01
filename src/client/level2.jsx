// level1.jsx

import { CST } from "./loading_menu/CST.jsx";

import eventsCenter from "./EventsCenter.jsx"; // this allows communication between scenes

import { PauseScene } from "./pauseScene.jsx";

import { store } from "./store"; // brings in redux store

export class Level2 extends Phaser.Scene {
  constructor() {
    super({
      key: CST.SCENES.LEVEL2,
    });
    this.player;
    this.chest1;
    this.chest2;
    this.cursors;
    this.monster;
    this.gameOver = false;
  }

  init() {
    console.log("level2");
  }

  preload() {
    const state = store.getState(); // this brings in the state from redux
    console.log(state, "in preload");
    console.log(
      "this is the character class: ",
      state.userCharacter.character.character_class
    );

    this.load.image("tiles2", "/assets/levelAssets/OLDtileset32x32.png");
    this.load.tilemapTiledJSON("map2", "/assets/levelAssets/level2.json");

    switch (state.userCharacter.character.character_class) {
      case "warrior":
        console.log("loading the warrior");
        this.load.spritesheet(
          "playerSprite",
          "assets/levelAssets/knight78x60.png",
          { frameWidth: 78, frameHeight: 60 }
        );
        break;
      case "mage":
        console.log("loading the mage");
        this.load.spritesheet(
          "playerSprite",
          "assets/levelAssets/mage78x60.png",
          { frameWidth: 78, frameHeight: 60 }
        );
        break;
      case "rogue":
        console.log("loading the rogue");
        this.load.spritesheet(
          "playerSprite",
          "assets/levelAssets/rogue78x60.png",
          { frameWidth: 78, frameHeight: 60 }
        );
        break;
    }

    this.load.atlas(
      "skeleton",
      "assets/levelAssets/skeleton_spritesheet.png",
      "assets/levelAssets/skeleton_sprites.json"
    );

    this.load.spritesheet("chest", "assets/levelAssets/chest_sprite.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("goldCoin", "assets/levelAssets/goldCoin.png", {
      frameWidth: 40,
      frameHeight: 40,
    });
    this.load.spritesheet("sword", "assets/levelAssets/swordIcon25x48.png", {
      frameWidth: 25,
      frameHeight: 48,
    });
    this.load.spritesheet("door", "assets/levelAssets/door50x100.png", {
      frameWidth: 50,
      frameHeight: 100,
    });
  }

  create() {
    this.scene.run("pauseScene"); // used to keep the pause scene updated with stats causes pausescene to run in the background

    this.map = this.make.tilemap({ key: "map2" });
    const tileset = this.map.addTilesetImage("OLDtileset32x32", "tiles2");

    this.floorLayer = this.map.createLayer("floorLayer", tileset, 0, 0);
    this.floorLayer.setCollisionByProperty({ collides: false });
    this.worldLayer = this.map.createLayer("WorldLayer", tileset, 0, 0);
    this.worldLayer.setCollisionByProperty({ collides: true });
    
     
    this.wallmounts = this.map.createLayer('wallmounts', tileset, 0, 0);
    this.wallmounts.setCollisionByProperty({ collides: false });

    this.player = this.physics.add.sprite(90, 90, "playerSprite");

    // this.selectLayer(this.floorLayer);
    // this.selectLayer(this.worldLayer);
    this.physics.add.collider(this.player, this.worldLayer);

    // this.input.keyboard.on('keydown-ONE', event => {
    //     this.selectLayer(this.worldLayer);
    // });
    
    // this.input.keyboard.on('keydown-TWO', event => {
    //     this.selectLayer(this.floorLayer);
    // });
    
    // this.input.keyboard.on('keydown-THREE', event => {
    //     this.selectLayer(this.wallmounts);
    // });
    
    // this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);




 //  Our player animations, turning, walking left and walking right.
 this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("playerSprite", {
      start: 9,
      end: 12,
    }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "playerSprite", frame: 1 }],

    frameRate: -1,
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("playerSprite", {
      start: 2,
      end: 5,
    }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "attackRight",
    frames: this.anims.generateFrameNumbers("playerSprite", {
      start: 14,
      end: 19,
    }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "attackLeft",
    frames: this.anims.generateFrameNumbers("playerSprite", {
      start: 20,
      end: 25,
    }),
    frameRate: 10,
    repeat: -1,
  });


  this.cursors = this.input.keyboard.createCursorKeys();
  this.keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D,
    k: Phaser.Input.Keyboard.KeyCodes.K,
    p: Phaser.Input.Keyboard.KeyCodes.P,
    l: Phaser.Input.Keyboard.KeyCodes.L,

   });
    

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      k: Phaser.Input.Keyboard.KeyCodes.K,
      p: Phaser.Input.Keyboard.KeyCodes.P,
      l: Phaser.Input.Keyboard.KeyCodes.L,
    });

    //camera controls, follows player and zooms in
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    this.cameras.main.setZoom(1); // 1 is the default zoom level
    // Set boundaries for the camera
    //   this.cameras.main.setBounds(0, 0, 1600, 1200);k
    this.cameras.main.setBounds(-500, -500, 2300, 2100);
}
  update(){
    
    if (this.gameOver) {
        return;
      }
  
      if (this.keys.a.isDown || this.cursors.left.isDown) {
        this.player.setVelocityX(-160);
  
        this.player.anims.play("left", true);
      } else if (this.keys.d.isDown || this.cursors.right.isDown) {
        this.player.setVelocityX(160);
  
        this.player.anims.play("right", true);
      } else {
        this.player.setVelocityX(0);
  
        this.player.anims.play("turn", true);
      }
      if (this.keys.w.isDown || this.cursors.up.isDown) {
        this.player.setVelocityY(-160);
  
        this.player.anims.play("left", true);
      } else if (this.keys.s.isDown || this.cursors.down.isDown) {
        this.player.setVelocityY(160);
  
        this.player.anims.play("right", true);
      } else {
        this.player.setVelocityY(0);
      }
  
      if (this.keys.k.isDown) {
        this.player.anims.play("attackLeft", true);
        //   this.player.on('animationupdate-attackRight', function (animation, frame) {
        //     console.log(frame.frame.name);
      }
      if (this.keys.p.isDown) {
        console.log("p is pressed, pausing game");
        this.scene.pause("LEVEL1");
        this.scene.launch("PAUSE");
      }


     
      
  } 

  selectLayer(layer) {
    // You can use map.setLayer(...) or map.layer. Either can be set using a layer name, layer
    // index, StaticTilemapLayer/DynamicTilemapLayer.
    this.map.setLayer(layer);

    this.floorLayer.alpha = 0.5;
    this.worldLayer.alpha = 0.5;
    this.wallmounts.alpha = 0.5;

    layer.alpha = 1;
}


};

    if (this.keys.k.isDown) {
      this.player.anims.play("attackLeft", true);
      //   this.player.on('animationupdate-attackRight', function (animation, frame) {
      //     console.log(frame.frame.name);
    }
    if (this.keys.p.isDown) {
      console.log("p is pressed, pausing game");
      this.scene.pause("LEVEL1");
      this.scene.launch("PAUSE");
    }
  
