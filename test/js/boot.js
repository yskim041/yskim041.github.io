var RoboBattleStates = RoboBattleStates || {};

RoboBattleStates.Boot = function(){};

RoboBattleStates.Boot.prototype = {
    preload: function() {

        this.load.image('logo', 'assets/logo.png');
        this.load.image('preloadbar', 'assets/preloader-bar.png');
        this.add.plugin(PhaserInput.Plugin);

        // this.load.script('webfont', "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js");
        // WebFontConfig = {
        //     active: function() { RoboBattleStates.game.time.events.add(Phaser.Timer.SECOND, createText, this); },
        //     google: {
        //       families: ['Allerta Stencil']
        //     }
        // };
    },

    create: function() {
        if (!game.device.desktop){ game.input.onDown.add(gofull, this); }
        
        this.game.stage.backgroundColor = '#fff';

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.minWidth = 240;
        this.scale.minHeight = 170;
        this.scale.maxWidth = 2880;
        this.scale.maxHeight = 1920;
        this.scale.pageAlignHorizontally = true;
        
        this.scale.refresh();

        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.state.start('Preload');
    }
};