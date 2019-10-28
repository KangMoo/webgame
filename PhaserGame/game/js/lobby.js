
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
        //this.roomGroup=this.add.group();

        this.socket = this.game.socket;
        //socket ~
        if(this.socket.firstSetting.lobbyScene == false){
            this.socket.firstSetting.lobbyScene = true;
        }
        this.socket.on('aswrooms', (data) => {
          console.log("socketON",data);
          //console.log(this);
          this.temp(data);
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
        this.scene.start('loginmenu');
    },
    eneterRoom: function () {
    },
    temp:function(data){
      if(this.rooms.length!=0){
        for (var i = 0; i < 5; i++) {
          //this.rooms[i].setVisible(false)
          this.rooms[i].destroy();
          this.txts[i].destroy();
        }
      }
      this.rooms=[];
      this.txts=[];
      //this.roomGroup.clear(true);
      //console.log("after",this.roomGroup);
      for (var i = 0; i < data.length; i++) {
          this.rooms[i] = this.add.image(this.game.config.width / 2, i * 90 + 50, 'uisprite', 'button').setInteractive();
          this.rooms[i].state = data[i].roomstate;
          this.rooms[i].displayWidth = 400;
          this.rooms[i].displayHeight = 80;
          this.rooms[i].on('pointerdown', function (ptr) {
              this.displayWidth = 385;
              this.displayHeight = 65;
          });
          this.rooms[i].on('pointerup', function (ptr) {

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
                      console.log("enter");
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
