var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade'
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};


//socket ����
var socket = io();

var game = new Phaser.Game(config);
var bird;
var enemy;
var cursors;
var enemyInfo = {};
socket.on('S2C',(data) => {
    enemyInfo = data;
});

function preload ()
{
    //this.load.setBaseURL('http://labs.phaser.io');
    this.load.html('input', 'assets/html/login.html');
    this.load.image('bird', 'assets/bird.png');
    this.load.image('pipe', 'assets/pipe.png');
}
function create ()
{
    var element = this.add.dom(400, 0).createFromCache('input');
    bird = this.physics.add.image(400, 300, 'bird');
    cursors = this.input.keyboard.createCursorKeys();
    enemy = this.physics.add.image(0,0,'pipe');
}

function isEmpty(obj){
    return Object.keys(obj).length ===0;
}

function update()
{

    bird.setVelocity(0);
    if(isEmpty(enemyInfo) != true)
    {
        enemy.x = enemyInfo.x;
        enemy.y = enemyInfo.y;
        console.log(enemy);
    }
    if (cursors.left.isDown)
    {
        bird.x -= 10;
    }
    else if (cursors.right.isDown)
    {
        bird.x += 10;
    }

    if (cursors.up.isDown)
    {
        bird.y -= 10;
    }
    else if (cursors.down.isDown)
    {
        bird.y += 10;
    }

    socket.emit('C2S',bird);
}
