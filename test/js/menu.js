RoboBattleStates.Menu = function(){};

var database;

var input;
var guide_text;

var highscore;
var highscore_text;

var game_obj;

var bgm;
var fx_start;
var fx_error;

var sound_setting;
var is_sound_on = true;


RoboBattleStates.Menu.prototype = {

  fireBtn: null,
  nickname: '',

  init: function(score, nickname, sound) {
    var score = score || 0;
    highscore = highscore || 0;
    highscore = Math.max(score, highscore);

    this.nickname = nickname || '';

    if (this.nickname.length > 0) {
      database.ref('game/map/vel/' + this.nickname).set({});
      database.ref('game/map/loc/' + this.nickname).set({});
      database.ref('game/map/rank/' + this.nickname).set(null);
      database.ref('game/map/bullet/' + this.nickname).set({});
    }

    is_sound_on = sound;
    if (is_sound_on == null) {
      is_sound_on = true;
    }
  },

  create: function() {
    game_obj = this;

    bgm = this.add.audio('bgm_title');
    fx_start = this.add.audio('fx_start');
    fx_error = this.add.audio('fx_error');

    // this.sound.setDecodedCallback([ bgm, fx_start, fx_error ], null, this);

    var user_name = 'Anonymous';

    this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
    this.background.autoScroll(-20, 0);

    var profile_img = this.add.sprite(20, 20, 'profile');
    profile_img.anchor.setTo(0, 0);

    var user_name_text = this.add.text(56, 25, user_name,
                                       { font: "16px Arial", fill: "#202223" });
    user_name_text.anchor.set(0, 0);

    sound_setting = this.add.sprite(this.game.width - 20, 20, 'sound');
    sound_setting.anchor.set(1, 0);
    sound_setting.scale.setTo(0.8, 0.8);
    sound_setting.inputEnabled = true;
    sound_setting.events.onInputDown.add(this.soundOnClick, this);

    this.setSound(is_sound_on);

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
      zoom: false
    });
    input.focusIn.add(function(){guide_text.visible = false;}, this);
    input.focusOut.add(game_obj.clearInput);
    input.setText(this.nickname);

    var button = this.add.button(this.game.width/2, this.game.height/2 + 50, 'button', this.buttonOnClick, this, 2, 1, 0);
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

  setSound: function(is_on) {
    if (is_on) {
      fx_start.volume = 0.8;
      fx_error.volume = 0.8;
      bgm.volume = 0.45;
      bgm.loopFull();

      is_sound_on = true;
      sound_setting.frame = 0;

    } else {
      fx_start.volume = 0;
      fx_error.volume = 0;
      bgm.volume = 0;
      bgm.stop();

      is_sound_on = false;
      sound_setting.frame = 1;
    }
  },

  soundOnClick: function() {
    if (is_sound_on) {
      this.setSound(false);

    } else {
      this.setSound(true);
    }
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
    t_input = t_input.replace(/[ $%.='"\\/;|&:()]/g, '');

    input.setText(t_input);
  },

  checkNickname: function() {
    this.clearInput();
    nickname = input.value;

    if (nickname != null && nickname.length > 0) {
      database.ref('game/map/loc/' + nickname).once('value').then(function(snapshot) {
        var users = snapshot.val();
        // console.log(users);
        if (users != null) {
          guide_text.text = "This nickname is taken.";
          guide_text.visible = true;
        } else {
          fx_start.play();
          bgm.stop();
          database.ref('game/map/loc/' + nickname).set([-1, -1]);
          game_obj.game.state.start('Game', true, false, nickname, is_sound_on); 
          return;
        }
      });

    } else {
      guide_text.text = "Input your nickname.";
      guide_text.visible = true;
      fx_error.play();
    }

    console.log('error');
  }
};