// Phaser3 example game
// tutorial scene

var TutorScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function TutorScene ()
    {
        Phaser.Scene.call(this, { key: 'tutorscene' });
    },

    preload: function ()
    {
    },

    create: function ()
    {
        this.add.image(400,300,'sprite','tutorial');
		// back Button
		this.btnback = this.addButton(770, 30, 'uisprite', this.doBack, this, 'button_x', 'button_x', 'button_x', 'button_x');

    },

    doBack: function ()
    {
        this.sound.play('btn');
		this.scene.start('loginmenu');
    }

});
