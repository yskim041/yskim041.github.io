RoboBattleStates.Menu = function(){};

var database;

var input;
var guide_text;

var highscore;
var highscore_text;

var game_obj;

RoboBattleStates.Menu.prototype = {

  fireBtn: null,
  nickname: '',

  init: function(score, nickname) {
    var score = score || 0;
    highscore = highscore || 0;
    highscore = Math.max(score, highscore);

    this.nickname = nickname || '';

    if (this.nickname.length > 0) {
      database.ref('game/map/user/' + this.nickname).set({});
      database.ref('game/map/rank/' + this.nickname).set(null);
    }
  },

  create: function() {
    game_obj = this;

    var user_name = 'Anonymous';

    this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
    this.background.autoScroll(-20, 0);

    var profile_img = this.add.sprite(20, 20, 'profile');
    profile_img.anchor.setTo(0.5);

    var user_name_text = this.add.text(42, 23, user_name,
                                       { font: "16px Arial", fill: "#202223" });
    user_name_text.anchor.set(0, 0.5);

    var logo = this.add.sprite(this.game.width/2, this.game.height/2 - 120, 'logo');
    logo.anchor.setTo(0.5);

    guide_text = this.add.text(this.game.width/2, this.game.height/2 - 50,
                               "This nickname is taken.",
                               { font: "16px Arial", fill: "#101213", align: "center" });
    guide_text.anchor.set(0.5);
    guide_text.visible = false;

    input = this.add.inputField(this.game.width / 2 - 92, this.game.height / 2 - 40,
    {
      font: '20px Arial',
      fill: '#212325',
      width: 160,
      padding: 12,
      borderWidth: 2,
      borderColor: '#101213',
      backgroundColor: '#f0f0f0',
      borderRadius: 10,
      placeHolder: 'Nickname',
      min: 1,
      max: 8,
      zoom: true
    });
    input.focusIn.add(function(){guide_text.visible = false;}, this);
    input.focusOut.add(game_obj.clearInput);
    input.setText(this.nickname);

    var button = this.add.button(this.game.width/2, this.game.height/2 + 50, 'button', this.buttonOnClick, this, 2, 1, 0);
    button.onInputOver.add(this.buttonOver, this);
    button.onInputOut.add(this.buttonOut, this);
    button.onInputUp.add(this.buttonUp, this);
    button.anchor.set(0.5);

    highscore_text = this.add.text(this.game.width/2, this.game.height/2 + 100,
                                   "High Score:  " + highscore,
                                   { font: "20px Arial", fill: "#101213", align: "center" });
    highscore_text.anchor.set(0.5);

    fireBtn = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    database = firebase.database();

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        user_name = uid;

        // console.log('uid: ' + uid);
        var current_user = firebase.auth().currentUser;
        // console.log('current_user: ' + current_user);
        user_name_text.text = uid.substring(0, 10);

        database.ref('user/' + uid).once('value').then(function(snapshot) {
          var last_highscore = 0;
          if (snapshot.val() != null) {
            last_highscore = snapshot.val().highscore;
          }
          if (last_highscore < highscore) {
            database.ref('user/' + uid).set( {
              highscore: highscore
            });
          } else {
            highscore = last_highscore;
            highscore_text.text = 'High Score:  ' + highscore;
          }
        });

      } else {
        firebase.auth().signInAnonymously().catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          if (errorCode === 'auth/operation-not-allowed') {
            alert('You must enable Anonymous auth in the Firebase Console.');
          } else {
            console.error(error);
          }
        });
      }
    });
  },

  buttonUp: function() {

  },

  buttonOver: function() {

  },

  buttonOut: function() {

  },

  buttonOnClick: function() {
    this.checkNickname();
  },

  update: function() {
    // if(this.game.input.activePointer.justPressed()) {
    if (fireBtn.isDown) {
      this.checkNickname();
    }
  },

  clearInput: function() {
    t_input = input.value;
    t_input = t_input.replace(/[ $.='"\\/;|&:()]/g, '');

    input.setText(t_input);
  },

  checkNickname: function() {
    this.clearInput();
    nickname = input.value;

    if (nickname != null && nickname.length > 0) {
      database.ref('game/map/user/' + nickname).once('value').then(function(snapshot) {
        var users = snapshot.val();
        // console.log(users);
        if (users != null) {
          guide_text.text = "This nickname is taken.";
          guide_text.visible = true;
        } else {
          database.ref('game/map/user/' + nickname).set([-1, -1]);
          game_obj.game.state.start('Game', true, false, nickname); 
        }
      });

    } else {
      guide_text.text = "Input your nickname.";
      guide_text.visible = true;
    }
  }
};