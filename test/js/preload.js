var RoboBattleStates = RoboBattleStates || {};

RoboBattleStates.Preload = function(){};

RoboBattleStates.Preload.prototype = {
  preload: function() { 
    this.splash = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
    this.splash.anchor.setTo(0.5);

    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 128, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);

    this.load.setPreloadSprite(this.preloadBar);

    this.load.image('background', 'assets/bg_floors.png');
    this.load.image('profile', 'assets/profile.png');
    this.load.spritesheet('button', 'assets/button.png', 160, 52);

    this.load.spritesheet('player', 'assets/robot.png', 46, 38);
    this.load.spritesheet('probe', 'assets/probe.png', 24, 24);

    this.load.image('platform', 'assets/platform.png');
    this.load.image('item', 'assets/nut.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('no_bullets', 'assets/no_bullets.png');

    this.load.spritesheet('c_up', 'assets/c_up.png', 70, 70);
    this.load.spritesheet('c_down', 'assets/c_down.png', 70, 70);
    this.load.spritesheet('c_left', 'assets/c_left.png', 114, 70);
    this.load.spritesheet('c_right', 'assets/c_right.png', 114, 70);

    this.load.spritesheet('c_fire', 'assets/c_fire.png', 108, 108);
  },
  create: function() {
    this.state.start('Menu');
  },
};