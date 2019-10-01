
var TYPE_SPEEDUP = 1;
var TYPE_BOMBUP  = 2;
var TYPE_POWERUP = 4;

class CollectObj extends Phaser.Physics.Arcade.Sprite {

	constructor(scene, x, y, texture, objtype) {
		
		super(scene, x, y, texture)

		// add to scene
		scene.add.existing(this)
		scene.physics.add.existing(this)

		this.setData("type", objtype);
		this.setData("bornTime", scene.time.now);

		if (objtype == TYPE_BOMBUP) {
			this.setFrame('item_bomb');
		} else if(objtype == TYPE_SPEEDUP) {
			this.setFrame('item_speedup');
		}
		else if (objtype == TYPE_POWERUP) {
			this.setFrame('item_flame');
			//this.play('explosion', null, 0);
		};
	}

	update() {
		//this.healthBar.follow(this)
	}
}

