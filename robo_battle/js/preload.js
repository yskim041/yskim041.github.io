var RoboBattleStates = RoboBattleStates || {};
 
//loading the game assets
RoboBattleStates.Preload = function(){};

WebFontConfig = {
    active: function() { RoboBattleStates.game.time.events.add(Phaser.Timer.SECOND, createText, this); },
    google: {
      families: ['Allerta Stencil']
    }
};
 
RoboBattleStates.Preload.prototype = {
  preload: function() {
    //show logo in loading screen
    this.splash = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
    this.splash.anchor.setTo(0.5);
 
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 128, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);
 
    this.load.setPreloadSprite(this.preloadBar);
 
    //load game assets
    this.load.script('webfont', "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js");

    this.load.image('background', 'assets/bg_floors.png');
    this.load.spritesheet('player', 'assets/robot.png', 46, 38);
    this.load.spritesheet('probe', 'assets/probe.png', 24, 24);

    this.load.image('platform', 'assets/platform.png');
    this.load.image('item', 'assets/nut.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('no_bullets', 'assets/no_bullets.png');
  },
  create: function() {
    this.state.start('Menu');
  }
};