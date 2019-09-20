var mainState = {
    preload: function() {
        // �� ����� ó���� ����˴ϴ�.
        // �װ��� �̹����� ���带 �ε��ϴ� ���Դϴ�.
        game.load.image('bird', 'assets/bird.png');
        game.load.image('pipe', 'assets/pipe.png');
    },

    create: function() {
        // �� �Լ��� preload �Լ� �Ŀ� ȣ��˴ϴ�.
        // ���⿡���� ������ �����ϰ� ��������Ʈ�� ǥ���մϴ�.
        
        // �� �׷��� ����ϴ�
        this.pipes = game.add.group();

        this.score = 0;
        this.labelScore = game.add.text(20, 20, "0", 
            { font: "30px Arial", fill: "#ffffff" });

        

        // ������ ������ �Ķ������� �����Ͻʽÿ�.
        game.stage.backgroundColor = '#71c5cf';

        // ���� �ý��� ����
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // ���� x = 100 �� y = 245 ��ġ�� ǥ���Ͻʽÿ�.
        this.bird = game.add.sprite(100, 245, 'bird');

        // ���� ���� �ý��ۿ� �߰�
        // �߰����� : movements, gravity, collisions, etc.
        game.physics.arcade.enable(this.bird);

        // ���� �߷��� ���Ͽ� ���� �߸��ϴ�.
        this.bird.body.gravity.y = 1000;

        // �����̽� Ű�� �������� 'jump'�Լ��� ȣ���Ͻʽÿ�.
        var spaceKey = game.input.keyboard.addKey(
                        Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);
        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);
    },
    
    addOnePipe: function(x, y) {
        // x�� y ��ġ�� ������ �����
        var pipe = game.add.sprite(x, y, 'pipe');
    
        // ������ ������ �׷쿡 �߰�
        this.pipes.add(pipe);
    
        // �������� ���� �ý��ۿ� �߰�
        game.physics.arcade.enable(pipe);
    
        // �������� �ӵ��� �߰��Ͽ� �������� �̵��մϴ�.
        pipe.body.velocity.x = -200;
    
        // �������� �� �̻� ������ ���� �� �ڵ����� �������� �����մϴ�.
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },
    addRowOfPipes: function() {
        // �������� 1�� 5 ������ ���� ����
        // ���� ��ġ���˴ϴ�.
        var hole = Math.floor(Math.random() * 5) + 1;
    
        // 6 ���� ������ �߰�
        // '����'�� '���� + 1' ��ġ�� �ϳ��� ū �������ִ� ����
        for (var i = 0; i < 8; i++)
            if (i != hole && i != hole + 1)
                this.addOnePipe(400, i * 60 + 10);
                
        this.score += 1;
        this.labelScore.text = this.score;
    },
    update: function() {
        // �� �Լ��� �ʴ� 60 ȸ ȣ��˴ϴ�.
        // ���⿡�� ������ ������ ���ԵǾ� �ֽ��ϴ�.
        if (this.bird.y < 0 || this.bird.y > 490)
            this.restartGame();

        game.physics.arcade.overlap(this.bird, this.pipes, this.restartGame, null, this);

    },

    // ���� �����ϴ� �Լ�
    jump: function() {
        // �߷��� �ݴ�� ����
        this.bird.body.velocity.y = -350;
    },

    // Game Restart �Լ�
    restartGame: function() {
        // ������ �ٽ� �����ϰ� �մϴ�.
        game.state.start('main');
    },
};

// ������ �ʱ�ȭ �� 400 x 490 ���� �����
var game = new Phaser.Game(400, 490);

// 'mainState'�� �߰��ϰ� 'main' �̶�� �����մϴ�.
game.state.add('main', mainState);

// ������ ������ �����ϱ� ���� 'main' �� �����մϴ�..
game.state.start('main');