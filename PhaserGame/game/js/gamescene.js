

// Phaser3 example game
// main game scene

var DIR_UP = 1;
var DIR_DOWN = 2;
var DIR_LEFT = 4;
var DIR_RIGHT = 8;

var STATE_IDLE = 1;
var STATE_WALK = 2;
var STATE_DIE = 4;

var GameScene = new Phaser.Class({

	Extends: Phaser.Scene,

	initialize:

		function GameScene() {
			Phaser.Scene.call(this, { key: 'gamescene' });
		},


	preload: function () {
	},

	create: function () {

		//map setting
		this.fTiles = this.add.group();
		this.cTiles = this.physics.add.group({immovable:true});
		this.bTiles = this.physics.add.group({immovable:true});
		this.setTileMap();


		this.playerInfo = {
			dir:DIR_DOWN,
			state:STATE_IDLE,
			bombcount:1,
			bombpow:1,
			speed:3,
			ability:0,
			x:0,y:0
		};
		
		this.player = this.physics.add.sprite(50, 50, 'sprite');
		this.player.anims.load();
		this.player.setSize(30,25).setOffset(15,64);
		//this.player.setSize(50,45).setOffset(5,49);
		this.player.setCollideWorldBounds(true);
		
		
		

		// add player sprite
		this.dude = this.physics.add.image(400, 200, 'sprites', 'dude');
		//this.dude = this.add.sprite(400, 200, 'sprites', 'dude');
		

		//this.dude.setCollideWorldBounds(true);

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


		this.bombs = this.physics.add.group({immovable:true});

		this.physics.add.collider(this.player,this.bombs);
		this.physics.add.collider(this.player,[this.cTiles,this.bTiles,this.bombs]);

		this.setBomb(300,300,1);
		this.setBomb(350,345,1);
		this.setBomb(400,300,1);
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

		this.physics.add.overlap(this.bombs, this.bombs, this.overlapBombs, null, this);
		// player input
		this.cursors = this.input.keyboard.createCursorKeys();

		// quit to menu button
		this.btnquit = this.addButton(760, 40, 'sprites', this.doBack, this, 'btn_close_hl', 'btn_close', 'btn_close_hl', 'btn_close');
	},

	update: function (time, delta) {
		//this.bombs.setVelocity(0);
		this.player.setVelocity(0);
		if (this.cursors.up.isDown)    this.movePlayer(DIR_UP);
		else if (this.cursors.down.isDown)  this.movePlayer(DIR_DOWN);
		else if (this.cursors.left.isDown)  this.movePlayer(DIR_LEFT);
		else if (this.cursors.right.isDown) this.movePlayer(DIR_RIGHT);
		else this.playerStop(this.playerInfo.dir);

		if(this.cursors.space.isDown)
		{
			this.setBomb(this.playerInfo.x,this.playerInfo.y,this.playerInfo.pow);
		}

		this.playerInfoUpdate();
	},

	movePlayer: function (dir) {

		if (dir == DIR_UP)    
		{
			this.player.setVelocityY(-100);
			this.playerInfo.dir=DIR_UP;
			this.player.anims.play('player_up_walk_w',true);
		}
		else if (dir == DIR_DOWN)  
		{
			this.player.setVelocityY(100);
			this.playerInfo.dir=DIR_DOWN;
			this.player.anims.play('player_down_walk_w',true);
		}
		if (dir == DIR_LEFT)  
		{
			this.player.setVelocityX(-100);
			this.playerInfo.dir=DIR_LEFT;
			this.player.anims.play('player_left_walk_w',true);
		}
		else if (dir == DIR_RIGHT) 
		{
			this.player.setVelocityX(100);
			this.playerInfo.dir=DIR_RIGHT;
			this.player.anims.play('player_right_walk_w',true);
		}

		this.playerInfo.state=STATE_WALK;
		//var test = this.scene.getBounds();
		// check limits
		if (this.player.y < 0)   this.player.y = 0;
		if (this.player.y > 600) this.player.y = 600;
		if (this.player.x < 0)   this.player.x = 0;
		if (this.player.x > 800) this.player.x = 800;
	},
	playerStop: function(dir){
		if (dir == DIR_UP)    
		{
			this.player.anims.play('player_up_w',true);
		}
		else if (dir == DIR_DOWN)  
		{
			this.player.anims.play('player_down_w',true);
		}
		if (dir == DIR_LEFT)  
		{
			this.player.anims.play('player_left_w',true);
		}
		else if (dir == DIR_RIGHT) 
		{
			this.player.anims.play('player_right_w',true);
		}
		this.playerInfo.state=STATE_IDLE;
	},
	//explode: function (x, y, scale) {
	//	var temp = this.add.sprite(x, y, 'sprite').setScale(1).anims.load('die');
	//	temp.play('die');
	//	temp = this.add.sprite(x, y, 'sprite').setScale(1).anims.load('explosion');
	//	temp.play('explosion');
	//},
	explode: function (x,y,scale) {
		
		var temp = this.add.sprite(x, y, 'sprite').setScale(1).anims.load('die');
		temp.play('die');
		temp = this.add.sprite(x, y, 'sprite').setScale(1).anims.load('explosion');
		temp.play('explosion');
	},

	doBack: function () {
		this.explode(Phaser.Math.RND.between(0, 800), Phaser.Math.RND.between(0, 800), Phaser.Math.RND.between(1, 5));
		console.log('gamescene doBack was called!');
		//this.scene.start('mainmenu');
	},
	setBomb:function(x,y,pow){
		console.log(`${x},${y}`);
		x = parseInt(x/50)*50 + 25;
		y = parseInt(y/45)*45 + 45/2;


		this.temp = this.physics.add.sprite(x, y, 'sprite').setScale(1);
		//this.temp.on('animationcomplete',this.explode,this);
		this.temp.on('animationcomplete',(cuuurentAnim, currentFrmae, sprite)=>{
			console.log(sprite);
			this.explode(sprite.x,sprite.y,1);
			sprite.body.destroy();
		});
		this.temp.anims.load('bomb');
		this.temp.anims.play('bomb');
		this.temp.setSize(50,45).setOffset(0,0);

		this.bombs.add(this.temp);
		this.player.setDepth(1);
	},

	overlapBombs:function(b1,b2)
	{
		b2.destroy();
	},

	playerInfoUpdate:function(){
		this.playerInfo.x = this.player.x;
		this.playerInfo.y = this.player.y+28;
	},

	setTileMap:function()
	{
		const level = [
			[3,3,3,3,3,3,3,3,3,3,3,3,3],
			[3,0,0,0,1,0,1,1,1,0,0,0,3],
			[3,0,3,1,3,1,3,1,3,1,3,0,3],
			[3,0,1,1,1,1,1,1,0,1,1,0,3],
			[3,1,3,1,3,1,3,1,3,1,3,1,3],
			[3,1,1,0,1,1,1,1,0,1,1,1,3],
			[3,1,3,1,3,1,3,1,3,1,3,0,3],
			[3,1,1,1,0,1,0,1,1,0,1,1,3],
			[3,1,3,1,3,1,3,1,3,1,3,1,3],
			[3,0,1,1,0,1,1,1,0,1,1,1,3],
			[3,1,3,1,3,1,3,1,3,1,3,1,3],
			[3,0,1,0,1,1,1,0,1,1,1,0,3],
			[3,0,3,1,3,1,3,1,3,1,3,0,3],
			[3,0,0,0,1,1,0,1,1,0,0,0,3],
			[3,3,3,3,3,3,3,3,3,3,3,3,3]
		];

		for(var i =0 ; i<15;i++)
		{
			for(var j = 0 ; j<13; j++)
			{
				
				this.temp = this.physics.add.image(i*50+25, j*45+23, 'sprite', 'tile_env2_floor').setOffset(0,0);
				this.temp.setSize(50,45);
				this.fTiles.add(this.temp);
				if(level[i][j] == 0)
				{
					
				}
				else if(level[i][j] ==1)
				{
					this.temp = this.physics.add.image(i*50+25, j*45+23, 'sprite', 'tile_env2_block').setOffset(0,0);
					this.temp.setSize(50,45,true);
					this.bTiles.add(this.temp);
				}
				else if(level[i][j] ==3)
				{
					this.temp = this.physics.add.image(i*50+25, j*45+23, 'sprite', 'tile_env2_wall').setOffset(0,0);
					this.temp.setSize(50,45,true);
					this.cTiles.add(this.temp);
				}
			}
		}
	}

});
