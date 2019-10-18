
var selectedGame = -1;

const ROOMEMPTY = 1;
const ROOMWAITING = 2;
const ROOMFULL = 4;
const ROOMPLAYING = 8;


var LobbyScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function LobbyScene() {
            Phaser.Scene.call(this, { key: 'lobbyscene' });
        },
    init: function () {
    },
    preload: function () {
    },

    create: function () {
        ;
        this.rooms = [];
        this.txts = [];
        
        this.socket = this.game.socket;
        //socket ~
        
        if(this.socket.firstSetting.lobbyScene == false)
        {
            this.socket.firstSetting.lobbyScene = true;

            this.socket.on('aswrooms', (data) => {
                for (var i = 0; i < 5; i++) {
                    this.rooms[i].state = data[i].roomstate;
                    if (this.rooms[i].state == ROOMEMPTY) {
                        this.txts[i]._text = 'Empty';
                    }
                    else if (this.rooms[i].state == ROOMPLAYING) {
                        this.txts[i]._text = 'Playing';
                    }
                    else if (this.rooms[i].state == ROOMWAITING) {
                        this.txts[i]._text = 'Waiting';
                    }
                    else if (this.rooms[i].state == ROOMFULL) {
                        this.txts[i]._text = 'Full';
                    }
                }
            });
        
        this.socket.on('serverMsg', (Msg) => {
            var txt = this.scene.add.bitmapText(400, 600 - 100, 'fontwhite', Msg);
            txt.setOrigin(0.5).setCenterAlign();
            var tw = this.scene.tweens.add(
                {
                    targets: txt,
                    alpha: 0.0,
                    ease: 'Power3',
                    duration: 1000,
                    delay: 500
                }
            );
        });

        this.socket.on('ChangeRoomScene', (roomNum,pnum) => {
            var setting = {
                roomnum:roomNum,
                pnum:pnum
            };
            this.scene.start('roomscene',setting);
        });
        }
            

        // ~ socket
        for (var i = 0; i < 5; i++) {
            var room = this.add.image(this.game.config.width / 2, i * 90 + 50, 'uisprite', 'b_1').setInteractive();
            room.state = ROOMEMPTY;
            room.displayWidth = 400;
            room.displayHeight = 80;
            room.on('pointerdown', function (ptr) {
                this.displayWidth = 385;
                this.displayHeight = 65;
            });
            room.on('pointerup', function (ptr) {
                
                var roomnum = String(parseInt((ptr.y+25+80)/90-1));

                if (this.displayWidth == 385) {
                    if (this.state == ROOMEMPTY || this.state == ROOMWAITING) {
                        var txt = this.scene.add.bitmapText(400, 600 - 100, 'fontwhite', 'Entering...');
                        txt.setOrigin(0.5).setCenterAlign();
                        var tw = this.scene.tweens.add(
                            {
                                targets: txt,
                                alpha: 0.0,
                                ease: 'Power3',
                                duration: 1000,
                                delay: 10000
                            }
                        );
                        this.scene.socket.emit('enterroom', roomnum,this.scene.socket.id);
                    }
                    else if (this.state == ROOMFULL || this.state == ROOMPLAYING) {
                        var txt = this.scene.add.bitmapText(400, 600 - 100, 'fontwhite', 'Can not Enter Room!!');
                        txt.setOrigin(0.5).setCenterAlign();
                        var tw = this.scene.tweens.add(
                            {
                                targets: txt,
                                alpha: 0.0,
                                ease: 'Power3',
                                duration: 1000,
                                delay: 500
                            }
                        );
                    }

                    this.displayWidth = 400;
                    this.displayHeight = 80;
                }
            });
            room.on('pointerout', function (ptr) {
                if (this.displayWidth == 385) {
                    this.displayWidth = 400;
                    this.displayHeight = 80;
                }
            });
            this.rooms.push(room);

            var txt = this.add.bitmapText(this.rooms[i].x, this.rooms[i].y - 10, 'fontwhite', 'Empty');
            txt.setOrigin(0.5).setCenterAlign();
            this.txts.push(txt);
        }

        this.btnquit = this.addButton(760, 40, 'sprites', this.doBack, this, 'btn_close_hl', 'btn_close', 'btn_close_hl', 'btn_close');

        this.socket.emit('rqrooms');

        var timer = this.time.addEvent({
            delay: 3000,
            callback: function(){this.socket.emit('rqrooms')},
            callbackScope:this,
            loop: true
        });
    },
    update: function () {
    },
    doBack: function () {
        this.scene.start('loginmenu');
    },
    eneterRoom: function () {
    }

});
