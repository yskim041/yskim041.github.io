var RoboBattleStates = RoboBattleStates || {};
 
RoboBattleStates.Boot = function(){};
 
//setting game configuration and loading the assets for the loading screen
RoboBattleStates.Boot.prototype = {
  preload: function() {
    //assets we'll use in the loading screen
    this.load.image('logo', 'assets/logo.png');
    this.load.image('preloadbar', 'assets/preloader-bar.png');

    this.load.script('webfont', "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js");
    WebFontConfig = {
        active: function() { RoboBattleStates.game.time.events.add(Phaser.Timer.SECOND, createText, this); },
        google: {
          families: ['Allerta Stencil']
        }
    };
  },

  create: function() {
    //loading screen will have a white background
    this.game.stage.backgroundColor = '#fff';
 
    //scaling options
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.minWidth = 240;
    this.scale.minHeight = 170;
    this.scale.maxWidth = 2880;
    this.scale.maxHeight = 1920;
    
    //have the game centered horizontally
    this.scale.pageAlignHorizontally = true;
 
    //screen size will be set automatically
    this.scale.setScreenSize(true);
 
    //physics system for movement
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    
    this.state.start('Preload');
  }
};