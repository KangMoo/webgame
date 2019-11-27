
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
        if(this.rooms){
          for (var i = 0; i < this.rooms.length; i++) {
            this.rooms[i].destroy();
            this.txts[i].destroy();
            this.roomName[i].destroy();
          }
        }
        this.rooms = [];
        this.txts = [];
        this.roomName = [];
        this.page=0;
        //this.roomGroup=this.add.group();

        this.socket = this.game.socket;
        //socket ~
        if(this.socket.firstSetting.lobbyScene == false){
            this.socket.firstSetting.lobbyScene = true;

            this.socket.on('aswrooms', (data) => {
              console.log("??",data);
              this.roomupdate(data);
            });

            this.socket.on('toroom', (data) => {
              this.socket.emit('enterroom0', data, this.socket.id);
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

            this.socket.on('ChangeRoomScene', (roomNum,roomName,pnum) => {
              console.log("go to room")
                var setting = {
                    roomnum:roomNum,
                    roomname:roomName,
                    pnum:pnum
                };
                this.scene.start('roomscene',setting);
            });
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

        this.befobtn =this.add.image(this.game.config.width / 8, 5 * 90 + 50, 'uisprite', 'button').setInteractive();
        this.befobtn.displayWidth = 80;
        this.befobtn.displayHeight = 40;
        this.befotxt = this.add.bitmapText(this.befobtn.x, this.befobtn.y-10, 'fontwhite', '<');
        this.befotxt.setOrigin(0.5).setCenterAlign();
        this.befobtn.on('pointerdown', function (ptr) {
            this.displayWidth = 70;
            this.displayHeight = 30;
        });
        this.befobtn.on('pointerout', function (ptr) {
            if (this.displayWidth == 70) {
                this.displayWidth = 80;
                this.displayHeight = 40;
            }
        });
        this.befobtn.on('pointerup', function (ptr) {
          this.scene.sound.play('btn');
          console.log(this.page);
          if (this.displayWidth == 70) {
            this.displayWidth = 80;
            this.displayHeight = 40;
            }
          if(this.page>0){
            this.page-=1;
            
            this.roomupdate(this.everyRoomInfo);
          }
        });

        this.afterbtn =this.add.image(this.game.config.width / 8*7, 5 * 90 + 50, 'uisprite', 'button').setInteractive();
        this.afterbtn.displayWidth = 80;
        this.afterbtn.displayHeight = 40;
        this.aftertxt = this.add.bitmapText(this.afterbtn.x, this.afterbtn.y-10, 'fontwhite', '>');
        this.aftertxt.setOrigin(0.5).setCenterAlign();
        this.afterbtn.on('pointerdown', function (ptr) {
            this.displayWidth = 70;
            this.displayHeight = 30;
        });
        this.afterbtn.on('pointerout', function (ptr) {
            if (this.displayWidth == 70) {
                this.displayWidth = 80;
                this.displayHeight = 40;
            }
        });
        this.afterbtn.on('pointerup', function (ptr) {
            this.scene.sound.play('btn');
            if (this.displayWidth == 70) {
                this.displayWidth = 80;
                this.displayHeight = 40;
            }
          console.log("aa",this.everyRoomInfo);
          console.log(this.page);
          if(this.page+1 <= Math.ceil(this.everyRoomInfo.length/5)-1){
            this.page+=1;
            this.roomupdate(this.everyRoomInfo);
          }
        });


        this.btnquit = this.addButton(770, 30, 'uisprite', this.doBack, this, 'button_x', 'button_x', 'button_x', 'button_x');
        console.log("hahahahaha",this.rooms)
        this.socket.emit('rqrooms');
    },
    update: function () {
    },
    doBack: function () {
        this.sound.play('btn');
        this.scene.start('loginmenu');
    },
    enterRoom: function () {
    },
    roomupdate:function(data){
      console.log("room.length",this.rooms.length);
      console.log(this.rooms);
      console.log(data);
      for (var i = 0; i < this.rooms.length; i++) {
        this.rooms[i].destroy();
        this.txts[i].destroy();
        this.roomName[i].destroy();
      }
      this.rooms=[];
      this.txts=[];
      this.roomName=[];
      this.everyRoomInfo=data;
      for (var i = 0,idx=this.page*5; idx < data.length && i<5; i++,idx++) {
          this.rooms[i] = this.add.image(this.game.config.width / 2, i * 90 + 50, 'uisprite', 'button').setInteractive();
          this.rooms[i].idx=data[idx].room_id;
          this.rooms[i].id=idx;
          this.rooms[i].name = data[idx].room_name;
          this.rooms[i].state = data[idx].roomstate;
          this.rooms[i].displayWidth = 400;
          this.rooms[i].displayHeight = 80;
          this.rooms[i].on('pointerdown', function (ptr) {
              this.displayWidth = 385;
              this.displayHeight = 65;
          });
          this.rooms[i].on('pointerup', function (ptr) {
            this.scene.sound.play('btn');
            console.log("!!",this.idx);
            //var roomnum = String(parseInt((ptr.y+25+80)/90-1));
            console.log(this);
            var roomnum=this.idx;
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
                    console.log("//////roomnum",roomnum);
                    this.scene.socket.emit('enterroom', roomnum, this.scene.socket.id);
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
          //text = this.rooms[i].name + '\n' + text;
          this.txts[i] = this.add.bitmapText(this.rooms[i].x + 150, this.rooms[i].y + 15, 'fontwhite', text, 20);
          this.txts[i].setOrigin(0.5).setCenterAlign();
          //this.txts.push(txt);
          this.roomName[i] = this.add.bitmapText(this.rooms[i].x - 180, this.rooms[i].y - 30, 'fontwhite', this.rooms[i].name, 30);
          //tmp_room_name.setOrigin(0.5).setCenterAlign();
          //this.rooms[i].name.setOrigin(0.5).setCenterAlign();

          //this.roomGroup.add(room);
          //this.roomGroup.add(txt);
      }
      console.log("TTTTTTTTTT",this.rooms.length);
    }
});
