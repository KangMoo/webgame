
var element;

var JoinMenu = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function JoinMenu ()
    {
        Phaser.Scene.call(this, { key: 'joinmenu' });
    },

    preload: function ()
    {
        this.load.html('joinform', 'html/join.html');
    },

    create: function ()
    {


        var text = this.add.text(10, 10, 'Please join to play', { color: 'white', fontFamily: 'Arial', fontSize: '32px '});

        var element = this.add.dom(400, 600).createFromCache('joinform');

        element.setPerspective(800);

        element.addListener('click');

        element.on('click', function (event) {
            if (event.target.name === 'loginButton'){
                this.scene.start('loginmenu');
                //this.scene.switch('loginmenu', 'joinmenu');
            }
        }, this);
        element.on('click', function (event) {
            if (event.target.name === 'joinButton'){
                var inputUsername = this.getChildByName('username');
                var inputPassword = this.getChildByName('password');

                //  Have they entered anything?
                if (inputUsername.value !== '' && inputPassword.value !== ''){
                    //  Turn off the click events
                    var data={id:inputUsername.value,pw:inputPassword.value};
                    var http=new XMLHttpRequest();
                    http.open('POST','http://52.78.114.138:8000/login');
                    http.setRequestHeader('Content-Type', 'application/json');
                    http.send(JSON.stringify(data));

                    http.onload=function(){
                      if(JSON.parse(http.responseText)=="ok"){//회원가입 성공
                        element.removeListener('click');
                        console.log("haha");
                        //  Tween the login form out
                        element.scene.tweens.add({ targets: element.rotate3d, x: 1, w: 90, duration: 3000, ease: 'Power3' });

                        element.scene.tweens.add({ targets: element, scaleX: 2, scaleY: 2, y: 700, duration: 3000, ease: 'Power3',
                            onComplete: function (){
                                element.setVisible(false);
                                this.parent.scene.scene.start('loginmenu');
                            }
                        });;
                        //  Populate the text with whatever they typed in as the username!
                        //text.setText('Welcome ' + inputUsername.value);
                      }else{//회원가입 실패
                        console.log("hoho");
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


        this.btnstart = this.addButton(700, 500, 'sprites', this.doStart, this, 'btn_play_hl', 'btn_play', 'btn_play_hl', 'btn_play');
    },

	  doStart: function (){

        console.log('menuscene doStart was called!');
        this.scene.start('loginscene','test');
    }

});
