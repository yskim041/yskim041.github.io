RoboBattleStates.Menu = function(){};
 
RoboBattleStates.Menu.prototype = {
  init: function(score) {
    var score = score || 0;
    this.highestScore = this.highestScore || 0;
 
    this.highestScore = Math.max(score, this.highestScore);
   },

  create: function() {
    //show the space tile, repeated
    this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
    
    //give it speed in x
    this.background.autoScroll(-20, 0);

    var logo = this.add.sprite(this.game.width/2, this.game.height/2 - 100, 'logo');
    logo.anchor.setTo(0.5);
 
    //start game text
    var text = "Tap to begin";
    var style = { font: "30px Arial", fill: "#111", align: "center" };
    var t = this.game.add.text(this.game.width/2, this.game.height/2, text, style);
    t.anchor.set(0.5);
 
    //highest score
    text = "Highest score: " + this.highestScore;
    style = { font: "15px Arial", fill: "#111", align: "center" };
  
    var h = this.game.add.text(this.game.width/2, this.game.height/2 + 50, text, style);
    h.anchor.set(0.5);
  },

  update: function() {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('Game');
    }
  }
};