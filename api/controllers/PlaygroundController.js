/*
| -------------------------------------------------------------------
|  MTGNode Playground Controller
| -------------------------------------------------------------------
|
|
|   Author : Yomguithereal
|   Version : 1.0
*/

// Index
exports.playground = function(req, res) {
  res.view('playground/playground', {id: req.param('id')});
}

// Debug route
exports.debug = function(req, res) {
  res.view('playground/playground', {id: 'debug'});
}

// Connection through socket.io
exports.connect = function(req, res) {
  var game_id = req.param('id');
  var user_id = req.session.user.id;

  Game.findOne(game_id).done(function(err, current_game){

    // Registering Player
    if (!current_game.player1.connected &&
        !current_game.hasPlayerWithId(user_id)) {

      current_game.player1 = {
        connected: true,
        user: req.session.user
      }

      Game.subscribe(req.socket, game_id);

      current_game.save(function(err, game) {
        res.json({player: 1, game: game});
      });
    }
    else if (!current_game.player2.connected &&
             !current_game.hasPlayerWithId(user_id)) {

      current_game.player2 = {
        connected: true,
        user: req.session.user
      }

      Game.subscribe(req.socket, game_id);

      current_game.save(function(err, game) {

        // Telling player that the game may start
        Game.publishUpdate(game_id, {start: true});

        res.json({player: 2, game: game});
      });
    }
    else {
      res.json({kicked: true});
    }

  });

}

// Socket.io standard messaging
exports.message = function(req, res) {

  // TODO: Message Control?

  // If debug mod is activated, we mirror the realtime messages
  if (req.param('debug')) {
    Game.publishUpdate(
      req.param('id'),
      {
        head: req.param('head'),
        body: req.param('body')
      }
    );
  }
  else {
    Game.publishUpdate(
      req.param('id'),
      {
        head: req.param('head'),
        body: req.param('body')
      },
      req.socket
    );
  }
}
