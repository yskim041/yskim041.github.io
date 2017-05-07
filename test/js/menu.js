RoboBattleStates.Menu = function(){};

var input;

RoboBattleStates.Menu.prototype = {

    fireBtn: null,
    highestScore: 0,
    nickname: '',

    init: function(score, nickname) {
        var score = score || 0;
        this.highestScore = this.highestScore || 0;
        this.highestScore = Math.max(score, this.highestScore);

        this.nickname = nickname || '';
    },

    create: function() {
        this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
        this.background.autoScroll(-20, 0);

        var logo = this.add.sprite(this.game.width/2, this.game.height/2 - 120, 'logo');
        logo.anchor.setTo(0.5);

        input = this.add.inputField(this.game.width / 2 - 85, this.game.height / 2 - 40,
                                        {
                                            font: '20px Arial',
                                            fill: '#212325',
                                            width: 150,
                                            padding: 10,
                                            borderWidth: 2,
                                            borderColor: '#101213',
                                            backgroundColor: '#f0f0f0',
                                            borderRadius: 10,
                                            placeHolder: 'Nickname',
                                            min: 1,
                                            max: 8,
                                            zoom: true
                                        });
        input.setText(this.nickname);

        var button = this.add.button(this.game.width/2, this.game.height/2 + 50, 'button', this.buttonOnClick, this, 2, 1, 0);
        button.onInputOver.add(this.buttonOver, this);
        button.onInputOut.add(this.buttonOut, this);
        button.onInputUp.add(this.buttonUp, this);
        button.anchor.set(0.5);

        var text = "High Score:  " + this.highestScore;
        var style = { font: "20px Arial", fill: "#101213", align: "center" };
        var h = this.add.text(this.game.width/2, this.game.height/2 + 100, text, style);
        h.anchor.set(0.5);

        fireBtn = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    },

    buttonUp: function() {

    },

    buttonOver: function() {

    },

    buttonOut: function() {

    },

    buttonOnClick: function() {
        if (input.value.length > 0) {
           this.game.state.start('Game', true, false, input.value); 
        }
    },

    update: function() {
        // if(this.game.input.activePointer.justPressed() || fireBtn.isDown) {
        if (fireBtn.isDown && input.value.length > 0) {
            this.game.state.start('Game', true, false, input.value);
        }
    }
};