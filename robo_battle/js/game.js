var RoboBattleStates = RoboBattleStates || {};

// variables -------------------------------------------------------------------
var platforms;

var player;
var player_scale = 1.5;
var player_max_vel = 280;

var bullets;
var bulletTimer = 0;
var noBullets;
var getItems;

var curDirection;

var items;
var probes;
var probes_scale = 1.5;
var probes_max_vel = 400;

var score = 10;
var scoreText;

var cursors;
var fireBtn;

var isGameOver = false;

var world_W = 3600;
var world_H = 3610;

// game state ------------------------------------------------------------------
RoboBattleStates.Game = function(){};

RoboBattleStates.Game.prototype = {

    preload: function() {
        // game.load.script('webfont', "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js");

        // this.load.image('background', 'assets/bg_floors.png');
        // this.load.spritesheet('player', 'assets/robot.png', 46, 38);
        // this.load.spritesheet('probe', 'assets/probe.png', 24, 24);

        // this.load.image('platform', 'assets/platform.png');
        // this.load.image('item', 'assets/nut.png');
        // this.load.image('bullet', 'assets/bullet.png');
        // this.load.image('no_bullets', 'assets/no_bullets.png');
    },

    create: function() {
        isGameOver = false;
        score = 10;

        this.physics.startSystem(Phaser.Physics.ARCADE);
        // this.physics.startSystem(Phaser.Physics.P2JS);

        this.add.tileSprite(0, 0, world_W, world_H, 'background');
        this.world.setBounds(0, 0, world_W, world_H);

        platforms = this.add.group();
        platforms.enableBody = true;

        // platforms ---------------------------------------------------------------
        var floor = platforms.create(0, 0, 'platform');
        floor.scale.setTo(10, 0.4);
        floor.body.immovable = true;    

        var floor_height = 120;
        var num_floors = world_H / floor_height + 1;
        for (var i = 1; i < num_floors; i++) {
            floor = platforms.create(0, floor_height * i, 'platform');
            floor.scale.setTo(10, 0.4);
            floor.body.checkCollision.up = true;
            floor.body.checkCollision.down = false;
            floor.body.immovable = true;
        }

        floor = platforms.create(0, 0, 'platform');
        floor.scale.setTo(0.04, 120);
        floor.body.immovable = true;

        floor = platforms.create(world_W - 15, 0, 'platform');
        floor.scale.setTo(0.04, 120);
        floor.body.immovable = true;

        floor = platforms.create(0, world_H - 10, 'platform');
        floor.scale.setTo(10, 0.4);
        floor.body.immovable = true;

        // bullets -----------------------------------------------------------------
        bullets = this.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        bullets.createMultiple(10, 'bullet');
        bullets.setAll('anchor.x', 0.5);
        bullets.setAll('anchor.y', 1);
        bullets.setAll('outOfBoundsKill', true);
        bullets.setAll('checkWorldBounds', true);

        // player ------------------------------------------------------------------
        var x_loc = Math.floor(Math.random() * 100000) % (world_W - 100) + 50;
        var y_loc = Math.floor(Math.random() * 100000) % (world_W - 50) + 25;
        player = this.add.sprite(x_loc, y_loc, 'player');
        this.physics.arcade.enable(player);

        player.body.bounce.y = 0.1;
        player.body.gravity.y = 1200;
        player.body.collideWorldBounds = true;

        player.animations.add('left', [0, 1], 10, true);
        player.animations.add('right', [2, 3], 10, true);
        player.scale.setTo(player_scale, player_scale);

        noBullets = this.add.group();
        noBullets.enableBody = true;
        noBullets.physicsBodyType = Phaser.Physics.ARCADE;
        noBullets.createMultiple(1, 'no_bullets');
        noBullets.setAll('anchor.x', 0.5);
        noBullets.setAll('anchor.y', 1);
        noBullets.setAll('outOfBoundsKill', true);
        noBullets.setAll('checkWorldBounds', true);

        getItems = this.add.group();
        getItems.enableBody = true;
        getItems.physicsBodyType = Phaser.Physics.ARCADE;
        getItems.createMultiple(5, 'item');
        getItems.setAll('scale.x', 0.6);
        getItems.setAll('scale.y', 0.6);
        getItems.setAll('anchor.x', 0.5);
        getItems.setAll('anchor.y', 1);
        getItems.setAll('outOfBoundsKill', true);
        getItems.setAll('checkWorldBounds', true);

        // probes ------------------------------------------------------------------
        probes = this.add.group();
        probes.enableBody = true;

        for (var i = 0; i < 60; i++) {
            this.addProbe();
        }

        // items -------------------------------------------------------------------
        items = this.add.group();
        items.enableBody = true;

        for (var i = 0; i < 30; i++) {
            this.addItem();
        }

        // texts -------------------------------------------------------------------
        scoreText = this.add.text(28, 18, score);
        scoreText.font = 'Allerta Stencil';
        scoreText.fontSize = 52;
        scoreText.fill = '#ffffff';
        scoreText.align = 'center';
        scoreText.stroke = '#000000';
        scoreText.strokeThickness = 4;
        scoreText.fixedToCamera = true;

        // settings ----------------------------------------------------------------
        cursors = this.input.keyboard.createCursorKeys();
        fireBtn = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.camera.follow(player);
    },

    update: function() {
        this.physics.arcade.collide(player, platforms);
        this.physics.arcade.collide(probes, platforms);
        this.physics.arcade.collide(items, platforms);

        this.physics.arcade.overlap(bullets, probes, this.destroyProbe, null, this);
        this.physics.arcade.overlap(player, items, this.collectItem, null, this);
        this.physics.arcade.overlap(player, probes, this.gameOver, null, this);

        player.body.velocity.x = 0;

        for (var i = 0, len = probes.children.length; i < len; i++)
        {
            probe = probes.children[i];
            probe.body.velocity.x += Math.random() * 50 - 25;
            if (probe.body.velocity.x > probes_max_vel) {
                probe.body.velocity.x = probes_max_vel;
            }
            else if (probe.body.velocity.x < -probes_max_vel) {
                probe.body.velocity.x = -probes_max_vel;
            }

            if (probe.body.velocity.x < -45) {
                probe.animations.play('left');
            }
            else if (probe.body.velocity.x > 45) {
                probe.animations.play('right');
            }
        }

        if (isGameOver == false)
        {
            if (cursors.left.isDown)
            {
                player.body.velocity.x = -player_max_vel;
                player.animations.play('left');
                curDirection = 0;
            }
            else if (cursors.right.isDown)
            {
                player.body.velocity.x = player_max_vel;
                player.animations.play('right');
                curDirection = 1;
            }
            else
            {
                player.animations.stop();
                if (curDirection == 0)
                {
                    player.frame = 0;
                }
                else
                {
                    player.frame = 2;
                }
            }

            if (fireBtn.isDown)
            {
                this.fireBullet();
            }
            
            if (cursors.up.isDown && player.body.touching.down)
            {
                player.body.velocity.y = -560;
            }

            if (cursors.down.isDown && player.body.touching.down && player.y < world_H - 100)
            {
                player.body.y = player.body.y + 5;
            }
        }
    },

    gameOver: function() {
        isGameOver = true;

        this.game.state.start('Menu', true, false, score);
    },

    collectItem: function(player, item) {
        item.kill();

        var itemIcon = getItems.getFirstExists(false);

        if (itemIcon)
        {
            itemIcon.reset(player.x + (23 * player_scale), player.y - 5);
            itemIcon.body.velocity.y = -110;
            itemIcon.lifespan = 200;
        }

        score += 1;
        scoreText.text = score;

        this.addItem();
    },

    addItem: function() {
        if (items.children.length < 100) 
        {
            var x_loc = Math.floor(Math.random() * 100000) % (world_W - 100) + 50;
            var y_loc = Math.floor(Math.random() * 100000) % (world_W - 50) + 25;

            var item = items.create(x_loc, y_loc, 'item');
            item.scale.setTo(1, 1);
            item.body.gravity.y = 3000;
            item.body.bounce.y = 0.4 + Math.random() * 0.2;
        }
    },

    addItemAt: function(x, y) {
        var x_loc = x + (Math.floor(Math.random() * 300) - 150);
        var y_loc = y - (Math.floor(Math.random() * 100) - 20);
        var y_vel = Math.floor(Math.random() * 500) + 100;

        if (x_loc < 15) {
            x_loc = 15;
        }
        else if (x_loc > world_W - 30) {
            x_loc = world_W - 30;
        }
        if (y_loc < 15) {
            y_loc = 15;
        }
        else if (y_loc > world_W - 15) {
            y_loc = world_W - 15;
        }

        var item = items.create(x_loc, y_loc, 'item');
        item.scale.setTo(1, 1);
        item.body.velocity.y = -600;
        item.body.gravity.y = 3000;
        item.body.bounce.y = 0.45 + Math.random() * 0.2;   
    },

    destroyProbe: function(bullet, probe) {
        bullet.kill();

        for (var i=0; i<Math.random() * 4; i++) {
            this.addItemAt(probe.x, probe.y);
        }
        probe.kill();

        this.addProbe();
    },

    addProbe: function() {
        var x_loc = Math.floor(Math.random() * 100000) % (world_W - 100) + 50;
        var y_loc = Math.floor(Math.random() * 100000) % (world_W - 50) + 25;

        var probe = probes.create(x_loc, y_loc, 'probe');
        probe.scale.setTo(probes_scale, probes_scale);
        probe.body.gravity.y = 3000;
        probe.body.bounce.y = 0.35 + Math.random() * 0.2;
        probe.body.velocity.x = Math.random() * 200 - 100;
        probe.body.velocity.y = -300;

        probe.animations.add('left', [0, 1], 10, true);
        probe.animations.add('right', [2, 3], 10, true);
    },

    fireBullet: function() {
        if (this.time.now > bulletTimer)
        {
            var bulletSpeed = 800;
            var bulletSpacing = 150;
            var bulletLifespan = 900;

            var bullet = bullets.getFirstExists(false);

            if (bullet && score > 0)
            {
                if (curDirection == 0)
                {
                    bullet.reset(player.x, player.y + 19 * player_scale);
                    bullet.angle = -90;
                    bullet.body.velocity.x = -bulletSpeed;
                    bullet.lifespan = bulletLifespan;
                }
                else
                {
                    bullet.reset(player.x + 46 * player_scale, player.y + 19 * player_scale);
                    bullet.angle = 90;
                    bullet.body.velocity.x = bulletSpeed;
                    bullet.lifespan = bulletLifespan;
                }

                bulletTimer = this.time.now + bulletSpacing;

                score -= 1;
                scoreText.text = score;
            }
            else
            {
                var msgItem = noBullets.getFirstExists(false);

                if (msgItem)
                {
                    msgItem.reset(player.x + (23 * player_scale), player.y - 5);
                    msgItem.body.velocity.y = -40;
                    msgItem.lifespan = 200;
                }
            }
        }
    }
};
