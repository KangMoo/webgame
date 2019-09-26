

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


//socket 통신
var socket = io();

var game = new Phaser.Game(config);
var roomNum;
var bird;
var enemy;
var cursors;
var enemyInfo = {};

// 소켓 통신 ~
socket.on('S2C',(data) => {
    enemyInfo = data;
});
// ~ 소켓 통신

function preload ()
{
    //this.load.setBaseURL('http://labs.phaser.io');
    this.load.image('bird', 'assets/bird.png');
    this.load.image('pipe', 'assets/pipe.png');
}
function create ()
{
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

    // 소켓 통신 ~
    socket.emit('C2S',bird);
    // ~ 소켓 통신
}