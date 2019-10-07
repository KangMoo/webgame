

var RoomScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function RoomScene ()
    {
        Phaser.Scene.call(this, { key: 'roomscene' });
    },

    preload: function ()
    {
    },

    create: function ()
    {
        
        var txt = this.add.bitmapText(400, 300, 'fontwhite', 'RoomScene!');
        txt.setOrigin(0.5).setCenterAlign();
        this.btnstart = this.addButton(700, 500, 'sprites', this.doStart, this, 'btn_play_hl', 'btn_play', 'btn_play_hl', 'btn_play');
    },

	doStart: function ()
    {
        console.log('menuscene doStart was called!');
        //this.scene.start('gamescene','test');
        this.scene.start('gamescene');
    },

    update: function()
    {

    }

});
