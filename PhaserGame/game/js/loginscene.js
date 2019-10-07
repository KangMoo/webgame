
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
                      if(result.result=="ok"){//Î°úÍ∑∏?ù∏ ?Ñ±Í≥?
                        element.removeListener('click');
                        console.log("Î°úÍ∑∏?ù∏ ?Ñ±Í≥?");
                        //console.log("User: ", result.user);

                        //  Tween the login form out
                        element.scene.tweens.add({ targets: element.rotate3d, x: 1, w: 90, duration: 3000, ease: 'Power3' });

                        element.scene.tweens.add({ targets: element, scaleX: 2, scaleY: 2, y: 700, duration: 3000, ease: 'Power3',
                            onComplete: function (){
                                element.setVisible(false);
                                sessionStorage.setItem('login', JSON.stringify({id:inputUsername.value}));
                                // if(sessionStorage.getItem('login')){
                                //   console.log(JSON.parse(sessionStorage.getItem('login')).id);
                                // }
                                //this.parent.scene.scene.start('gamescene');//Î©îÏù∏ Î©îÎâ¥ ÎßåÎì§?ñ¥?ïº?ï†?ìØ
                            }
                        });;
                        //  Populate the text with whatever they typed in as the username!
                        text.setText('Welcome ' + inputUsername.value);
                      }else{//Î°úÍ∑∏?ù∏ ?ã§?å®
                        console.log("Î°úÍ∑∏?ù∏ ?ã§?å®");
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

	  doStart: function ()
    {
        console.log('menuscene doStart was called!');
        //this.scene.start('gamescene','test');
        this.scene.start('lobbyscene');
    }

});
