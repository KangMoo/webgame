

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


	preload: function () {
	},

	create: function () {

		//map setting
		this.fTiles = this.add.group();
		this.cTiles = this.physics.add.group({immovable:true});
		this.bTiles = this.physics.add.group({immovable:true});
		this.setTileMap();

		

		// add player sprite
		this.player = this.physics.add.sprite(TILE_SIZE_X+TILE_SIZE_X/2, TILE_SIZE_Y, 'sprite');
		this.player.anims.load();
		this.player.setSize(30,25).setOffset(15,64);
		this.player.Info = {dir:DIR_DOWN,
			state:STATE_IDLE,
			bombcount:1,
			bombpow:1,
			speed:3,
			ability:0,
			x:0,y:0};
		//this.player.setSize(50,45).setOffset(5,49);
		this.player.setCollideWorldBounds(true);
		console.log(this);

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

		this.flames = this.physics.add.group({immovable:true});

		this.bombs = this.physics.add.group({immovable:true});
		this.bombs_e = this.physics.add.group({immovable:true});
		
		//this.physics.add.collider(this.player,this.bombs);
		//this.physics.add.collider(this.player,this.bombs_e);
		this.physics.add.collider(this.player,[this.cTiles,this.bTiles,this.bombs,this.bombs_e]);
		
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
		this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
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
		else this.playerStop(this.player.Info.dir);

		if(Phaser.Input.Keyboard.JustDown(this.spacebar)&& this.player.Info.bombcount > this.bombs.children.size)
		{
			//this.chkCanBeBomb();
			this.setBomb(this.player.Info.x,this.player.Info.y,this.player.Info.pow);
		}
		
		this.playerInfoUpdate();
	},

	movePlayer: function (dir) {

		if (dir == DIR_UP)    
		{
			this.player.setVelocityY(-100);
			this.player.Info.dir=DIR_UP;
			this.player.anims.play('player_up_walk_w',true);
		}
		else if (dir == DIR_DOWN)  
		{
			this.player.setVelocityY(100);
			this.player.Info.dir=DIR_DOWN;
			this.player.anims.play('player_down_walk_w',true);
		}
		if (dir == DIR_LEFT)  
		{
			this.player.setVelocityX(-100);
			this.player.Info.dir=DIR_LEFT;
			this.player.anims.play('player_left_walk_w',true);
		}
		else if (dir == DIR_RIGHT) 
		{
			this.player.setVelocityX(100);
			this.player.Info.dir=DIR_RIGHT;
			this.player.anims.play('player_right_walk_w',true);
		}

		this.player.Info.state=STATE_WALK;
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
		this.player.Info.state=STATE_IDLE;
	},

	explode: function (x,y,power) {
		//flamesize calculate
		
		x = parseInt(x/TILE_SIZE_X)*TILE_SIZE_X;
		y = parseInt(y/TILE_SIZE_Y)*TILE_SIZE_Y;
		
		console.log('explode',x,y);
		this.makeFlame(x+TILE_SIZE_X/2,y+TILE_SIZE_X/2,'flame_center');
		//makeArm
		this.makeArm(x,y,power,DIR_UP);
		this.makeArm(x,y,power,DIR_LEFT);
		this.makeArm(x,y,power,DIR_RIGHT);
		this.makeArm(x,y,power,DIR_DOWN);

		/*
		for(var i=-power;i<=power;i++)
		{
			if(i==0) continue;
			var posx = x + TILE_SIZE_X*i;
			var posy = y;
			if(this.flametileChk(posx,posy) == 3) continue;
			if(i==-power)
				this.makeFlame(posx,posy,'flame_left');
			else if(i==power)
				this.makeFlame(posx,posy,'flame_right');
			else
			{
				if(this.flametileChk(posx,posy) == 1)
				{
					if(i<0) {
						this.makeFlame(posx,posy,'flame_left');
						i =1;
						continue;
					}
					if(i>0) {
						break;
					}
				}
				this.makeFlame(posx,posy,'flame_h');
			}
				
		}
		for(var i=-power;i<=power;i++)
		{
			if(i==0) continue;
			var posx = x;
			var posy = y +TILE_SIZE_Y*i;
			if(i==-power)
			this.makeFlame(posx,posy,'flame_up');
			else if(i==power)
			this.makeFlame(posx,posy,'flame_down');
			else
			this.makeFlame(posx,posy,'flame_v');
		}
		*/

		this.player.setDepth(1);
		//var temp = this.add.sprite(x, y, 'sprite').setScale(1).anims.load('die');
		//temp.play('die');
		//var temp = this.add.sprite(x, y, 'sprite').setScale(1).anims.load('explosion');
		//temp.play('explosion');
		
	},
	makeArm:function(x,y,pow,dir){
		
		for(var i = 1; i<=pow;i++)
		{
			var px = x;
			var py = y;
			if(dir == DIR_UP){
				py -= i*TILE_SIZE_Y;
				var chk = this.flametileChk(px,py);
				if(chk == 3) break;
				if(chk==1)
				{
					this.makeFlame(px+TILE_SIZE_X/2,py+TILE_SIZE_Y/2,'flame_up');
					break;
				}
				if(i ==pow)
				{
					this.makeFlame(px+TILE_SIZE_X/2,py+TILE_SIZE_Y/2,'flame_up');
					break;
				}
				this.makeFlame(px+TILE_SIZE_X/2,py+TILE_SIZE_Y/2,'flame_h');
			}
			else if(dir=== DIR_LEFT){
				px -= i*TILE_SIZE_X;
				var chk = this.flametileChk(px,py);
				if(chk == 3) break;
				if(chk==1)
				{
					this.makeFlame(px+TILE_SIZE_X/2,py+TILE_SIZE_Y/2,'flame_left');
					break;
				}
				if(i ==pow)
				{
					this.makeFlame(px+TILE_SIZE_X/2,py+TILE_SIZE_Y/2,'flame_left');
					break;
				}
				this.makeFlame(px+TILE_SIZE_X/2,py+TILE_SIZE_Y/2,'flame_v');
			}
			else if(dir== DIR_RIGHT){
				px +=i*TILE_SIZE_X;
				var chk = this.flametileChk(px,py);
				if(chk == 3) break;
				if(chk==1)
				{
					this.makeFlame(px+TILE_SIZE_X/2,py+TILE_SIZE_Y/2,'flame_right');
					break;
				}
				if(i ==pow)
				{
					this.makeFlame(px+TILE_SIZE_X/2,py+TILE_SIZE_Y/2,'flame_right');
					break;
				}
				this.makeFlame(px+TILE_SIZE_X/2,py+TILE_SIZE_Y/2,'flame_v');
			}
			else if(dir == DIR_DOWN){
				py += i*TILE_SIZE_Y;
				var chk = this.flametileChk(px,py);
				if(chk == 3) break;
				if(chk==1)
				{
					this.makeFlame(px+TILE_SIZE_X/2,py+TILE_SIZE_Y/2,'flame_down');
					break;
				}
				if(i ==pow)
				{
					this.makeFlame(px+TILE_SIZE_X/2,py+TILE_SIZE_Y/2,'flame_down');
					break;
				}	
				this.makeFlame(px+TILE_SIZE_X/2,py+TILE_SIZE_Y/2,'flame_h');
			}
		}
	},

	makeFlame:function(x,y,flamedir){

		var flame = this.physics.add.sprite(x, y, 'sprite').setScale(1);	
		flame.setSize(TILE_SIZE_X-2,TILE_SIZE_Y-2).setOffset(1,1);
		flame.createdTime = this.time.now;
		flame.on('animationcomplete',(cuuurentAnim, currentFrmae, sprite)=>{
			this.tweens.add({
				targets: flame,
				duration: 100,
				alpha: 0,
				onComplete:()=>{flame.destroy();}
			});
		});
		flame.anims.load(flamedir);
		flame.anims.play(flamedir);
		
		this.flames.add(flame);
	},
	flametileChk:function(x,y){
		console.log('flametileChk:');
		console.log(x,y);
		console.log(parseInt(x/TILE_SIZE_X),parseInt(y/TILE_SIZE_Y));
		return this.TILES[parseInt(x/TILE_SIZE_X)][parseInt(y/TILE_SIZE_Y)]
	},
	doBack: function () {
		
		this.explode(Phaser.Math.RND.between(0, 800), Phaser.Math.RND.between(0, 800), 1);//Phaser.Math.RND.between(1, 5));
		console.log('gamescene doBack was called!');
		//this.scene.start('mainmenu');
	},
	setBomb:function(x,y,pow){
		x = parseInt(x/TILE_SIZE_X)*TILE_SIZE_X + TILE_SIZE_X/2;
		y = parseInt(y/TILE_SIZE_Y)*TILE_SIZE_Y + TILE_SIZE_Y/2;

		var temp = this.physics.add.sprite(x, y, 'sprite').setScale(1);
		temp.power=this.player.Info.bombpow;
		temp.name=this.time.now;
		temp.on('animationcomplete',(cuuurentAnim, currentFrmae, sprite)=>{
			
			this.explode(sprite.x,sprite.y,temp.power);
			temp.destroy();
		});
		temp.setSize(TILE_SIZE_X,TILE_SIZE_Y).setOffset(0,0);
		temp.anims.load('bomb');
		temp.anims.play('bomb');
		

		this.bombs.add(temp);
		this.player.setDepth(1);
	},
	
	overlapBombs:function(b1,b2)
	{
		b2.destroy();
	},

	playerInfoUpdate:function(){
		this.player.Info.x = this.player.x;
		this.player.Info.y = this.player.y+28;
	},

	setTileMap:function()
	{
		this.TILES = [
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
				
				this.temp = this.physics.add.image(i*TILE_SIZE_X+TILE_SIZE_X/2, j*TILE_SIZE_Y+TILE_SIZE_Y/2, 'sprite', 'tile_env2_floor').setOffset(0,0);
				this.temp.setSize(TILE_SIZE_X,TILE_SIZE_Y);
				this.fTiles.add(this.temp);
				if(this.TILES[i][j] == 0)
				{
					
				}
				else if(this.TILES[i][j] ==1)
				{
					this.temp = this.physics.add.image(i*TILE_SIZE_X+TILE_SIZE_X/2, j*TILE_SIZE_Y+TILE_SIZE_Y/2, 'sprite', 'tile_env2_block').setOffset(0,0);
					this.temp.setSize(TILE_SIZE_X,TILE_SIZE_Y,true);
					this.bTiles.add(this.temp);
				}
				else if(this.TILES[i][j] ==3)
				{
					this.temp = this.physics.add.image(i*TILE_SIZE_X+TILE_SIZE_X/2, j*TILE_SIZE_Y+TILE_SIZE_Y/2, 'sprite', 'tile_env2_wall').setOffset(0,0);
					this.temp.setSize(TILE_SIZE_X,TILE_SIZE_Y,true);
					this.cTiles.add(this.temp);
				}
			}
		}
	},
	enemyPlayerRender:function(enemyPlayerInfo){

	}


});
