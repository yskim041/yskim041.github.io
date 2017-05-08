var RoboBattleStates = RoboBattleStates || {};

// variables -------------------------------------------------------------------
var world_W = 2400;
var world_H = 3610;

var platforms;
var floor_height = 120;
var cur_floor = 0;
var num_floors = world_H / floor_height + 1;

var player;
var player_scale = 1.3;
var player_gravity = 1300;
var player_max_vel = 300;
var player_y_vel = -580;
var cur_direction = -1;

var opponents_group;
var opponents;
var opponents_names;

var prev_x = 0;
var prev_y = 0;
var prev_d = 0;
var prev_score = 0;

var nickname;
var name_text;
var top5_text;

var bullets;
var bullet_timer = 0;
var no_bullets;
var get_items;

var bullet_speed = 780;
var bullet_spacing = 200;
var bullet_lifespan = 600;

var items;
var probes;
var probes_scale = 1.3;
var probes_max_vel = 500;
var update_count = 0;

var score = 10;
var score_text;

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

var database;
var game_obj;


// game state ------------------------------------------------------------------
RoboBattleStates.Game = function(){};

RoboBattleStates.Game.prototype = {
  pad: null,
  stick: null,

  init: function(name) {
    nickname = name || 'no name';
  },

  create: function() {
    this.stage.disableVisibilityChange = true;

    game_obj = this;

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

    // platforms ---------------------------------------------------------------
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

    // bullets -----------------------------------------------------------------
    bullets = this.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(10, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    // player ------------------------------------------------------------------
    var x_loc = Math.floor(Math.random() * 100000) % (world_W - 100) + 50;
    var y_loc = Math.floor(Math.random() * 100000) % (world_W - 50) + 25;
    player = this.add.sprite(x_loc, y_loc, 'player');
    this.physics.arcade.enable(player);

    player.body.bounce.y = 0.1;
    player.body.gravity.y = player_gravity;
    player.body.collideWorldBounds = true;

    player.animations.add('left', [0, 1], 10, true);
    player.animations.add('right', [2, 3], 10, true);
    player.scale.setTo(player_scale, player_scale);
    player.anchor.set(0.5);

    name_text = this.add.text(player.x, player.y - 30 * player_scale, nickname);
    name_text.font = 'Arial';
    name_text.fontSize = 18;
    name_text.fill = '#101213';
    name_text.anchor.set(0.5);

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

    // opponents ---------------------------------------------------------------
    opponents_group = this.add.group();
    opponents_group.enableBody = true;
    opponents = [];
    opponents_names = [];

    // probes ------------------------------------------------------------------
    probes = this.add.group();
    probes.enableBody = true;

    for (var i = 0; i < 50; i++) {
      this.addProbe();
    }

    // items -------------------------------------------------------------------
    items = this.add.group();
    items.enableBody = true;

    for (var i = 0; i < 25; i++) {
      this.addItem();
    }

    // texts -------------------------------------------------------------------
    score_text = this.add.text(28, 18, score, 
                               { font: '52px Arial', fill: '#f0f2f3',
                                 stroke: '#101213', strokeThickness: 8,
                                 align: 'center'});
    score_text.fixedToCamera = true;

    top5_text = this.add.group();
    var t5_style = { font: '14px Arial', fill: '#f0f2f3',
                     stroke: '#101213', strokeThickness: 4,
                     fixedToCamera: true };
    var rank_title = this.add.text(this.game.width - 210, 10,
                                   'TOP 5  ', t5_style);
    rank_title.anchor.set(1, 0);
    rank_title.fixedToCamera = true;

    for (var i=0; i<5; i++) {
      var rank_name = this.add.text(this.game.width - 100, 10 + 18 * i,
                                    '-'.substring(0, 8), t5_style);
      rank_name.anchor.set(1, 0);
      rank_name.fixedToCamera = true;
      top5_text.add(rank_name);
      var rank_score = this.add.text(this.game.width - 10, 10 + 18 * i,
                                     '-', t5_style);
      rank_score.anchor.set(1, 0);
      rank_score.fixedToCamera = true;
      top5_text.add(rank_score);
    }

    // controller --------------------------------------------------------------

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
    // c_up.events.onInputDown.add(function(){ c_up_pressed = true }, this);
    c_up.events.onInputOut.add(function(){ c_up_pressed = false }, this);
    // c_up.events.onInputUp.add(function(){ c_up_pressed = false }, this);

    c_down = this.add.button(99, this.game.height - 17,
                             'c_down', null, this,
                             1, 0, 1, 0);
    c_down.fixedToCamera = true;
    c_down.scale.setTo(1.1, 1.1);
    c_down.anchor.set(0, 1);
    c_down.events.onInputOver.add(function(){ c_down_pressed = true }, this);
    // c_down.events.onInputDown.add(function(){ c_down_pressed = true }, this);
    c_down.events.onInputOut.add(function(){ c_down_pressed = false }, this);
    // c_down.events.onInputUp.add(function(){ c_down_pressed = false }, this);

    c_left = this.add.button(15, this.game.height - 90,
                             'c_left', null, this,
                             1, 0, 1, 0);
    c_left.fixedToCamera = true;
    c_left.scale.setTo(1.1, 1.1);
    c_left.anchor.set(0, 1);
    c_left.events.onInputOver.add(function(){ c_left_pressed = true }, this);
    // c_left.events.onInputDown.add(function(){ c_left_pressed = true }, this);
    c_left.events.onInputOut.add(function(){ c_left_pressed = false }, this);
    // c_left.events.onInputUp.add(function(){ c_left_pressed = false }, this);

    c_right = this.add.button(134, this.game.height - 90,
                              'c_right', null, this,
                              1, 0, 1, 0);
    c_right.fixedToCamera = true;
    c_right.scale.setTo(1.1, 1.1);
    c_right.anchor.set(0, 1);
    c_right.events.onInputOver.add(function(){ c_right_pressed = true }, this);
    // c_right.events.onInputDown.add(function(){ c_right_pressed = true }, this);
    c_right.events.onInputOut.add(function(){ c_right_pressed = false }, this);
    // c_right.events.onInputUp.add(function(){ c_right_pressed = false }, this);

    c_up_pressed = false;
    c_down_pressed = false;
    c_left_pressed = false;
    c_right_pressed = false;

    // settings ----------------------------------------------------------------
    cursors = this.input.keyboard.createCursorKeys();
    bt_fire = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    this.camera.follow(player);

    // database ----------------------------------------------------------------
    database = firebase.database();

    var opponent_ref = database.ref('game/map/user/');
    opponent_ref.on('child_changed', function(snapshot) {
      if (snapshot.key != nickname) {
        game_obj.update_opponent(snapshot);
      }
    });

    var rank_ref = database.ref('game/map/rank/').orderByValue().limitToLast(5);
    rank_ref.on('value', function(snapshot) {
      var rank = 4;
      snapshot.forEach(function(child) {
        game_obj.update_rank(child.key, child.val(), rank--);
      })
    });

    var off_ref = database.ref('game/map/user/');
    off_ref.on('child_removed', function(snapshot) {
      if (snapshot.key != nickname) {
        game_obj.delete_opponent(snapshot);
      }
    });

    // end of create -----------------------------------------------------------
  },

  update: function() {
    this.physics.arcade.collide(player, platforms);
    this.physics.arcade.collide(probes, platforms);
    this.physics.arcade.collide(items, platforms);
    // this.physics.arcade.collide(opponents_group, platforms);

    this.physics.arcade.overlap(bullets, probes, this.destroyProbe, null, this);
    this.physics.arcade.overlap(player, items, this.collectItem, null, this);
    this.physics.arcade.overlap(player, probes, this.gameOver, null, this);

    player.body.velocity.x = 0;

    update_count += 1;
    if (update_count > 30)
    {
      this.setProbes();
      update_count = 1;
    }

    if (isGameOver == false)
    {
      if (cursors.left.isDown || c_left_pressed)
      {
        player.body.velocity.x = -player_max_vel;
        player.animations.play('left');
        cur_direction = -1;
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
        if (cur_direction == -1)
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

    if (update_count % 2 == 0)
    {
      if (prev_x != player.x || prev_y != player.y || prev_d != cur_direction) 
      {
        this.db_update_location(player.x, player.y, cur_direction);
        prev_x = player.x;
        prev_y = player.y;
        prev_d = cur_direction;
      }
    }
  },

  gameOver: function() {
    isGameOver = true;
    this.game.state.start('Menu', true, false, score, nickname);
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
    this.addItem();

    score += 1;
    score_text.text = score;

    this.db_update_score(score);
  },

  addItem: function() {
    if (items.children.length < 150) 
    {
      var x_loc = (Math.random() * world_W * 10) % (world_W - 140) + 70;
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
      probe.body.velocity.x += Math.random() * 300 - 150;
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
        if (cur_direction == -1)
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

        this.db_update_score(score);
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
  },

  update_opponent: function(opponent) {
    var tx = opponent.val()[0];
    var ty = opponent.val()[1];
    var td = -1;
    if (tx > 0) {
      td = 1;
    }
    tx = Math.abs(tx);

    if (opponents[opponent.key] == null) {
      opp_bot = this.add.sprite(tx, ty, 'player');
      this.physics.arcade.enable(opp_bot);

      opp_bot.body.collideWorldBounds = true;

      opp_bot.animations.add('left', [0, 1], 10, true);
      opp_bot.animations.add('right', [2, 3], 10, true);
      opp_bot.scale.setTo(player_scale, player_scale);
      opp_bot.anchor.set(0.5);

      opp_name = this.add.text(opp_bot.x, opp_bot.y - 30 * player_scale,
                               opponent.key);
      opp_name.font = 'Arial';
      opp_name.fontSize = 18;
      opp_name.fill = '#101213';
      opp_name.anchor.set(0.5);

      opponents[opponent.key] = opp_bot;
      opponents_names[opponent.key] = opp_name;
    }

    opponents[opponent.key].x = tx;
    opponents[opponent.key].y = ty;
    opponents_names[opponent.key].x = tx;
    opponents_names[opponent.key].y = ty - 30 * player_scale;
    if (td == -1) {
      opponents[opponent.key].animations.play('left');
    } else {
      opponents[opponent.key].animations.play('right');
    }
  },

  delete_opponent: function(opponent) {
    opponents[opponent.key].kill();
    opponents[opponent.key] = null;
    opponents_names[opponent.key].destroy();
    opponents_names[opponent.key] = null;
  },

  update_rank: function(ranker_name, ranker_score, rank) {
    // console.log('rank: ', ranker_name, ranker_score, rank);
    t_name = top5_text.children[rank * 2];
    t_score = top5_text.children[rank * 2 + 1];

    t_name.text = ranker_name;
    t_score.text = ranker_score;
  },

  db_update_location: function(x, y, d) {
    x = Math.round(x) * d;
    y = Math.round(y);
    database.ref('game/map/user/' + nickname).set([x, y]);
  },

  db_update_score: function(score) {
    database.ref('game/map/rank/' + nickname).set(score);
  },
};

window.onbeforeunload = function(e) {
  database.ref('game/map/user/' + nickname).set({});
  database.ref('game/map/rank/' + nickname).set(null);
  return;
};
