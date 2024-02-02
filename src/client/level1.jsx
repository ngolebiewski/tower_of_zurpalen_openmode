// level1.jsx

import { CST } from "./loading_menu/CST.jsx";
import eventsCenter from "./EventsCenter.jsx"; // this allows communication between scenes
import { PauseScene } from "./pauseScene.jsx";
import { Level2 } from "./level2.jsx";
import { store } from "./store"; // brings in redux store

export class Level1 extends Phaser.Scene {
  constructor() {
    super({
      key: CST.SCENES.LEVEL1,
    });
    this.player;
    this.chest1;
    this.chest2;
    this.chest3;
    this.chest4;
    this.chest5;
    this.chest6;
    this.chest7;
    this.cursors;
    this.monster;
    this.monster1;
    this.monster2;
    this.gameOver = false;
    this.door;
    this.collisionCalled = false;

    //character stats to be loaded from pause screen
    this.characterHealth = 1;
    this.characterMaxHealth = 1;
    this.characterArmor = 1;
    this.characterAttack = 1;
    this.characterSpeed = 1;

  }

  init() {}

// ############################## PRELOAD ################################################  
  preload ()
  {
    const state = store.getState() // this brings in the state from redux
    console.log(state, "in preload")

      this.load.image('floor', '/assets/levelAssets/floor.png');
      this.load.image('tiles', '/assets/levelAssets/25x25Tiles.png');
      this.load.tilemapTiledJSON('map', '/assets/levelAssets/level1.json');
  
      // the three classes sprites load here
      switch(state.userCharacter.character.character_class){
      case "warrior":
          console.log('loading the warrior');
          this.load.spritesheet('playerSprite', 'assets/levelAssets/knight78x60.png', { frameWidth: 78, frameHeight: 60 });
          break;
      case "mage":
          console.log('loading the mage');
          this.load.spritesheet('playerSprite', 'assets/levelAssets/mage78x60.png', { frameWidth: 78, frameHeight: 60 });
          break;
      case "rogue":
          console.log('loading the rogue');
          this.load.spritesheet('playerSprite', 'assets/levelAssets/rogue78x60.png', { frameWidth: 78, frameHeight: 60 });
          break;
      };

    // ================= MONSTER STUFF ==================  
      this.load.atlas( "skeleton", "assets/levelAssets/skeleton_spritesheet.png", "assets/levelAssets/skeleton_sprites.json");
      
    // ================ GOLD, DOORS, GEAR STUFF =============  
      this.load.spritesheet('chest', 'assets/levelAssets/chest_sprite.png', {frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('goldCoin', 'assets/levelAssets/goldCoin.png', {frameWidth: 40, frameHeight: 40});
      this.load.spritesheet('door','assets/levelAssets/door50x100.png', {frameWidth: 50, frameHeight: 100}) ;
      this.load.spritesheet('gear', 'assets/gear50x50.png', { frameWidth: 50, frameHeight: 50 });

    // ========== SOUND STUFF ======================
      this.load.audio('walking', 'assets/audio/soundeffects/steps1.mp3')
      this.load.audio('walking2', 'assets/audio/soundeffects/steps2.mp3')
      this.load.audio('swoosh', 'assets/audio/soundeffects/swoosh.mp3')
      this.load.audio('zurpalen', 'assets/audio/soundeffects/zurpalen.mp3')
  }
 // #########################  CREATE ############################################### 
  create ()
  {
// ==============  World Building Section ===================================

    this.scene.run('pauseScene'); // used to keep the pause scene updated with stats causes pausescene to run in the background
    this.scene.launch("PAUSE"); // starts the pause screen and loads stats

    function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }

    //  A simple background for our game
    this.add.image(800, 600, "floor");

    // loads the map and makes the walls solid
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("25x25Tiles", "tiles");
    const WorldLayer = map.createLayer("WorldLayer", tileset, 0, 0);
    WorldLayer.setCollisionByProperty({ collides: true });

    //  Input Events
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

// ===================== SOUND STUFF ================================
this.isSound1PlayedLast = true;
    this.lastSoundTimestamp = 0; 
    
    this.swoosh = this.sound.add('swoosh', {
      volume:0.2
    });

    this.zurpalen = this.sound.add('zurpalen', {
      volume:0.8,
      loop:true
    });

    this.walkingSound = this.sound.add('walking', {
      volume:0.5,
      loop:true
    });
    this.walkingSound2 = this.sound.add('walking2', {
      volume:0.5,
      loop:true
    })

    this.zurpalen.play();

    // ===================== PLAYER STUFF  ===========================================

    // The player and its settings
    this.player = this.physics.add.sprite(90, 90, "playerSprite");
    this.player.setSize(60, 54);

    // keep the player on the map
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, WorldLayer);

    // eventsCenter.on('updateStats', 'health', 'maxHealth','armor','attack','speed') => {
    eventsCenter.on('updateStats', (health, maxHealth,armor,attack,speed) => {
      console.log('on main screen updating stats ');
      this.characterHealth = health;
      this.characterMaxHealth = maxHealth;
      this.characterArmor = armor;
      this.characterAttack = attack;
      this.characterSpeed = speed;
      console.log('character speed is: ', this.characterSpeed);
  }, this);

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

    // ================== MONSTER STUFF ===========================  
    this.monster = this.physics.add.sprite(300, 300, "skeleton" , "sprite9");
    this.monster1= this.physics.add.sprite(956, 419, "skeleton" , "sprite9");
    this.monster2= this.physics.add.sprite(995, 973, "skeleton" , "sprite9");
    this.monster.setSize(60, 54);

    //keeps monster in bounds
    this.physics.add.collider(this.monster, WorldLayer);
    this.physics.add.collider(this.player, this.monster);
    this.monster.setImmovable(true);
    this.monster.setCollideWorldBounds(true);
    this.monster.body.onCollide = (true);

    //monster animaiton movements
    this.anims.create({
      key: "SkeletonIdle",
      frames: this.anims.generateFrameNames("skeleton", { frames: [ "sprite10", "sprite19", "sprite20", "sprite30", "sprite36" ], }),
      frameRate: 5,
      repeat: -1,
    });
    
    this.anims.create({
      key: "SkeletonLeft",
      frames: this.anims.generateFrameNames("skeleton", { frames: [ "sprite1", "sprite2", "sprite3", "sprite4", "sprite5", "sprite6", "sprite7", "sprite8" ], }),
      frameRate: 10,
      repeat: 0,
    });
    
    this.anims.create({
      key: "SkeletonRight",
      frames: this.anims.generateFrameNames("skeleton", { frames: [ "sprite11", "sprite12", "sprite13", "sprite14", "sprite15", "sprite16", "sprite17", "sprite18" ], }),
      frameRate: 10,
      repeat: 0,
    });
    
    this.anims.create({
      key: "SkeletonAttack",
      frames: this.anims.generateFrameNames("skeleton", { frames: [ "sprite40", "sprite41", "sprite43", "sprite49", "sprite50", "sprite51", "sprite52" ], }),
      frameRate: 10,
      repeat: 0,
    });

    this.anims.create({
      key: "SkeletonDie",
      frames: this.anims.generateFrameNames("skeleton", { frames: [ "sprite57", "sprite58", "sprite59", "sprite60", "sprite64" ], }),
      frameRate: 10,
      repeat: 0,
    });

   // play monster animations
    this.monster.anims.play('SkeletonIdle', 'SkeletonLeft', 'SkeletonRight', 'SkeletonAttack', 'SkeletonDie', true);
    this.monster1.anims.play('SkeletonIdle', 'SkeletonLeft', 'SkeletonRight', 'SkeletonAttack', 'SkeletonDie', true);
    this.monster2.anims.play('SkeletonIdle', 'SkeletonLeft', 'SkeletonRight', 'SkeletonAttack', 'SkeletonDie', true);
  

  
// =================== GEAR, CHESTS, GOLD STUFF ====================================================

       // ********************* dropping gear ********************************
    eventsCenter.on('droppingGear', (droppedGearNumber)=>{
      console.log ('dropped gear number is: ', droppedGearNumber);
      let xdroplocation = getRandomInt(50)+50;
        if(xdroplocation %2 ==0){ xdroplocation = xdroplocation * -1}
        xdroplocation += this.player.x;
      let ydroplocation = getRandomInt(50)+50;
        if(ydroplocation %2 ==0){ ydroplocation = ydroplocation * -1}
        ydroplocation += this.player.y;
        console.log('player location is: ', this.player.x, ' ', this.player.y);
        console.log('x and y are: ', xdroplocation, ' ', ydroplocation);
      let droppedGear = this.physics.add.sprite(xdroplocation, ydroplocation, 'gear' , droppedGearNumber-1);
      this.physics.add.collider(this.player, droppedGear, () => {
        this.collectItem(droppedGear, 'lootGear', droppedGearNumber);
      }, null, this); 
      //maybe add a timer here to make the item disappear after a short time
    },this)

      this.collectItem = (item, lootItem, gearNumber) => {
        item.destroy();        //item is removed from the scene
        //item is added to inventory
        if(lootItem === 'lootGold'){
          const amountOfGold=1+ Math.floor(Math.random()*5);
          console.log('Character Gold should be increasing by ', amountOfGold);
          console.log('transmitting from level1 to the pause screen the gold');
          eventsCenter.emit('updateGold', amountOfGold);

        }else if (lootItem === 'lootGear') {
          console.log('the item picked up is a ', item);
          console.log('transmitting from level1 to the pause screen the item');
          eventsCenter.emit('lootedItem', gearNumber);
        }
      };

       // chest functions broken into two functions to avoid unwanted collisions (gold in walls, etc) 

       const openChestTopRight = (chest) => {
          chest.setFrame(1);
          const xlocation=chest.x+30;
          const ylocation=chest.y+30;
            const gold = this.physics.add.sprite(xlocation,ylocation,'goldCoin');
            this.physics.add.collider(this.player, gold, () => {
                this.collectItem(gold, 'lootGold');
              }, null, this)
        // gear loot code here        
            const randomLootNumber = getRandomInt(10)+1;
            console.log('random loot number is: ', randomLootNumber);
              if (randomLootNumber>6){ // ******************************* there are 6 possible loot items in the gear database *****
                // no extra loot found
              }else{
                // randomLoot = randomLootNumber;
                const gearLoot = this.physics.add.sprite(xlocation+20, ylocation+20, 'gear' , randomLootNumber-1);
                this.physics.add.collider(this.player, gearLoot, () => {
                  this.collectItem(gearLoot, 'lootGear', randomLootNumber);
                }, null, this);          
              };

          // ************** code to disable the chest here *******************
          switch(chest){
            case this.chest1: chest1Collider.destroy();
              break;
            case this.chest2: chest2Collider.destroy();
              break;
            case this.chest3: chest3Collider.destroy();
              break;
            case this.chest4: chest4Collider.destroy();
              break;
            case this.chest5: chest5Collider.destroy();
              break;
            case this.chest6: chest6Collider.destroy();
              break;
            case this.chest7: chest7Collider.destroy();
              break;
          }
      };   

      const openChestBottomLeft = (chest) => {
        chest.setFrame(1);
        const xlocation=chest.x-30;
        const ylocation=chest.y-30;
          const gold = this.physics.add.sprite(xlocation,ylocation,'goldCoin');
          this.physics.add.collider(this.player, gold, () => {
                  console.log('Player collided with gold coin');
                  this.collectItem(gold, 'lootGold');
                }, null, this);
          const randomLootNumber = getRandomInt(10)+1;
          console.log('random loot number is: ', randomLootNumber);
            if (randomLootNumber>6){ // ******************************* there are 6 possible loot items in the gear database *****
              // no extra loot found
            }else{
              const gearLoot = this.physics.add.sprite(xlocation-20, ylocation-20, 'gear' , randomLootNumber-1);
              this.physics.add.collider(this.player, gearLoot, () => {
              this.collectItem(gearLoot, 'lootGear', randomLootNumber);
              }, null, this);          
            };
          switch(chest){
            case this.chest1: chest1Collider.destroy();
              break;
            case this.chest2: chest2Collider.destroy();
              break;
            case this.chest3: chest3Collider.destroy();
              break;
            case this.chest4: chest4Collider.destroy();
              break;
            case this.chest5: chest5Collider.destroy();
              break;
            case this.chest6: chest6Collider.destroy();
              break;
            case this.chest7: chest7Collider.destroy();
              break;
          }
      };   

      this.chest1 = this.physics.add.staticSprite(300, 40, 'chest', 2);
      this.chest2 = this.physics.add.staticSprite(1185, 71, 'chest', 2);
      this.chest3 = this.physics.add.staticSprite(80, 448, 'chest', 2);
      this.chest4 = this.physics.add.staticSprite(319, 833, 'chest', 2);
      this.chest5 = this.physics.add.staticSprite(790, 966, 'chest', 2);
      this.chest6 = this.physics.add.staticSprite(1345, 565, 'chest', 2);

      const chest1Collider = this.physics.add.collider(this.player, this.chest1, ()=>openChestTopRight(this.chest1));
      const chest2Collider = this.physics.add.collider(this.player, this.chest2, ()=>openChestBottomLeft(this.chest2));
      const chest3Collider = this.physics.add.collider(this.player, this.chest3, ()=>openChestBottomLeft(this.chest3));
      const chest4Collider = this.physics.add.collider(this.player, this.chest4, ()=>openChestBottomLeft(this.chest4));
      const chest5Collider = this.physics.add.collider(this.player, this.chest5, ()=>openChestBottomLeft(this.chest5));
      const chest6Collider = this.physics.add.collider(this.player, this.chest6, ()=>openChestBottomLeft(this.chest6));

    // ========================= DOOR  to next level =========================================

      // this.door = this.physics.add.staticSprite(700,75, 'door', 1); // dev location
      this.door = this.physics.add.staticSprite(1570,75, 'door', 1); 
      this.physics.add.collider(this.player, this.door, () => {
        WorldLayer.destroy();
        eventsCenter.emit('levelChange', 2);
        this.zurpalen.stop();
        this.scene.start(CST.SCENES.LEVEL2);
        this.scene.destroy(Level1);
      }, null, this)
  
    // ======================camera controls, follows player and zooms in ==================================
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    this.cameras.main.setZoom(1); // 1 is the default zoom level
    // Set boundaries for the camera
    //   this.cameras.main.setBounds(0, 0, 1600, 1200);k
    this.cameras.main.setBounds(-500, -500, 2300, 2100);
    eventsCenter.on(
      "gameOver",
      (bool) => {
        console.log("someone quit the game");
        this.gameOver = bool;
      },this);
  }
// ############################### UPDATE ###############################################
  update() {
    if (this.gameOver) {
      return;
    }

// ===================  KEY CONTROLS ==============================================
    if (this.keys.a.isDown || this.cursors.left.isDown) {
      // this.player.setVelocityX(-160);
      this.player.setVelocityX(-10* this.characterSpeed);
      this.player.anims.play("left", true);
    } else if (this.keys.d.isDown || this.cursors.right.isDown) {
      this.player.setVelocityX(10* this.characterSpeed);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn", true);
    }
    if (this.keys.w.isDown || this.cursors.up.isDown) {
      this.player.setVelocityY(-10* this.characterSpeed);
      this.player.anims.play("left", true);
    } else if (this.keys.s.isDown || this.cursors.down.isDown) {
      this.player.setVelocityY(10* this.characterSpeed);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityY(0);
    }
    if (this.keys.k.isDown) {
      this.player.anims.play("attackLeft", true);
      //   this.player.on('animationupdate-attackRight', function (animation, frame) {
    }
    if (this.keys.p.isDown) {
      this.scene.pause("LEVEL1");
      this.scene.launch("PAUSE");
    }
    if (this.keys.l.isDown) {
      console.log(
        "The player is at these coordinates",
        `x: ${this.player.x}`,
        `y: ${this.player.y}`
      );
    }

  // ===========================  SOUNDS STUFF ==================================================
    //code alternates walking sound effects to avoid overlap
    if((this.keys.a.isDown || this.cursors.left.isDown) && this.time.now - this.lastSoundTimestamp > 500){
      if(this.isSound1PlayedLast) {
        this.walkingSound.play();
      } else {
        this.walkingSound2.play();
      }
      this.isSound1PlayedLast = !this.isSound1PlayedLast;
      this.lastSoundTimestamp = this.time.now;
    }
    if((this.keys.d.isDown || this.cursors.right.isDown) && this.time.now - this.lastSoundTimestamp > 500){
      if(this.isSound1PlayedLast) {
        this.walkingSound.play();
      } else {       
        this.walkingSound2.play();
      }
      this.isSound1PlayedLast = !this.isSound1PlayedLast;
      this.lastSoundTimestamp = this.time.now;
    }
    if((this.keys.w.isDown || this.cursors.up.isDown) && this.time.now - this.lastSoundTimestamp > 500){
      if(this.isSound1PlayedLast) {    
        this.walkingSound.play();
      } else {
        this.walkingSound2.play();
      }
      this.isSound1PlayedLast = !this.isSound1PlayedLast;
      this.lastSoundTimestamp = this.time.now;
    }
    if((this.keys.s.isDown || this.cursors.down.isDown) && this.time.now - this.lastSoundTimestamp > 500){
      if(this.isSound1PlayedLast) {  
        this.walkingSound.play();
      } else {
        this.walkingSound2.play();
      }
      this.isSound1PlayedLast = !this.isSound1PlayedLast;
      this.lastSoundTimestamp = this.time.now;
    }
    if(this.keys.a.isDown || this.keys.d.isDown || this.keys.w.isDown || this.keys.s.isDown || this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown){
      this.isMoving = true;
    } else {
      this.isMoving = false;
      setTimeout(() => {
        if(this.player.body.velocity.y === 0 && !this.isMoving){
          
          this.walkingSound.stop();
          this.walkingSound2.stop();
        }
      }); 
    }
   if(this.keys.k.isDown){
    this.swoosh.play();
   }
   
   // ========================  MONSTER STUFF ============================================
    this.physics.add.overlap(this.player, this.monster, () => {
      // Decrease the player's health
      this.characterHealth -= this.monster.damage;
      // Check if the player's health is 0 or less
      if (this.characterHealth <= 0) {
        console.log ('player is dead');
      }
      // Apply a damage effect, like flashing the player sprite
      this.player.setTint(0xff0000); // Set the player sprite to red
      // Use a timer to remove the tint after a short delay
      this.timeDamage = this.time.addEvent({
        delay: 500,                // delay in ms
        callback: () => {
          this.timeDamage = true;
          this.player.clearTint(); // Remove the tint
        },
        callbackScope: this,
        loop: false
      });
    }, null, this);

    let followDistance = 150;
    let speed = 50;
    let monsters = [this.monster, this.monster1, this.monster2];
    monsters.forEach(monster => {
      // Seek AI movement
      let directionX = this.player.x - monster.x;
      let directionY = this.player.y - monster.y;
  
      // direction to unit vector
      let magnitude = Math.sqrt(directionX * directionX + directionY * directionY);
  
      // Check if the distance is less than a certain value
      if (magnitude < followDistance) {
        directionX /= magnitude;
        directionY /= magnitude;
  
        // monsters velocity
        monster.body.velocity.x = directionX * speed;
        monster.body.velocity.y = directionY * speed;

        // Monster attack
        if ( Phaser.Math.Distance.Between(monster.x, monster.y, this.player.x, this.player.y) < 75
        ) { 
          monster.damage = 10;
          monster.body.velocity.x = 0;
          monster.anims.play("SkeletonAttack", true);
        }
      } else {
        // If the player is too far, stop the monster
        monster.body.velocity.x = 0;
        monster.body.velocity.y = 0;
      }
    });
  };
}