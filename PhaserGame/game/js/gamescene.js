

// Phaser3 example game
// main game scene

var DIR_UP = 1;
var DIR_DOWN = 2;
var DIR_LEFT = 4;
var DIR_RIGHT = 8;

var STATE_IDLE = 1;
var STATE_WALK = 2;

var GameScene = new Phaser.Class({

	Extends: Phaser.Scene,

	initialize:

		function GameScene() {
			Phaser.Scene.call(this, { key: 'gamescene' });
		},


	preload: function () {

	},

	create: function () {
		this.playerInfo = {
			dir:DIR_DOWN,
			state:STATE_IDLE,
			bombcount:1,
			bombpow:1,
			speed:3,
			ability:0
		};
		
		this.player = this.physics.add.sprite(100, 200, 'sprite');
		this.player.anims.load();
		this.player.setCollideWorldBounds(true);
		// add player sprite
		this.dude = this.physics.add.image(400, 200, 'sprites', 'dude');
		//this.dude = this.add.sprite(400, 200, 'sprites', 'dude');

		this.dude.setCollideWorldBounds(true);

		// add random coins and bombs
		this.gameitems = this.physics.add.group();

		for (var i = 0; i < 20; i++) {
			// parameters
			var x = Phaser.Math.RND.between(0, 800);
			var y = Phaser.Math.RND.between(0, 600);
			var objtype = (i < 5 ? TYPE_BOMB : TYPE_COIN);

			// create custom sprite object
			var newobj = new CollectObj(this, x, y, 'sprites', objtype);

			this.gameitems.add(newobj);
		}

		var temp = this.add.sprite(300, 300, 'sprite').setScale(1);
		temp.anims.load('bomb');
		temp.anims.play('bomb');



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

		// sound effects
		this.sfxcoin = this.sound.add('coin');
		this.sfxbomb = this.sound.add('bomb');

		// set up arcade physics, using `physics` requires "physics:{default: 'arcade'" when starting "new Phaser.Game(.."
		this.physics.add.overlap(this.dude, this.gameitems, this.doOverlapItem, null, this);

		// player input
		this.cursors = this.input.keyboard.createCursorKeys();

		// quit to menu button
		this.btnquit = this.addButton(760, 40, 'sprites', this.doBack, this, 'btn_close_hl', 'btn_close', 'btn_close_hl', 'btn_close');
	},

	update: function (time, delta) {
		this.player.setVelocity(0);
		if (this.cursors.up.isDown)    this.movePlayer(DIR_UP);
		else if (this.cursors.down.isDown)  this.movePlayer(DIR_DOWN);
		if (this.cursors.left.isDown)  this.movePlayer(DIR_LEFT);
		else if (this.cursors.right.isDown) this.movePlayer(DIR_RIGHT);
	},

	movePlayer: function (dir) {

		if (dir == DIR_UP)    
		{
			this.player.y -= 2;
			this.playerInfo.dir=DIR_UP;
		}
		else if (dir == DIR_DOWN)  
		{
			this.player.y += 2;
			this.playerInfo.dir=DIR_DOWN;
		}
		if (dir == DIR_LEFT)  
		{
			this.player.x -= 2;
			this.playerInfo.dir=DIR_LEFT;
		}
		else if (dir == DIR_RIGHT) 
		{
			this.player.x += 2;
			this.playerInfo.dir=DIR_RIGHT;
		}

		//var test = this.scene.getBounds();
		// check limits
		if (this.player.y < 0)   this.player.y = 0;
		if (this.player.y > 600) this.player.y = 600;
		if (this.player.x < 0)   this.player.x = 0;
		if (this.player.x > 800) this.player.x = 800;
	},

	explode: function (x, y, scale) {

		var temp = this.add.sprite(x, y, 'sprite').setScale(1).anims.load('die');
		temp.play('die');
		temp = this.add.sprite(x, y, 'sprite').setScale(1).anims.load('explosion');
		temp.play('explosion');

	},

	doBack: function () {
		this.explode(Phaser.Math.RND.between(0, 800), Phaser.Math.RND.between(0, 800), Phaser.Math.RND.between(1, 5));
		console.log('gamescene doBack was called!');
		//this.scene.start('mainmenu');
	}


});
