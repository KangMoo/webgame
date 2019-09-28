// Phaser3 example game
// preloader and loading bar

var Preloader = new Phaser.Class({

	Extends: Phaser.Scene,

	initialize:

	function Preloader ()
	{
		// note: the pack:{files[]} acts like a pre-preloader
		// this eliminates the need for an extra "boot" scene just to preload the loadingbar images
		Phaser.Scene.call(this, {
			key: 'preloader',
			pack: {
				files: [
					{ type: 'image', key: 'loadingbar_bg', url: 'img/loadingbar_bg.png' },
					{ type: 'image', key: 'loadingbar_fill', url: 'img/loadingbar_fill.png' }
				]
			}
		});
	},
	
	setPreloadSprite: function (sprite)
	{
		this.preloadSprite = { sprite: sprite, width: sprite.width, height: sprite.height };

		//sprite.crop(this.preloadSprite.rect);
		sprite.visible = true;

		// set callback for loading progress updates
		this.load.on('progress', this.onProgress, this );
		this.load.on('fileprogress', this.onFileProgress, this );
	},
	
	onProgress: function (value) {

		if (this.preloadSprite)
		{
			// calculate width based on value=0.0 .. 1.0
			var w = Math.floor(this.preloadSprite.width * value);
			console.log('onProgress: value=' + value + " w=" + w);
			
			// sprite.frame.width cannot be zero
			//w = (w <= 0 ? 1 : w);
			
			// set width of sprite			
			this.preloadSprite.sprite.frame.width    = (w <= 0 ? 1 : w);
			this.preloadSprite.sprite.frame.cutWidth = w;

			// update screen
			this.preloadSprite.sprite.frame.updateUVs();
		}
	},
	
	onFileProgress: function (file) {
		console.log('onFileProgress: file.key=' + file.key);
	},

	preload: function ()
	{
		// setup the loading bar
		// note: images are available during preload because of the pack-property in the constructor
		this.loadingbar_bg   = this.add.sprite(400, 300, "loadingbar_bg");
		this.loadingbar_fill = this.add.sprite(400, 300, "loadingbar_fill");
		this.setPreloadSprite(this.loadingbar_fill);
		
		// now load images, audio etc.
		// sprites, note: see free sprite atlas creation tool here https://www.leshylabs.com/apps/sstool/
		this.load.atlas('sprite','src/sprites/spritesheet.png','src/sprites/sprites.json')
		this.load.atlas('sprites', 'img/spritearray.png', 'img/spritearray.json');
		
		// font
		this.load.bitmapFont('fontwhite', 'img/fontwhite.png', 'img/fontwhite.xml');
		
		// sound effects
		//this.load.audio('bg', [this.p('audio/bg.mp3'),this.p('audio/bg.ogg')]);
		this.load.audio('coin', ['snd/coin.mp3', 'snd/coin.ogg']);
		this.load.audio('bomb', ['snd/expl.mp3', 'snd/expl.ogg']);
		this.load.audio('btn',  ['snd/btn.mp3', 'snd/btn.ogg']);
		
		// !! TESTING !! load the same image 500 times just to slow down the load and test the loading bar
		//for (var i = 0; i < 500; i++) {
		//	this.load.image('testloading'+i, 'img/spritearray.png');
		//};
		// !! TESTING !!


		
	},

	create: function ()
	{

		this.anims.create({
			key: 'explosion',
			frames:[
				{ key: 'sprite',frame:'animation_explosion1'},
				{ key: 'sprite',frame:'animation_explosion2'},
				{ key: 'sprite',frame:'animation_explosion3'},
				{ key: 'sprite',frame:'animation_explosion4'},
				{ key: 'sprite',frame:'animation_explosion5'},
				{ key: 'sprite',frame:'animation_explosion6'},
				{ key: 'sprite',frame:'animation_explosion7'},
				{ key: 'sprite',frame:'animation_explosion8'},
				{ key: 'sprite',frame:'animation_explosion9'},
				{ key: 'sprite',frame:'animation_explosion10'}
			],
			frameRate: 15,
			hideOnComplete: true,
			repeat: 0
		});

		this.anims.create({
			key:'bomb',
			frames:[
				{ key:'sprite',frame:'bomb1'},
				{ key:'sprite',frame:'bomb2'},
				{ key:'sprite',frame:'bomb3'}
			],
			frameRate:5,
			yoyo:true,
			hideOnComplete: true,
			repeat:4
		});

		this.anims.create({
			key:'die',
			frames:[
				{ key : 'sprite',frame:'animation_die1'},
				{ key : 'sprite',frame:'animation_die2'},
				{ key : 'sprite',frame:'animation_die3'},
				{ key : 'sprite',frame:'animation_die4'},
				{ key : 'sprite',frame:'animation_die5'},
				{ key : 'sprite',frame:'animation_die6'},
			],
			frameRate: 5,
			hideOnComplete: true,
			repeat: 0
		});

		//flame_animation
		this.anims.create({
			key:'flame_center',
			frames:[
				{key:'sprite',frame:'flame1'},
				{key:'sprite',frame:'flame2'}
			],
			frameRate: 2,
			hideOnComplete: true,
			repeat: 0
		});
		this.anims.create({
			key:'flame_h',
			frames:[
				{key:'sprite',frame:'flame1_horizontal'},
				{key:'sprite',frame:'flame2_horizontal'}
			],
			frameRate: 2,
			hideOnComplete: true,
			repeat: 0
		});
		this.anims.create({
			key:'flame_v',
			frames:[
				{key:'sprite',frame:'flame1_vertical'},
				{key:'sprite',frame:'flame2_vertical'}
			],
			frameRate: 2,
			hideOnComplete: true,
			repeat: 0
		});
		this.anims.create({
			key:'flame_left',
			frames:[
				{key:'sprite',frame:'flame1_left'},
				{key:'sprite',frame:'flame2_left'}
			],
			frameRate: 2,
			hideOnComplete: true,
			repeat: 0
		});
		this.anims.create({
			key:'flame_right',
			frames:[
				{key:'sprite',frame:'flame1_right'},
				{key:'sprite',frame:'flame2_right'}
			],
			frameRate: 2,
			hideOnComplete: true,
			repeat: 0
		});
		this.anims.create({
			key:'flame_up',
			frames:[
				{key:'sprite',frame:'flame1_up'},
				{key:'sprite',frame:'flame2_up'}
			],
			frameRate: 2,
			hideOnComplete: true,
			repeat: 0
		});
		this.anims.create({
			key:'flame_down',
			frames:[
				{key:'sprite',frame:'flame1_down'},
				{key:'sprite',frame:'flame2_down'}
			],
			frameRate: 2,
			hideOnComplete: true,
			repeat: 0
		});

		//player_anmiation
		
		this.anims.create({
			key:'player_down_w',
			frames:[
				{key:'sprite',frame:'player_37'}
			],
			frameRate: 1,
			repeat: 0
		});
		this.anims.create({
			key:'player_left_w',
			frames:[
				{key:'sprite',frame:'player_42'}
			],
			frameRate: 1,
			repeat: 0
		});
		this.anims.create({
			key:'player_right_w',
			frames:[
				{key:'sprite',frame:'player_46'}
			],
			frameRate: 1,
			repeat: 0
		});
		this.anims.create({
			key:'player_up_w',
			frames:[
				{key:'sprite',frame:'player_50'}
			],
			frameRate: 1,
			repeat: 0
		});
		this.anims.create({
			key:'player_down_walk_w',
			frames:[
				{key:'sprite',frame:'player_39'},
				{key:'sprite',frame:'player_40'},
				{key:'sprite',frame:'player_41'}
			],
			frameRate: 5,
			yoyo:true,
			repeat: -1
		});
		this.anims.create({
			key:'player_left_walk_w',
			frames:[
				{key:'sprite',frame:'player_44'},
				{key:'sprite',frame:'player_42'},
				{key:'sprite',frame:'player_45'}
			],
			frameRate: 5,
			yoyo:true,
			repeat: -1
		});
		this.anims.create({
			key:'player_right_walk_w',
			frames:[
				{key:'sprite',frame:'player_48'},
				{key:'sprite',frame:'player_46'},
				{key:'sprite',frame:'player_49'}
			],
			frameRate: 5,
			yoyo:true,
			repeat: -1
		});
		this.anims.create({
			key:'player_up_walk_w',
			frames:[
				{key:'sprite',frame:'player_52'},
				{key:'sprite',frame:'player_53'},
				{key:'sprite',frame:'player_54'}
			],
			frameRate: 5,
			yoyo:true,
			repeat: -1
		});
		
		// enemyPlayer
		this.anims.create({
			key:'player_down_r',
			frames:[
				{key:'sprite',frame:'player_19'}
			],
			frameRate: 1,
			repeat: 0
		});
		this.anims.create({
			key:'player_left_r',
			frames:[
				{key:'sprite',frame:'player_24'}
			],
			frameRate: 1,
			repeat: 0
		});
		this.anims.create({
			key:'player_right_r',
			frames:[
				{key:'sprite',frame:'player_28'}
			],
			frameRate: 1,
			repeat: 0
		});
		this.anims.create({
			key:'player_up_r',
			frames:[
				{key:'sprite',frame:'player_32'}
			],
			frameRate: 1,
			repeat: 0
		});
		this.anims.create({
			key:'player_down_walk_r',
			frames:[
				{key:'sprite',frame:'player_21'},
				{key:'sprite',frame:'player_22'},
				{key:'sprite',frame:'player_23'}
			],
			frameRate: 5,
			yoyo:true,
			repeat: -1
		});
		this.anims.create({
			key:'player_left_walk_r',
			frames:[
				{key:'sprite',frame:'player_26'},
				{key:'sprite',frame:'player_24'},
				{key:'sprite',frame:'player_27'}
			],
			frameRate: 5,
			yoyo:true,
			repeat: -1
		});
		this.anims.create({
			key:'player_right_walk_r',
			frames:[
				{key:'sprite',frame:'player_30'},
				{key:'sprite',frame:'player_28'},
				{key:'sprite',frame:'player_31'}
			],
			frameRate: 5,
			yoyo:true,
			repeat: -1
		});
		this.anims.create({
			key:'player_up_walk_r',
			frames:[
				{key:'sprite',frame:'player_34'},
				{key:'sprite',frame:'player_35'},
				{key:'sprite',frame:'player_36'}
			],
			frameRate: 5,
			yoyo:true,
			repeat: -1
		});
		
		

		// also create animations
		this.anims.create({
				key: 'cointurn',
				frames: [
					{ key: 'sprites', frame: 'coin1' },
					{ key: 'sprites', frame: 'coin2' },
					{ key: 'sprites', frame: 'coin3' },
					{ key: 'sprites', frame: 'coin4' },
					{ key: 'sprites', frame: 'coin5' },
					{ key: 'sprites', frame: 'coin6' },
					{ key: 'sprites', frame: 'coin7' },
					{ key: 'sprites', frame: 'coin8' }
				],
				frameRate: 15,
				repeat: -1
			});
			
		console.log('Preloader scene is ready, now start the actual game and never return to this scene');

		// dispose loader bar images
		this.loadingbar_bg.destroy();
		this.loadingbar_fill.destroy();
		this.preloadSprite = null;

		// start actual game
		this.scene.start('mainmenu');
	}
});
