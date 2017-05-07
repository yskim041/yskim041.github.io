var RoboBattleStates = RoboBattleStates || {};

// winW = window.innerWidth * window.devicePixelRatio;
// winH = window.innerHeight * window.devicePixelRatio;

RoboBattleStates.game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, '');

RoboBattleStates.game.state.add('Boot', RoboBattleStates.Boot);
RoboBattleStates.game.state.add('Preload', RoboBattleStates.Preload);
RoboBattleStates.game.state.add('Menu', RoboBattleStates.Menu);
RoboBattleStates.game.state.add('Game', RoboBattleStates.Game);

RoboBattleStates.game.state.start('Boot');
