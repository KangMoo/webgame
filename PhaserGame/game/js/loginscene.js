
var element;

var LoginMenu = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function LoginMenu ()
    {
        Phaser.Scene.call(this, { key: 'loginmenu' });
    },

    preload: function ()
    {
        this.load.html('nameform', 'html/login.html');
    },

    create: function ()
    {
        if(this.game.sound.sounds.length == 0)
        {
            this.bgm = this.sound.add('bgm_menuscene');
            this.bgm.loop = true;
            this.bgm.volume = 0.1;
            this.bgm.play();
        }
        //save Socket & ID
        this.game.socket = io();
        this.game.socket.firstSetting = {
            loginScene : true,
            lobbyScene : false,
            roomScene : false,
            gameScene : false
        }
        this.game.socket.emit('saveSocket', this.game.socket.id);
        /*
        var text = this.add.text(10, 10, 'Please login to play', { color: 'white', fontFamily: 'Arial', fontSize: '32px '});

        var element = this.add.dom(400, 600).createFromCache('nameform');

        element.setPerspective(800);

        element.addListener('click');
        element.on('click', function (event) {
            if (event.target.name === 'joinButton')
            {
                console.log('join button click!');
                this.scene.start('joinmenu');
                //this.scene.switch('loginmenu', 'joinmenu');
            }
        }, this);

        element.on('click', function (event) {
            if (event.target.name === 'loginButton')
            {
                var inputUsername = this.getChildByName('username');
                var inputPassword = this.getChildByName('password');

                //  Have they entered anything?
                if (inputUsername.value !== '' && inputPassword.value !== ''){
                    //  Turn off the click events
                    var data={id:inputUsername.value,pw:inputPassword.value};
                    var http=new XMLHttpRequest();
                    http.open('POST','http://localhost:3000/users/login');
                    http.setRequestHeader('Content-Type', 'application/json');
                    http.send(JSON.stringify(data));

                    http.onload=function(){
                      var result = JSON.parse(http.responseText);
                      if(result.result=="ok"){//로그?�� ?����??
                        element.removeListener('click');
                        console.log("로그?�� ?����??");
                        //console.log("User: ", result.user);

                        //  Tween the login form out
                        element.scene.tweens.add({ targets: element.rotate3d, x: 1, w: 90, duration: 3000, ease: 'Power3' });

                        element.scene.tweens.add({ targets: element, scaleX: 2, scaleY: 2, y: 700, duration: 3000, ease: 'Power3',
                            onComplete: function (){
                                element.setVisible(false);
                                sessionStorage.setItem('login', JSON.stringify({id:inputUsername.value}));
                            }
                        });;
                        //  Populate the text with whatever they typed in as the username!
                        text.setText('Welcome ' + inputUsername.value);
                      }else{//로그?�� ?��?��
                        console.log("로그?�� ?��?��");
                      }
                    }
                }else{
                    //  Flash the prompt
                    this.scene.tweens.add({ targets: text, alpha: 0.1, duration: 200, ease: 'Power3', yoyo: true });
                }
            }
        });

        this.tweens.add({
            targets: element,
            y: 300,
            duration: 3000,
            ease: 'Power3'
        });
        */
        this.mainImg = this.add.image(400,1000, 'sprite','gui_menu_background');
        this.mainImg.setScale(1.5,1.5);
        this.tweens.add({
            targets: this.mainImg,
            y: 300,
            duration: 3000,
            ease: 'Power3'
        });
        this.btnstart = this.addButton(1000, 300, 'uisprite', this.doStart, this, 'button_play', 'button_play', 'button_play', 'button_play');
        this.btnTutorial = this.addButton(1000,400,'uisprite',this.doTutorial,this,'button_tutorial','button_tutorial','button_tutorial','button_tutorial');

        this.tweens.add({
            targets: this.btnstart,
            x:600,
            duration: 5000,
            ease: 'Power3'
        });

        this.tweens.add({
            targets: this.btnTutorial,
            x:650,
            duration: 5000,
            ease: 'Power3'
        });

      
    },
   
	 doStart: function ()
    {
        console.log('menuscene doStart was called!');
        this.sound.play('btn');
        this.scene.start('lobbyscene',);
    },
    doTutorial:function(){
        this.sound.play('btn');
        this.scene.start('tutorscene');
    }

});
