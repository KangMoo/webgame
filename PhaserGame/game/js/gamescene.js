

// Phaser3 example game
// main game scene

const DIR_UP = 1;
const DIR_DOWN = 2;
const DIR_LEFT = 4;
const DIR_RIGHT = 8;

const STATE_IDLE = 1;
const STATE_WALK = 2;
const STATE_DIE = 4;

const TILE_SIZE_X = 50;
const TILE_SIZE_Y = 45;

var GameScene = new Phaser.Class({

	Extends: Phaser.Scene,

	initialize:

		function GameScene() {
			Phaser.Scene.call(this, { key: 'gamescene' });
		},

	init: function (settings) {
		this.roomnum = settings.roomnum;
		this.startPoint = settings;
		console.log('settings:', settings)
	},
	preload: function () {
	},

	create: function () {
		
		//map setting
		this.fTiles = this.add.group();
		this.cTiles = this.physics.add.group({ immovable: true });
		this.bTiles = this.physics.add.group({ immovable: true });
		this.setTileMap();
		console.log(this.IS_TOUCH);

		// add player sprite
		this.player = this.physics.add.sprite(this.startPoint.sx,this.startPoint.sy, 'sprite');
		//this.player = this.physics.add.sprite(TILE_SIZE_X + TILE_SIZE_X / 2, TILE_SIZE_Y, 'sprite');
		
		this.player.setSize(30, 25).setOffset(15, 70);
		this.player.Info = {
			dir: DIR_DOWN,
			state: STATE_IDLE,
			bombcount: 1,
			bombpow: 1,
			speed: 2,
			ability: 0,
			x: 0, y: 0
		};
		this.player.setCollideWorldBounds(true);

		this.opponent = this.physics.add.sprite(0,0,'sprite');
		this.opponent.setSize(30, 25).setOffset(15, 70);
		this.opponent.Info = {
			dir: DIR_DOWN,
			state: STATE_IDLE,
			bombcount: 1,
			bombpow: 1,
			speed: 2,
			ability: 0,
			x: 0, y: 0
		};
		// add player sprite

		var bgm = this.sound.add('bgm_gamescene');
		bgm.loop = true;
		bgm.volume = 0.5;
		bgm.play();
		// add random coins and bombs
		this.gameitems = this.physics.add.group();
		this.flames = this.physics.add.group({ immovable: true });

		this.bombs = this.physics.add.group({ immovable: true });
		this.bombs_e = this.physics.add.group({ immovable: true });
		
		this.physics.add.collider(this.player, [this.cTiles, this.bTiles, this.bombs, this.bombs_e],this.ovlPlayerTile,null,this);
		// coin particles
		var sparks = this.add.particles('sprites');
		this.coinspark = sparks.createEmitter({
			frame: ['sparkle1', 'sparkle2'],
			quantity: 15,
			scale: { start: 1.0, end: 0 },
			on: false,
			speed: 200,
			lifespan: 500
		});

		/*
		// bomb explosion particles (small)
		var expl1 = this.add.particles('sprites');
		this.bombexpl1 = expl1.createEmitter({
			frame: ['bombexpl1'],
			frequency: 100,
			quantity: 10,
			scale: { start: 1.0, end: 0 },
			speed: { min: -1000, max: 1000 },
			lifespan: 800,
			on: false
		});

		// bomb explosion particles (big)
		var expl2 = this.add.particles('sprites');
		this.bombexpl2 = expl2.createEmitter({
			frame: ['bombexpl2'],
			quantity: 3,
			scale: { start: 2.0, end: 0 },
			frequency: 500,
			on: false,
			speed: { min: -200, max: 200 },
			lifespan: 1000
		});

		*/

		this.physics.add.overlap(this.player, this.gameitems, this.playerGetItem, null, this);

		this.physics.add.overlap(this.bombs, [this.bombs,this.bombs_e], this.ovlBombs, null, this);
		this.physics.add.overlap(this.bombs_e, [this.bombs,this.bombs_e], this.ovlBombs, null, this);
		
		//
		this.physics.add.overlap(this.flames, this.player, this.ovlFlamePlayer, null, this);
		this.physics.add.overlap(this.flames, this.bTiles, this.ovlFlameBTile, null, this);
		this.physics.add.overlap(this.flames, this.gameitems, this.ovlFlameItem, null, this);

		this.physics.add.overlap(this.flames, [this.bombs,this.bombs_e], this.ovlFlameBomb, null, this);
		// player input
		this.cursors = this.input.keyboard.createCursorKeys();
		this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

		// quit to menu button
		this.btnquit = this.addButton(760, 40, 'sprites', this.doBack, this, 'btn_close_hl', 'btn_close', 'btn_close_hl', 'btn_close');

		// secket connection ~
		this.socket = this.game.socket;

		if (this.socket.firstSetting.gameScene == false) {
			this.socket.firstSetting.gameScene = true;
			this.socket.on('setBomb',(bombInfo)=>{
				var x = bombInfo.x;
				var y = bombInfo.y;
				var pow = bombInfo.pow;
				this.setBomb(x,y,pow);
			})
			//this.socket.on('playerUpdate',(frame,x,y)=>{
			//	
			//	this.opponent. = frame;
			//	this.opponent.x = x;
			//	this.opponent.y = y;
			//})
		}
		// ~ secket connection
		//test~
		console.log(this.player);
		//~test
	},

	update: function (time, delta) {
		//if(this.input.pointer1.isDown)
		//{
		//	console.log(this.input.pointer1);
		//}
		this.player.setVelocity(0);
		if (this.player.Info.state != STATE_DIE) {
			if(this.cursors.up.isDown ||
				this.cursors.down.isDown ||
				this.cursors.left.isDown ||
				this.cursors.right.isDown)
				{
					if (this.cursors.up.isDown) this.movePlayer(DIR_UP);
					else if (this.cursors.down.isDown) this.movePlayer(DIR_DOWN);
					if (this.cursors.left.isDown) this.movePlayer(DIR_LEFT);
					else if (this.cursors.right.isDown) this.movePlayer(DIR_RIGHT);
				}
			else this.playerStop(this.player.Info.dir);
			if (Phaser.Input.Keyboard.JustDown(this.spacebar) && this.player.Info.bombcount > this.bombs.children.size) {
				//this.chkCanBeBomb();
				var bombInfo = {
					x:this.player.Info.x,
					y: this.player.Info.y,
					pow: this.player.Info.pow
				}
				this.socket.emit('setBomb',this.roomnum,bombInfo);
				//this.setBomb(this.player.Info.x, this.player.Info.y, this.player.Info.pow);
			}
		}

		this.gameitems.setDepth(1);
		this.bombs.setDepth(2);
		this.bombs_e.setDepth(2);
		this.flames.setDepth(3);
		this.player.setDepth(4);
		
		
		//this.socket.emit('playerUpdate',this.roomnum,this.player.currentAnim.key,this.player.x,this.player.y);
		this.playerInfoUpdate();
	},

	movePlayer: function (dir) {

		if (dir == DIR_UP) {
			this.player.setVelocityY(-this.player.Info.speed * 50);
			this.player.Info.dir = DIR_UP;
			this.player.anims.play('player_up_walk_w', true);
		}
		else if (dir == DIR_DOWN) {
			this.player.setVelocityY(this.player.Info.speed * 50);
			this.player.Info.dir = DIR_DOWN;
			this.player.anims.play('player_down_walk_w', true);
		}
		else if (dir == DIR_LEFT) {
			this.player.setVelocityX(-this.player.Info.speed * 50);
			this.player.Info.dir = DIR_LEFT;
			this.player.anims.play('player_left_walk_w', true);
		}
		else if (dir == DIR_RIGHT) {
			this.player.setVelocityX(this.player.Info.speed * 50);
			this.player.Info.dir = DIR_RIGHT;
			this.player.anims.play('player_right_walk_w', true);
		}

		this.player.Info.state = STATE_WALK;
		//var test = this.scene.getBounds();
		// check limits
		if (this.player.y < 0) this.player.y = 0;
		if (this.player.y > 600) this.player.y = 600;
		if (this.player.x < 0) this.player.x = 0;
		if (this.player.x > 800) this.player.x = 800;
	},
	playerStop: function (dir) {
		if (this.player.Info.state == STATE_DIE) {

			return;
		}

		if (dir == DIR_UP) {
			this.player.anims.play('player_up_w', true);
		}
		else if (dir == DIR_DOWN) {
			this.player.anims.play('player_down_w', true);
		}
		if (dir == DIR_LEFT) {
			this.player.anims.play('player_left_w', true);
		}
		else if (dir == DIR_RIGHT) {
			this.player.anims.play('player_right_w', true);
		}
		this.player.Info.state = STATE_IDLE;
	},

	explode: function (x, y, power) {
		//flamesize calculate
		this.sound.play('explosion');
		
		x = parseInt(x / TILE_SIZE_X) * TILE_SIZE_X;
		y = parseInt(y / TILE_SIZE_Y) * TILE_SIZE_Y;


		
		this.makeArm(x, y, power, DIR_UP);
		this.makeArm(x, y, power, DIR_LEFT);
		this.makeArm(x, y, power, DIR_RIGHT);
		this.makeArm(x, y, power, DIR_DOWN);
		this.makeFlame(x + TILE_SIZE_X / 2, y + TILE_SIZE_X / 2, 'flame_center');
	},
	makeArm: function (x, y, pow, dir) {

		for (var i = 1; i <= pow; i++) {
			var px = x;
			var py = y;
			if (dir == DIR_UP) {
				py -= i * TILE_SIZE_Y;
				var chk = this.flametileChk(px, py);
				if (chk == 3) break;
				if (chk == 1) {
					this.makeFlame(px + TILE_SIZE_X / 2, py + TILE_SIZE_Y / 2, 'flame_up');
					break;
				}
				else {
					if (i == pow) {
						this.makeFlame(px + TILE_SIZE_X / 2, py + TILE_SIZE_Y / 2, 'flame_up');
					}
					else {
						this.makeFlame(px + TILE_SIZE_X / 2, py + TILE_SIZE_Y / 2, 'flame_v');
					}
				}
			}
			else if (dir === DIR_LEFT) {
				px -= i * TILE_SIZE_X;
				var chk = this.flametileChk(px, py);
				if (chk == 3) break;
				if (chk == 1) {
					this.makeFlame(px + TILE_SIZE_X / 2, py + TILE_SIZE_Y / 2, 'flame_left');
					break;
				}
				else {
					if (i == pow) {
						this.makeFlame(px + TILE_SIZE_X / 2, py + TILE_SIZE_Y / 2, 'flame_left');
					}
					else {
						this.makeFlame(px + TILE_SIZE_X / 2, py + TILE_SIZE_Y / 2, 'flame_h');
					}
				}

			}
			else if (dir == DIR_RIGHT) {
				px += i * TILE_SIZE_X;
				var chk = this.flametileChk(px, py);
				if (chk == 3) break;
				if (chk == 1) {
					this.makeFlame(px + TILE_SIZE_X / 2, py + TILE_SIZE_Y / 2, 'flame_right');
					break;
				}
				else {

					if (i == pow) {
						this.makeFlame(px + TILE_SIZE_X / 2, py + TILE_SIZE_Y / 2, 'flame_right');
					}
					else {
						this.makeFlame(px + TILE_SIZE_X / 2, py + TILE_SIZE_Y / 2, 'flame_h');
					}
				}
			}
			else if (dir == DIR_DOWN) {
				py += i * TILE_SIZE_Y;
				var chk = this.flametileChk(px, py);
				if (chk == 3) break;
				if (chk == 1) {
					this.makeFlame(px + TILE_SIZE_X / 2, py + TILE_SIZE_Y / 2, 'flame_down');
					break;
				}
				else {
					if (i == pow) {
						this.makeFlame(px + TILE_SIZE_X / 2, py + TILE_SIZE_Y / 2, 'flame_down');
					}
					else {
						this.makeFlame(px + TILE_SIZE_X / 2, py + TILE_SIZE_Y / 2, 'flame_v');
					}
				}
			}
		}
	},

	makeFlame: function (x, y, flamedir) {


		var flame = this.physics.add.sprite(x, y, 'sprite').setScale(1);
		flame.setSize(TILE_SIZE_X - 2, TILE_SIZE_Y - 2).setOffset(1, 1);
		//flame.bornTime = this.time.now;
		flame.on('animationcomplete', (cuuurentAnim, currentFrmae, sprite) => {
			this.tweens.add({
				targets: flame,
				duration: 100,
				alpha: 0,

				onComplete: () => { 
					flame.destroy(); }
			});
		});
		flame.anims.load(flamedir);
		flame.anims.play(flamedir);

		this.flames.add(flame);
	},
	flametileChk: function (x, y) {
		return this.TILES[parseInt(x / TILE_SIZE_X)][parseInt(y / TILE_SIZE_Y)]
	},
	doBack: function () {

		//this.explode(Phaser.Math.RND.between(0, 800), Phaser.Math.RND.between(0, 800), 1);//Phaser.Math.RND.between(1, 5));
		this.playerDie();
		console.log('gamescene doBack was called!');
		//this.scene.start('mainmenu');
	},
	setBomb: function (x, y, pow) {
		
		this.sound.play('setBomb');
		x = parseInt(x / TILE_SIZE_X) * TILE_SIZE_X + TILE_SIZE_X / 2;
		y = parseInt(y / TILE_SIZE_Y) * TILE_SIZE_Y + TILE_SIZE_Y / 2;

		var bomb = this.physics.add.sprite(x, y, 'sprite').setScale(1);
		bomb.power = this.player.Info.bombpow;
		bomb.name = this.time.now;
		bomb.on('animationcomplete', (cuuurentAnim, currentFrmae, sprite) => {
			this.explode(sprite.x, sprite.y, bomb.power);
			bomb.destroy();
		});
		bomb.setSize(TILE_SIZE_X, TILE_SIZE_Y).setOffset(0, 0);
		bomb.anims.load('bomb');
		bomb.anims.play('bomb');


		this.bombs.add(bomb);
		this.player.setDepth(1);
	},

	ovlBombs: function (b1, b2) {
		b2.destroy();
	},

	playerInfoUpdate: function () {
		this.player.Info.x = this.player.x;
		this.player.Info.y = this.player.y + 28;
	},
	ovlFlamePlayer(flame,player)
	{
		this.playerDie();
	},
	ovlPlayerTile(player,tile)
	{
		/*
		var dircount = 0;
		if(this.cursors.up.isDown) dircount ++;
		if(this.cursors.down.isDown) dircount ++;
		if(this.cursors.left.isDown) dircount ++;
		if(this.cursors.right.isDown) dircount ++;
		
		var pTilePos = {
			x:parseInt(player.x/TILE_SIZE_X)*TILE_SIZE_X + TILE_SIZE_X/2,
			y:parseInt(player.y/TILE_SIZE_Y)*TILE_SIZE_Y + TILE_SIZE_Y/2
		}
		var velocity = {};
		velocity.x = pTilePos.x < player.x ? -1 : 1;
		velocity.y = pTilePos.y < player.y ? -1 : 1;
		
		if(dircount != 1) return;
		if(player.Info.dir == DIR_LEFT ||player.Info.dir == DIR_RIGHT)
		{
			player.setVelocityY(velocity.y*150);
		}
		else
		{
			player.setVelocityX(velocity.x*150);
		}
		*/
	},
	playerDie: function () {
		
		if (this.player.Info.state == STATE_DIE) return;
		
		this.player.Info.state = STATE_DIE;
		this.sound.play('die');
		this.player.anims.play('die');
		this.player.on('animationcomplete', (cuuurentAnim, currentFrmae, sprite) => {
			this.gameOver();
		});
	},
	ovlFlameBTile: function (flame, tile) {
		if(this.TILES[parseInt(tile.x / TILE_SIZE_X)][parseInt(tile.y / TILE_SIZE_Y)] == 0)
			return;
		
		
			this.tweens.add({
				targets: tile,
				duration: 450,
				alpha: 0,

				onComplete: () => { 
					
					if(this.TILES[parseInt(tile.x / TILE_SIZE_X)][parseInt(tile.y / TILE_SIZE_Y)] != 0)
						{
							//this.itemRndAdd(tile.x, tile.y);
						}

					this.TILES[parseInt(tile.x / TILE_SIZE_X)][parseInt(tile.y / TILE_SIZE_Y)] = 0;
					tile.destroy();
					}
			});
		
	},
	itemRndAdd: function (x, y) {

		x = parseInt(x / TILE_SIZE_X) * TILE_SIZE_X + TILE_SIZE_X / 2;
		y = parseInt(y / TILE_SIZE_Y) * TILE_SIZE_Y + TILE_SIZE_Y / 2;


		var item = Phaser.Math.RND.between(0, 12);
		var newobj;
		if (item == 0) {
			newobj = new CollectObj(this, x, y, 'sprite', TYPE_BOMBUP);
		}
		else if (item == 1) {
			newobj = new CollectObj(this, x, y, 'sprite', TYPE_SPEEDUP);
		}
		else if (item == 2) {
			newobj = new CollectObj(this, x, y, 'sprite', TYPE_POWERUP);
		}
		else {
			return;
		}
		newobj.setSize(TILE_SIZE_X - 2, TILE_SIZE_Y - 2).setOffset(1, 1);
		this.gameitems.add(newobj);
	},
	
	playerGetItem: function (player, item) {
		this.sound.add('getItem').volume = 0.3;
		this.sound.play('getItem');
		
		if (item.data.values.type == TYPE_BOMBUP) {
			if (this.player.Info.bombcount < 8);
			this.player.Info.bombcount++;
		}
		else if (item.data.values.type == TYPE_SPEEDUP) {
			if (this.player.Info.speed < 8)
				this.player.Info.speed++;
		}
		else if (item.data.values.type == TYPE_POWERUP) {
			if (this.player.Info.bombpow < 5)
				this.player.Info.bombpow++;
		}
		item.destroy();
	},
	ovlFlameItem: function (flame, item) {
		if(flame.endAnimation == false) return;
		item.destroy();
	},
	ovlFlameBomb:function(flame,bomb)
	{
		var x = bomb.x;
		var y = bomb.y;
		var pow = bomb.power;
		bomb.destroy();
		this.explode(x,y,pow);
	},
	gameOver: function () {
		// add game over text
		var txt = this.add.bitmapText(400, 300, 'fontwhite', 'Game over!');
		txt.setOrigin(0.5).setCenterAlign();

		// set gameover text as transparant, upside down and larger
		txt.setAlpha(0.0);
		txt.setAngle(180);
		txt.setScale(4.0, 4.0);

		// add twirl/zoom animation to gameover text
		var tw = this.tweens.add(
			{
				targets: txt,
				scaleX: 1.0,
				scaleY: 1.0,
				alpha: 1.0,
				angle: 0,
				ease: 'Power3',
				duration: 1000, // duration of animation; higher=slower
				delay: 500      // wait 500 ms before starting
			}
		);
	},
	setTileMap: function () {
		this.TILES = [
			[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			[3, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 3],
			[3, 0, 3, 1, 3, 1, 3, 1, 3, 1, 3, 0, 3],
			[3, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 3],
			[3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3],
			[3, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 3],
			[3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 0, 3],
			[3, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 3],
			[3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3],
			[3, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 3],
			[3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3],
			[3, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 3],
			[3, 0, 3, 1, 3, 1, 3, 1, 3, 1, 3, 0, 3],
			[3, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 3],
			[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
		];

		for (var i = 0; i < 15; i++) {
			for (var j = 0; j < 13; j++) {

				this.temp = this.physics.add.image(i * TILE_SIZE_X + TILE_SIZE_X / 2, j * TILE_SIZE_Y + TILE_SIZE_Y / 2, 'sprite', 'tile_env2_floor').setOffset(0, 0);
				this.temp.setSize(TILE_SIZE_X, TILE_SIZE_Y);
				this.fTiles.add(this.temp);
				if (this.TILES[i][j] == 0) {

				}
				else if (this.TILES[i][j] == 1) {
					this.temp = this.physics.add.image(i * TILE_SIZE_X + TILE_SIZE_X / 2, j * TILE_SIZE_Y + TILE_SIZE_Y / 2, 'sprite', 'tile_env2_block').setOffset(0, 0);
					this.temp.setSize(TILE_SIZE_X, TILE_SIZE_Y, true);
					this.bTiles.add(this.temp);
				}
				else if (this.TILES[i][j] == 3) {
					this.temp = this.physics.add.image(i * TILE_SIZE_X + TILE_SIZE_X / 2, j * TILE_SIZE_Y + TILE_SIZE_Y / 2, 'sprite', 'tile_env2_wall').setOffset(0, 0);
					this.temp.setSize(TILE_SIZE_X, TILE_SIZE_Y, true);
					this.cTiles.add(this.temp);
				}
			}
		}
	},
	enemyPlayerRender: function (enemyPlayerInfo) {

	}


});
