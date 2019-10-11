
var roomnum;
var player = {};
var opponent = {};
var roomUi = {};

const STATE_EMPTY = 1;
const STATE_WAITING = 2;
const STATE_READY = 4;
var RoomScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function RoomScene ()
    {
        Phaser.Scene.call(this, { key: 'roomscene' });
    },
    init: function (settings) {
        roomnum = settings;
	},
    preload: function ()
    {
    },

    create: function ()
    {
        console.log(roomnum);
        this.socket = io();
        this.socket.emit('joinRoom',roomnum,'tester');

        roomUi.leftBox1 = this.add.image(150, 150, 'uisprite', 'b_1');
        roomUi.leftBox1.displayWidth = 150;
        roomUi.leftBox1.displayHeight = 150;

        roomUi.leftBox2 = this.add.image(150, 270, 'uisprite', 'b_1');
        roomUi.leftBox2.displayWidth = 150;
        roomUi.leftBox2.displayHeight = 80;

        roomUi.leftStateText = this.add.bitmapText(150, 265, 'fontwhite', 'Waiting',30);
        roomUi.leftStateText.setOrigin(0.5).setCenterAlign();


        roomUi.rightBox1 = this.add.image(this.game.config.width-150, 150, 'uisprite', 'b_1');
        roomUi.rightBox1.displayWidth = 150;
        roomUi.rightBox1.displayHeight = 150;

        roomUi.rightBox2 = this.add.image(this.game.config.width-150, 270, 'uisprite', 'b_1');
        roomUi.rightBox2.displayWidth = 150;
        roomUi.rightBox2.displayHeight = 80;

        
        
        player.Img = this.add.image(150,150,'sprite','player_37');
        player.state = STATE_WAITING;
        opponent.Img = this.add.image(this.game.config.width-150,150,'sprite','player_19');
        opponent.state = STATE_EMPTY;
        //opponent.Img.visible = false;

        
        roomUi.chattingBox = this.add.dom(400, 450).createFromCache('chattingBox');
        
        roomUi.chattingBox.addListener('click');
        roomUi.chattingBox.on('click', function (event) {
            if(event.target.name == 'submit')
            {
                var text = this.getChildByName('inputBox').value;
                this.scene.socket.emit('C2S_chatting',roomnum,text);
                this.getChildByName('inputBox').value = "";
            }
            else if(event.target.name == 'ready')
            {
                if(player.state == STATE_WAITING)
                {
                    player.state = STATE_READY;
                    roomUi.leftStateText._text = "READY!";
                }
                else if(player.state == STATE_READY)
                {
                    player.state = STATE_WAITING;
                    roomUi.leftStateText._text = "Waiting";
                }

                this.scene.socket.emit('C2S_state',player.state);
            }
        });

        this.socket.on('S2C_chatting',(text)=>{
            roomUi.chattingBox.getChildByName('chatBox').value += '\n'+text;
            var cb = roomUi.chattingBox.getChildByName('chatBox');
            cb.scrollTop = cb.scrollHeight;
        });
        this.socket.on('S2C_state',(states)=>
        {

        });

        var txt = this.add.bitmapText(400, 300, 'fontwhite', 'RoomScene!');
        txt.setOrigin(0.5).setCenterAlign();
        this.btnstart = this.addButton(800, 500, 'sprites', this.doStart, this, 'btn_play_hl', 'btn_play', 'btn_play_hl', 'btn_play');
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
