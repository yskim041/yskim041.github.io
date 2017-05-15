var RoboBattleStates = RoboBattleStates || {};

RoboBattleStates.Preload = function(){};

RoboBattleStates.Preload.prototype = {
  preload: function() { 
    this.splash = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
    this.splash.anchor.setTo(0.5);

    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 128, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);

    this.load.setPreloadSprite(this.preloadBar);

    this.load.image('background', 'assets/imgs/bg_floors.png');
    this.load.image('profile', 'assets/imgs/profile.png');
    this.load.spritesheet('button', 'assets/imgs/button.png', 160, 52);
    this.load.spritesheet('sound', 'assets/imgs/sound.png', 55, 48);

    this.load.spritesheet('player', 'assets/imgs/robot.png', 46, 38);
    this.load.spritesheet('probe', 'assets/imgs/probe.png', 24, 24);

    this.load.image('platform', 'assets/imgs/platform.png');
    this.load.image('item', 'assets/imgs/nut.png');
    this.load.image('bullet', 'assets/imgs/bullet.png');
    this.load.image('no_bullets', 'assets/imgs/no_bullets.png');
    this.load.image('fog', 'assets/imgs/fog.png');

    this.load.spritesheet('c_up', 'assets/imgs/c_up.png', 70, 70);
    this.load.spritesheet('c_down', 'assets/imgs/c_down.png', 70, 70);
    this.load.spritesheet('c_left', 'assets/imgs/c_left.png', 114, 70);
    this.load.spritesheet('c_right', 'assets/imgs/c_right.png', 114, 70);

    this.load.spritesheet('c_fire', 'assets/imgs/c_fire.png', 108, 108);

    this.load.audio('fx_start', 'assets/sounds/fx_start.mp3');
    this.load.audio('fx_error', 'assets/sounds/fx_error.mp3');
    this.load.audio('fx_fire', 'assets/sounds/fx_fire.mp3');
    this.load.audio('fx_item', 'assets/sounds/fx_item.mp3');
    this.load.audio('fx_explosion', 'assets/sounds/fx_crash.mp3');
    this.load.audio('bgm_stage_normal', 'assets/sounds/bgm_stage_normal.mp3');
    this.load.audio('bgm_title', 'assets/sounds/bgm_title.mp3');
  },

  create: function() {
    this.state.start('Menu');
  },
};