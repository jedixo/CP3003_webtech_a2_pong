/**
 * SOCKET.IO server
 */
var http = require('http').Server();
var io = require('socket.io')(http);
var port = 3000;
var debug = true;
var paddles = [0, 0];
var players = { p1: null, p2: null };
var spectators = [];

/**
 * listens for a connection to the server
 */
io.on('connection', function (socket) {

    /**
     * sends the client their player identifier
     */
    if (players.p1 === null) {
        players.p1 = socket;
        socket.emit("getPlayerNumber", 1);
        log("player 1 has joined.");
        if (players.p2 !== null) {
            log("game commencing");
            io.emit("play", true);
        }
    } else if (players.p2 === null) {
        players.p2 = socket;
        socket.emit("getPlayerNumber", 2);
        log("player 2 has joined.");
        log("game commencing");
        io.emit("play", true);
    } else {
        spectators.push(socket);
        socket.emit("getPlayerNumber", 3);
        log("spectator has joined.");
    }


    /**
     * listens for a client disconection and removes them from active clients listen
     * 
     * problems: refresshing the page with more than one client connection stuffs everything up
     */
    socket.on('disconnect', function () {
        if (socket === players.p1) {
            io.emit("disconection", 0);
            players.p1 = null;
            log("player 1 has disconected, halting game");
        } else if (socket === players.p2) {
            io.emit("disconection", 1);
            players.p2 = null;
            log("player 2 has disconected, halting game");
        } else {
            spectators.splice(spectators.indexOf(socket.id), 1);
        }
    });

    /**
     * listens for the ball objects from player 1 and sends them to all other clients
     */
    players.p1.on("balls", function (balls) {
        io.emit("ball", balls);
    });

    /**
     * listens for the hud object from player 1 and sends it to all other clients
     *
     * could be optimized like the paddles class
     */
    socket.on("hud", function (hud) {
        log("hud update p1: " + hud.scores.p1 + " p2: " + hud.scores.p2 + " message: " + hud.message);
        io.emit("hud", hud);
    });

    /**
     * receives and sends paddle objects between all clients
     *
     * controls what data is sent to what client
     */
    socket.on("paddles", function (paddle) {
        if (players.p1 !== null && players.p2 !== null && players.p1 === socket) {
            paddles[0] = paddle;
            players.p2.emit("paddles", [paddles[0]]);
        } else if (players.p1 !== null && players.p2 !== null && players.p2 === socket) {
            paddles[1] = paddle;
            players.p1.emit("paddles", [paddles[1]]);
        }

        if (spectators.length > 0) {
            for (i = 0; i < spectators.length; i++) {
                spectators[i].emit("paddles", paddles);
            }
        }
    });

    /**
     * controlls the pausing of the game between all the clients
     */
    socket.on("pause", function (state) {
        io.emit("pause", state);
    });

    /**
     * handles the passing of powerups between each client
     */
    socket.on("powerUp", function (powerup) {
        if (players.p1 !== null && players.p2 !== null && players.p1 === socket) {
            //p1 collected a powerup
            players.p2.emit("powerUp", powerup);
        } else if (players.p1 !== null && players.p2 !== null && players.p2 === socket) {
            //p2 collected a powerup
            players.p1.emit("powerup", powerup);
        }

        if (spectators.length > 0) {
            for (i = 0; i < spectators.length; i++) {
                spectators[i].emit("powerUp", powerup);
            }
        }
    });
});

/**
 * listens for a request on the port
 */
http.listen(port, function () {
    console.log('listening on *:' + port);
});

/**
 * debug function for logging
 */
function log(message) {
    if (debug) {
        console.log(message);
        io.emit("debug", message);
    }
}