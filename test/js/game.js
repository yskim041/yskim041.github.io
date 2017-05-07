var RoboBattleStates = RoboBattleStates || {};

// variables -------------------------------------------------------------------
var world_W = 2400;
var world_H = 3610;

var platforms;
var floor_height = 120;
var cur_floor = 0;
var num_floors = world_H / floor_height + 1;

var player_group;

var player;
var player_scale = 1.2;
var player_gravity = 600;
var player_max_vel = 185;
var player_y_vel = -388;
var cur_direction;

var name_text;

var bullets;
var bullet_timer = 0;
var no_bullets;
var get_items;

var bullet_speed = 600;
var bullet_spacing = 200;
var bullet_lifespan = 700;

var items;
var probes;
var probes_scale = 1.4;
var probes_max_vel = 375;
var update_count = 0;

var score = 10;
var score_text;

var top5_text = [];

var cursors;
var bt_fire;

var c_fire;

var c_up;
var c_down;
var c_left;
var c_right;

var c_up_pressed;
var c_down_pressed;
var c_left_pressed;
var c_right_pressed;

var isGameOver = false;


// game state ------------------------------------------------------------------
RoboBattleStates.Game = function(){};

RoboBattleStates.Game.prototype = {
    player_name: null,

    pad: null,
    stick: null,
    buttonF: null,

    init: function(name) {
        this.player_name = name || 'no name';
    },

    create: function() {
        // this.stage.disableVisibilityChange = true;

        isGameOver = false;
        score = 10;

        this.physics.startSystem(Phaser.Physics.ARCADE);
        // this.physics.startSystem(Phaser.Physics.P2JS);
        // this.physics.p2.gravity.y = 1200;
        // this.physics.p2.friction = 5;

        this.add.tileSprite(0, 0, world_W, world_H, 'background');
        this.world.setBounds(0, 0, world_W, world_H);

        platforms = this.add.group();
        platforms.enableBody = true;

        // platforms -----------------------------------------------------------
        var floor = platforms.create(0, 0, 'platform');
        floor.scale.setTo(10, 0.4);
        floor.body.immovable = true;

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

        // bullets -------------------------------------------------------------
        bullets = this.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        bullets.createMultiple(10, 'bullet');
        bullets.setAll('anchor.x', 0.5);
        bullets.setAll('anchor.y', 0.5);
        bullets.setAll('outOfBoundsKill', true);
        bullets.setAll('checkWorldBounds', true);

        // player --------------------------------------------------------------
        player_group = this.add.group();
        var x_loc = Math.floor(Math.random() * 100000) % (world_W - 100) + 50;
        var y_loc = Math.floor(Math.random() * 100000) % (world_W - 50) + 25;
        player = player_group.create(x_loc, y_loc, 'player');
        this.physics.arcade.enable(player);

        player.body.bounce.y = 0.1;
        player.body.gravity.y = player_gravity;
        player.body.collideWorldBounds = true;

        player.animations.add('left', [0, 1], 10, true);
        player.animations.add('right', [2, 3], 10, true);
        player.scale.setTo(player_scale, player_scale);
        player.anchor.set(0.5);

        name_text = this.add.text(player.x, player.y - 30 * player_scale, this.player_name);
        name_text.font = 'Arial';
        name_text.fontSize = 18;
        name_text.fill = '#101213';
        name_text.anchor.set(0.5);

        player_group.add(name_text);

        no_bullets = this.add.group();
        no_bullets.enableBody = true;
        no_bullets.physicsBodyType = Phaser.Physics.ARCADE;
        no_bullets.createMultiple(1, 'no_bullets');
        no_bullets.setAll('anchor.x', 0.5);
        no_bullets.setAll('anchor.y', 1);
        no_bullets.setAll('outOfBoundsKill', true);
        no_bullets.setAll('checkWorldBounds', true);

        get_items = this.add.group();
        get_items.enableBody = true;
        get_items.physicsBodyType = Phaser.Physics.ARCADE;
        get_items.createMultiple(5, 'item');
        get_items.setAll('scale.x', 0.6);
        get_items.setAll('scale.y', 0.6);
        get_items.setAll('anchor.x', 0.5);
        get_items.setAll('anchor.y', 1);
        get_items.setAll('outOfBoundsKill', true);
        get_items.setAll('checkWorldBounds', true);

        // probes --------------------------------------------------------------
        probes = this.add.group();
        probes.enableBody = true;

        for (var i = 0; i < 60; i++) {
            this.addProbe();
        }

        // items ---------------------------------------------------------------
        items = this.add.group();
        items.enableBody = true;

        for (var i = 0; i < 25; i++) {
            this.addItem();
        }

        // texts ---------------------------------------------------------------
        score_text = this.add.text(28, 18, score);
        score_text.font = 'Arial';
        score_text.fontSize = 52;
        score_text.fill = '#f0f2f3';
        score_text.align = 'center';
        score_text.stroke = '#101213';
        score_text.strokeThickness = 8;
        score_text.fixedToCamera = true;

        // controller ----------------------------------------------------------

        // this.add.button(game, x, y, 
        //                 key, callback, callbackContext,
        //                 overFrame, outFrame, downFrame, upFrame
        c_fire = this.add.button(this.game.width - 40, this.game.height - 40,
                                 'c_fire', null, this,
                                 1, 0, 1, 0);
        c_fire.scale.setTo(1.2, 1.2);
        c_fire.fixedToCamera = true;
        c_fire.anchor.set(1);
        c_fire.events.onInputOver.add(this.fireBullet, this);
        c_fire.events.onInputDown.add(this.fireBullet, this);

        c_up = this.add.button(99, this.game.height - 163,
                               'c_up', null, this,
                               1, 0, 1, 0);
        c_up.fixedToCamera = true;
        c_up.scale.setTo(1.1, 1.1);
        c_up.anchor.set(0, 1);
        c_up.events.onInputOver.add(function(){ c_up_pressed = true }, this);
        c_up.events.onInputDown.add(function(){ c_up_pressed = true }, this);
        c_up.events.onInputOut.add(function(){ c_up_pressed = false }, this);
        c_up.events.onInputUp.add(function(){ c_up_pressed = false }, this);

        c_down = this.add.button(99, this.game.height - 17,
                                 'c_down', null, this,
                                 1, 0, 1, 0);
        c_down.fixedToCamera = true;
        c_down.scale.setTo(1.1, 1.1);
        c_down.anchor.set(0, 1);
        c_down.events.onInputOver.add(function(){ c_down_pressed = true }, this);
        c_down.events.onInputDown.add(function(){ c_down_pressed = true }, this);
        c_down.events.onInputOut.add(function(){ c_down_pressed = false }, this);
        c_down.events.onInputUp.add(function(){ c_down_pressed = false }, this);

        c_left = this.add.button(15, this.game.height - 90,
                                 'c_left', null, this,
                                 1, 0, 1, 0);
        c_left.fixedToCamera = true;
        c_left.scale.setTo(1.1, 1.1);
        c_left.anchor.set(0, 1);
        c_left.events.onInputOver.add(function(){ c_left_pressed = true }, this);
        c_left.events.onInputDown.add(function(){ c_left_pressed = true }, this);
        c_left.events.onInputOut.add(function(){ c_left_pressed = false }, this);
        c_left.events.onInputUp.add(function(){ c_left_pressed = false }, this);

        c_right = this.add.button(134, this.game.height - 90,
                                 'c_right', null, this,
                                 1, 0, 1, 0);
        c_right.fixedToCamera = true;
        c_right.scale.setTo(1.1, 1.1);
        c_right.anchor.set(0, 1);
        c_right.events.onInputOver.add(function(){ c_right_pressed = true }, this);
        c_right.events.onInputDown.add(function(){ c_right_pressed = true }, this);
        c_right.events.onInputOut.add(function(){ c_right_pressed = false }, this);
        c_right.events.onInputUp.add(function(){ c_right_pressed = false }, this);


        // settings ------------------------------------------------------------
        cursors = this.input.keyboard.createCursorKeys();
        bt_fire = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

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

        update_count += 1;
        if (update_count > 30)
        {
            this.setProbes();
            update_count = 0;
        }

        if (isGameOver == false)
        {
            if (cursors.left.isDown || c_left_pressed)
            {
                player.body.velocity.x = -player_max_vel;
                player.animations.play('left');
                cur_direction = 0;
            }
            else if (cursors.right.isDown || c_right_pressed)
            {
                player.body.velocity.x = player_max_vel;
                player.animations.play('right');
                cur_direction = 1;
            }
            else
            {
                player.animations.stop();
                if (cur_direction == 0)
                {
                    player.frame = 0;
                }
                else
                {
                    player.frame = 2;
                }
            }

            if (bt_fire.isDown)
            {
                this.fireBullet();
            }
            
            if ((cursors.up.isDown || c_up_pressed) && player.body.touching.down)
            {
                player.body.velocity.y = player_y_vel;
            }

            if ((cursors.down.isDown || c_down_pressed) && player.body.touching.down && player.y < world_H - 100)
            {
                player.body.y = player.body.y + 5;
            }
        }

        name_text.x = player.x;
        name_text.y = player.y - 30 * player_scale;
    },

    gameOver: function() {
        isGameOver = true;

        this.game.state.start('Menu', true, false, score, this.player_name);
    },

    collectItem: function(player, item) {
        item.kill();

        var itemIcon = get_items.getFirstExists(false);

        if (itemIcon)
        {
            itemIcon.reset(player.x + (23 * player_scale), player.y - 5);
            itemIcon.body.velocity.y = -110;
            itemIcon.lifespan = 200;
        }

        score += 1;
        score_text.text = score;

        this.addItem();
    },

    addItem: function() {
        if (items.children.length < 150) 
        {
            var x_loc = (Math.random() * world_W * 10) % (world_W + 140) - 70;
            var y_loc = Math.floor((Math.random() * num_floors * 10) % (num_floors - 1)) * floor_height + 50;

            var item = items.create(x_loc, y_loc, 'item');
            item.scale.setTo(1, 1);
            item.body.velocity.y = -110;
            item.body.gravity.y = 1100;
            item.body.bounce.y = 0.45 + Math.random() * 0.2;
            item.anchor.set(0.5);
        }
    },

    addItemAt: function(x, y) {
        var x_loc = x + (Math.floor(Math.random() * 300) - 150);
        var y_loc = y - (Math.floor(Math.random() * 100) - 20);
        var y_vel = Math.floor(Math.random() * 300) + 100;

        if (x_loc < 70) {
            x_loc = 70;
        }
        else if (x_loc > world_W - 70) {
            x_loc = world_W - 70;
        }
        if (y_loc < 70) {
            y_loc = 70;
        }
        else if (y_loc > world_H - 70) {
            y_loc = world_H - 70;
        }

        var item = items.create(x_loc, y_loc, 'item');
        item.scale.setTo(1, 1);
        item.body.velocity.y = -110;
        item.body.gravity.y = 1100;
        item.body.bounce.y = 0.45 + Math.random() * 0.2;
        item.anchor.set(0.5);
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
        var x_loc = (Math.random() * world_W * 10) % (world_W - 100) + 50;
        var y_loc = Math.floor((Math.random() * num_floors * 10) % (num_floors - 1)) * floor_height + 50;

        var probe = probes.create(x_loc, y_loc, 'probe');
        probe.scale.setTo(probes_scale, probes_scale);
        probe.body.gravity.y = 200;
        probe.body.bounce.y = 0.30 + Math.random() * 0.2;
        probe.body.velocity.x = Math.random() * 200 - 100;
        probe.body.velocity.y = -50;
        probe.anchor.set(0.5);

        probe.animations.add('left', [0, 1], 10, true);
        probe.animations.add('right', [2, 3], 10, true);
    },

    setProbes: function() {
        for (var i = 0, len = probes.children.length; i < len; i++)
        {
            probe = probes.children[i];
            probe.body.velocity.x += Math.random() * 200 - 100;
            if (probe.body.velocity.x > probes_max_vel) {
                probe.body.velocity.x = probes_max_vel;
            }
            else if (probe.body.velocity.x < -probes_max_vel) {
                probe.body.velocity.x = -probes_max_vel;
            }

            if (probe.body.velocity.x < -50) {
                probe.animations.play('left');
            }
            else if (probe.body.velocity.x > 50) {
                probe.animations.play('right');
            }

            if (probe.x < 48) {
                probe.x = world_W - 48;
            }
            else if (probe.x > world_W - 48) {
                probe.x = 48;
            }
        }
    },

    fireBullet: function() {
        if (this.time.now > bullet_timer)
        {
            var bullet = bullets.getFirstExists(false);

            if (bullet && score > 0)
            {
                if (cur_direction == 0)
                {
                    bullet.reset(player.x - 36 * player_scale, player.y + 1 * player_scale);
                    bullet.angle = -90;
                    bullet.body.velocity.x = -bullet_speed;
                    bullet.lifespan = bullet_lifespan;
                }
                else
                {
                    bullet.reset(player.x + 36 * player_scale, player.y + 1 * player_scale);
                    bullet.angle = 90;
                    bullet.body.velocity.x = bullet_speed;
                    bullet.lifespan = bullet_lifespan;
                }

                bullet_timer = this.time.now + bullet_spacing;

                score -= 1;
                score_text.text = score;
            }
            else
            {
                var msgItem = no_bullets.getFirstExists(false);

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
