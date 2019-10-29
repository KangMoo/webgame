
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
        this.rooms = [];
        this.txts = [];
        this.page=0;
        //this.roomGroup=this.add.group();

        this.socket = this.game.socket;
        //socket ~
        if(this.socket.firstSetting.lobbyScene == false){
            this.socket.firstSetting.lobbyScene = true;
        }

        this.makebtn = this.add.image(this.game.config.width / 2, 5 * 90 + 50, 'uisprite', 'button').setInteractive();
        this.makebtn.displayWidth = 400;
        this.makebtn.displayHeight = 80;
        this.maketxt = this.add.bitmapText(this.makebtn.x, this.makebtn.y - 10, 'fontwhite', 'Make Room');
        this.maketxt.setOrigin(0.5).setCenterAlign();

        this.makebtn.on('pointerdown', function (ptr) {
            this.displayWidth = 385;
            this.displayHeight = 65;
        });
        this.makebtn.on('pointerout', function (ptr) {
            if (this.displayWidth == 385) {
                this.displayWidth = 400;
                this.displayHeight = 80;
            }
        });
        this.makebtn.on('pointerup', function (ptr) {
          var roomnum = String(parseInt((ptr.y+25+80)/90-1));

          if (this.displayWidth == 385) {
            this.scene.socket.emit('makerooms');

            this.displayWidth = 400;
            this.displayHeight = 80;
          }
        });

        this.socket.on('aswrooms', (data) => {
          console.log(data);
          this.roomupdate(data);
        });

        this.socket.on('toroom', (data) => {
          this.socket.emit('enterroom', data,this.socket.id);
          //this.roomupdate(data);
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
          console.log("go to room")
            var setting = {
                roomnum:roomNum,
                pnum:pnum
            };
            this.scene.start('roomscene',setting);
        });

        this.btnquit = this.addButton(770, 30, 'uisprite', this.doBack, this, 'button_x', 'button_x', 'button_x', 'button_x');

        this.socket.emit('rqrooms');
    },
    update: function () {
    },
    doBack: function () {
        this.sound.play('btn');
        this.scene.start('loginmenu');
    },
    eneterRoom: function () {
    },
    roomupdate:function(data){
      if(this.rooms.length!=0){
        for (var i = 0; i < this.rooms.length; i++) {
          //this.rooms[i].setVisible(false)
          this.rooms[i].destroy();
          this.txts[i].destroy();
        }
      }
      this.rooms=[];
      this.txts=[];
      //this.roomGroup.clear(true);
      //console.log("after",this.roomGroup);
      for (var i = 0,idx=this.page*5; idx < data.length && i<5; i++,idx++) {
          console.log(idx,data.length);
          this.rooms[i] = this.add.image(this.game.config.width / 2, i * 90 + 50, 'uisprite', 'button').setInteractive();
          this.rooms[i].id=idx;
          this.rooms[i].state = data[idx].roomstate;
          this.rooms[i].displayWidth = 400;
          this.rooms[i].displayHeight = 80;
          this.rooms[i].on('pointerdown', function (ptr) {
              this.displayWidth = 385;
              this.displayHeight = 65;
          });
          this.rooms[i].on('pointerup', function (ptr) {
            this.scene.sound.play('btn');
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
          this.rooms[i].on('pointerout', function (ptr) {
              if (this.displayWidth == 385) {
                  this.displayWidth = 400;
                  this.displayHeight = 80;
              }
          });
          //this.rooms.push(room);

          //obj.rooms[i].state = data[i].roomstate;
          var text="";
          if (this.rooms[i].state == ROOMEMPTY) {
              text = 'Empty';
          }
          else if (this.rooms[i].state == ROOMPLAYING) {
              text = 'Playing';
          }
          else if (this.rooms[i].state == ROOMWAITING) {
              text = 'Waiting';
          }
          else if (this.rooms[i].state == ROOMFULL) {
              text = 'Full';
          }
          this.txts[i] = this.add.bitmapText(this.rooms[i].x, this.rooms[i].y - 10, 'fontwhite', text);
          this.txts[i].setOrigin(0.5).setCenterAlign();
          //this.txts.push(txt);

          //this.roomGroup.add(room);
          //this.roomGroup.add(txt);
      }
    }

});
