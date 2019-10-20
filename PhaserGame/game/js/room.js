

const playerpositions = [
    { x: 150, y: 150 }, { x: 800 - 150, y: 150 }
];
const MAXPLAYERNUM = 2;
const STATE_EMPTY = 1;
const STATE_WAITING = 2;
const STATE_READY = 4;
var RoomScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function RoomScene() {
            Phaser.Scene.call(this, { key: 'roomscene' });
        },
    init: function (settings) {
        this.roomnum = settings.roomnum;
        this.pnum = settings.pnum;
    },
    preload: function () {
    },

    create: function () {

        this.player = {};
        
        this.roomUi = {};
        this.players = [];

        // UI Init ~
        this.roomUi.leftBox1 = this.add.image(150, 150, 'uisprite', 'b_1');
        this.roomUi.leftBox1.displayWidth = 150;
        this.roomUi.leftBox1.displayHeight = 150;

        this.roomUi.leftBox2 = this.add.image(150, 270, 'uisprite', 'b_1');
        this.roomUi.leftBox2.displayWidth = 150;
        this.roomUi.leftBox2.displayHeight = 80;

        //roomUi.leftStateText = this.add.bitmapText(150, 265, 'fontwhite', 'Waiting',30);
        //roomUi.leftStateText.setOrigin(0.5).setCenterAlign();


        this.roomUi.rightBox1 = this.add.image(this.game.config.width - 150, 150, 'uisprite', 'b_1');
        this.roomUi.rightBox1.displayWidth = 150;
        this.roomUi.rightBox1.displayHeight = 150;

        this.roomUi.rightBox2 = this.add.image(this.game.config.width - 150, 270, 'uisprite', 'b_1');
        this.roomUi.rightBox2.displayWidth = 150;
        this.roomUi.rightBox2.displayHeight = 80;

        // ~ UI Init


        for (var i = 0; i < MAXPLAYERNUM; i++) {
            this.players.push({
                Img: this.physics.add.sprite(playerpositions[i].x, playerpositions[i].y, 'sprite'),
                state: STATE_WAITING,
                stateText: this.add.bitmapText(playerpositions[i].x, playerpositions[i].y + 115, 'fontwhite', 'Waiting', 30).setOrigin(0.5).setCenterAlign(),
                pnum: i + 1
            });
            if (i + 1 == this.pnum) {
                this.players[i].Img.anims.play('player_down_w');
            }
            else {
                this.players[i].Img.anims.play('player_down_r');
                this.players[i].Img.visible = false;
                this.players[i].stateText.visible = false;
            }
        }

        this.socket = this.game.socket;
        this.player = this.getCharacter(this.pnum);

        this.roomUi.chattingBox = this.add.dom(400, 450).createFromCache('chattingBox');

        this.roomUi.chattingBox.addListener('click');
        this.roomUi.chattingBox.on('click', function (event) {
            if (event.target.name == 'submit') {
                var text = this.getChildByName('inputBox').value;
                this.scene.socket.emit('chatting', this.scene.roomnum, text, this.scene.player.pnum);
                this.getChildByName('inputBox').value = "";
            }
            else if (event.target.name == 'ready') {
                if (this.scene.player.state == STATE_WAITING) {
                    this.scene.player.state = STATE_READY;
                    this.scene.player = this.scene.PlayerStateUpdate(this.scene.player);
                }
                else if (this.scene.player.state == STATE_READY) {
                    this.scene.player.state = STATE_WAITING;
                    this.scene.player = this.scene.PlayerStateUpdate(this.scene.player);
                }
                this.scene.socket.emit('ChgState', this.scene.roomnum, this.scene.player.state, this.scene.pnum);


            }
        });

        if (this.socket.firstSetting.roomScene == false) {
            this.socket.firstSetting.roomScene = true;

            this.socket.on('broadcastInfo', () => {
                this.socket.emit('ChgState', this.roomnum, this.player.state, this.pnum);
            });

            this.socket.on('ChgState', (state, pnum) => {
                for (var i = 0; i < this.players.length; i++) {
                    if (i + 1 == this.pnum) continue;
                    this.players[i].state = STATE_EMPTY;
                }
                var user = this.getCharacter(pnum);
                user.state = state;
                this.PlayerStateUpdate(user);
                if (this.gameStartCheck() == true) {
                    this.socket.emit('gameStart', this.roomnum);
                };
            })
            this.socket.on('chatting', (text, id) => {
                this.roomUi.chattingBox.getChildByName('chatBox').value += '\n' + text;
                var cb = this.roomUi.chattingBox.getChildByName('chatBox');
                cb.scrollTop = cb.scrollHeight;
            });
            this.socket.on('disconnect', () => {

            });
            this.socket.on('refresh', () => {
                for (var i = 0; i < this.players.length; i++) {
                    if (i + 1 == this.pnum) continue;
                    this.players[i].state = STATE_EMPTY;
                    this.PlayerStateUpdate(this.players[i]);
                }
                this.socket.emit('ChgState', this.roomnum, this.player.state, this.pnum);
            })

            this.socket.on('gameStart', () => {
                var position = {};
                if (this.pnum == 1) {
                    position.x = 50 * 1 + 25;
                    position.y = 45 * 1;
                }
                else {
                    position.x = 50 * 13 + 25;
                    position.y = 45 * 11;
                }
                var txt = this.add.bitmapText(400, 200, 'fontwhite', 'Let\'s Begin!!', 100);
                txt.setOrigin(0.5).setCenterAlign();
                console.log(txt);
                var tw = this.tweens.add(
                    {
                        targets: txt,
                        scale:0.9,
                        ease: 'Power3',
                        duration: 200,
                        repeat:4,
                        yoyo:true,
                        onComplete: () => {
                            console.log(position);
                            this.scene.start('gamescene', {roomnum:this.roomnum, sx: position.x, sy: position.y,pnum:this.pnum })
                        }
                    }
                );
            })
        }

        this.socket.emit('joinRoom', this.roomnum, this.pnum);

        this.btnquit = this.addButton(760, 40, 'sprites', this.doBack, this, 'btn_close_hl', 'btn_close', 'btn_close_hl', 'btn_close');

        this.btnstart = this.addButton(800, 500, 'sprites', this.doStart, this, 'btn_play_hl', 'btn_play', 'btn_play_hl', 'btn_play');
    },

    doStart: function () {
        console.log('menuscene doStart was called!');
        this.scene.start('gamescene');
    },

    update: function () {
    },

    PlayerStateUpdate: function (userInfo) {
        if (userInfo.state == STATE_EMPTY) {
            userInfo.stateText.visible = false;
            userInfo.Img.visible = false;
        }
        else if (userInfo.state == STATE_WAITING) {
            userInfo.stateText._text = 'Waiting';
            userInfo.stateText.visible = true;
            userInfo.Img.visible = true;
        }
        else if (userInfo.state == STATE_READY) {
            userInfo.stateText._text = 'READY!';
            userInfo.stateText.visible = true;
            userInfo.Img.visible = true;
        }
        return userInfo;
    },
    getCharacter: function (num) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].pnum == num)
                return this.players[i];
        }
    },
    gameStartCheck: function () {
        var readyCount = 0;
        for (var i = 0; i < MAXPLAYERNUM; i++) {
            if (this.players[i].state == STATE_READY) readyCount++;
        }
        if (readyCount == MAXPLAYERNUM) {
            return true;
        }
        return false;
    },
    doBack: function () {
        this.player.state = STATE_EMPTY;
        this.socket.emit('leaveRoom', this.roomnum, this.pnum);
        this.scene.start('lobbyscene');
    }
});
