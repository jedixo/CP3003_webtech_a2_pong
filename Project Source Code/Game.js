/** 
 * PONG REVISED game controller
 *
 *issues:
 */
var canvas = document.getElementById("pongCanvas");

/**
 * Function encapsulaiton so that clients can't modify the code in their browser
 */
(function () {

//var socket = io("http://1.120.153.146:3000"); // change this to server address. only use localhost if running lan
var socket = io("http://localhost:3000");
var player = 1;
var play = true;    //THIS SHOULD DEFAULT TO FALSE BUT IS TRUE FOR DEBUGGING W/O SERVER
var numOfBalls = 1;

var balls = [];
var paddles = [new Paddle(), new Paddle(canvas.width - 20, "#0000FF")];
var hud;
var ctx;

var powerup = null;
var powerupType = null;

var frame = 0;
var powerupOnScreen = false;

/**SOCKET.IO*/
/**
 * sets up the player number (p1, p2, x)
 * 
 * listens for the 'getPlayerNumber' command from the server
 * that passes the player's number via the msg variable
 */
socket.on('getPlayerNumber', function (msg) {
    player = msg;
    if (player > 2) {
        play = true;
    }
    console.log(player);
});

/**
 * receives the updated ball positon from the server for P2
 * 
 * waits for the "ball" command from the server and then
 * updates the position of p2 client's local balls
 * 
 * ISSUES: 
 * - may have trouble with multiballs
 * - is limited by JSON's inability to transfer functions
 */
socket.on("ball", function (ball) {
    if (player > 1) {
        while (balls.length < ball.length) {
            balls.push(new Ball());
        }
        for (var i = 0; i < ball.length; i++) {
            
            //balls.push(new Ball());
            balls[i].position = ball[i].position;
            balls[i].velocity = ball[i].velocity;
            balls[i].trailColour = ball[i].trailColour;
        }
    }
});

/**
 * waits for another player to join before initiating the game
 */
socket.on("play", function () {
    console.log("p2 has joined");
    play = true;
    reset();
});

/**
 * pauses the game if player 1 or two disconect from eachother
 * 
 * if a player disconects this listener will pause the game
 * and display a message to the other clients
 */
socket.on("disconection", function (msg) {
    play = false;
    hud.message = "player " + (msg + 1) + " disconected";
    hud.draw(ctx);
    hud.timer = 59;
});

/**
 * waits to receive paddle positional information from the server
 */
socket.on("paddles", function (paddlesS) {
    try {
        if (player === 2) {
            paddles[0].position.y = paddlesS[0].position.y;
        } else if (player === 1) {
            paddles[1].position.y = paddlesS[0].position.y;
        } else {
            paddles[0].position.y = paddlesS[0].position.y;
            paddles[1].position.y = paddlesS[1].position.y;
        }
    } catch (e) {
        //2nd paddle doesn't exist to server yet. using default
    }
});

/** 
 * receives the hud from clients
 */
socket.on("hud", function (newhud) {
    hud.scores.p1 = newhud.scores.p1;
    hud.scores.p2 = newhud.scores.p2;
    hud.message = newhud.message;
    hud.timer = newhud.timer;
    hud.draw(ctx);
});

/**
 * on receving a pause request, pauses the game
 */
socket.on("pause", function (state) {
    play = state;
});

/**
 * controls powerups (expand on this)
 */
socket.on("powerUp", function (pwrup) {
    if (pwrup.type === "mb") {
        powerup = new MultiBall(canvas.width / 2, canvas.height / 2, balls);
    } else {
        powerup = new FastBall(canvas.width / 2, canvas.height / 2, balls);
    }
    powerup.position.x = pwrup.position.x;
    powerup.position.y = pwrup.position.y;
});
/**SOCKET.IO */

/**
 * main game function
 * 
 * waits for the everything to load before running 
 */
window.onload = function () {
    ctx = canvas.getContext("2d");
    reset();
    hud.message = "waiting for P2";
    hud.timer = 59;
    hud.draw(ctx);



    /**
     * an event listener for the mouse that controlls the position
     * of the paddles
     * 
     * if the mouse moves this listener will update the respective
     * players paddle's y position
     */
    canvas.addEventListener('mousemove', function (evt) {
        if (player === 1) {
            Paddle = 0;
        } else if (player === 2) {
            Paddle = 1;
        } else {
            return;
        }
        var rect = canvas.getBoundingClientRect();
        paddles[Paddle].position.y = Math.round((evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height);

        //makes sure paddle doesn't go off screen
        if (paddles[Paddle].position.y < paddles[Paddle].dimensions.length / 100) {
            paddles[Paddle].position.y = paddles[Paddle].dimensions.length / 100;
        } else if (paddles[Paddle].position.y > canvas.height - paddles[Paddle].dimensions.length - paddles[Paddle].dimensions.length / 100) {
            paddles[Paddle].position.y = canvas.height - paddles[Paddle].dimensions.length - paddles[Paddle].dimensions.length / 100;
        }
        //sends paddle data to server
        socket.emit("paddles", paddles[Paddle]);
    });

    /**
     * an event listener for the keyboard
     *
     * can be used to add shortcuts to the game
     * currently controls the pause function
     */
    window.onkeyup = function (e) {
        if (player === 1 || player == 2) {
            var key = e.keyCode ? e.keyCode : e.which;
            if (key === 80 && play === true) { //80 = p
                hud.message = "paused";
                hud.timer = 55;
                hud.draw(ctx);
                socket.emit("hud", hud);
                play = false;
                socket.emit("pause", play);
            } else if (key === 80 && play === false) {
                play = true;
                socket.emit("pause", play);
            }
        }
    }

    /**
     * Main game loop
     * 
     * this function is called every frame
     */
    function game() {
        
        if (play) {
            //clears canvas
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            //check if powerup already on screen                            - DONE
            //if not have a random chance for a power up to appear          - DONE
            //if power up appears randomly selec from powerups dictionary   - DONE
            // control hit test and moving of power up
            //activate power up
            // after power up finished reset power up on screen to false
            //server sending

            paddles[0].draw(ctx);
            paddles[1].draw(ctx);
            hud.draw(ctx);

            if (powerup !== null) {
                socket.emit("powerUp", powerup);
                powerupOnScreen = true;
                powerup.move();
                powerup.draw(ctx);
            }

            //p1 controls game logic
            if (player === 1) {
                if (frame % 2 === 0) {
                    socket.emit("balls", balls);
                }
                //power ups controll goes here

                if (!powerupOnScreen && frame % 2 === 0) {
                    var random = Math.floor((Math.random() * 200) + 1);
                    //console.log(random);
                    if (random === 1) {
                        var powerUpRandom = Math.floor(Math.random() * 2) + 1;
                        if(powerUpRandom === 1){
                            powerup = new MultiBall(canvas.width / 2, canvas.height / 2, balls);
                            powerupType = "M";
                            console.log("MultiBall"); 
                        }else{
                            powerup = new FastBall(canvas.width / 2, canvas.height / 2, balls);
                            powerupType = "F";
                            console.log("FastBall");
                        }
                    }
                }
                
                //iterate across all balls in the game frame
                for (var i = 0; i < balls.length; ++i) {
                    
                    if(powerupOnScreen && powerup != null){
                        if(powerup.hitTest(balls[i].position.x, balls[i].position.y)){
                            if(powerupType === "M"){
                                powerup = null;
                                makeBalls(5, balls[i].position.x, balls[i].position.y);
                            }else{
                                powerup = null;
                                powerupOnScreen = false;
                                balls[i].increaseXspeed();
                                balls[i].increaseXspeed();
                                balls[i].increaseXspeed();
                            }
                            
                        }
                    }

                    //perform hitTest on both paddles 
                    for (var paddleNum = 0; paddleNum < 2; ++paddleNum) {
                        ballX = balls[i].position.x;
                        ballY = balls[i].position.y;
                        ballXVelocity = balls[i].velocity.x;

                        if (paddles[paddleNum].hitTest(ballX, ballY, paddleNum)) { //paddle has been hit by ball
                            balls[i].bounceX();
                            //if ball hits on the middle of the paddle then don't want to change y speed at all, 
                            //else bounce harder in that y direction
                            if (paddles[paddleNum].getHitPosition(balls[i].position.y) == 1) { //upper third hit
                                balls[i].increaseYspeed(); 
                            } else if (paddles[paddleNum].getHitPosition(balls[i].position.y) == 3) { //lower third hit
                                balls[i].increaseYspeed();
                            }
                            balls[i].increaseXspeed();
                        }
                    }

                    balls[i].draw(ctx);

                    if (balls[i].position.x >= canvas.width) {
                        if (balls.length === 1) {
                            hud.message = "Player 1 won"
                            hud.scores.p1 += 1;
                            socket.emit("hud", hud);
                            makeBalls(numOfBalls, canvas.width / 2, canvas.height / 2);
                        } else {
                            hud.scores.p1 += 1;
                            socket.emit("hud", hud);
                            balls.splice(i, 1);
                            if (balls.length === 1 ) {
                                //powerup = null;
                            powerupOnScreen = false;
                            }
                        }

                    } else if (balls[i].position.x <= 0) {
                        if (balls.length === 1) {
                            hud.message = "Player 2 won"
                            hud.scores.p2 += 1;
                            socket.emit("hud", hud);
                            makeBalls(numOfBalls, canvas.width / 2, canvas.height / 2);
                        } else {
                            hud.scores.p2 += 1;
                            socket.emit("hud", hud);
                            balls.splice(i, 1);
                             if (balls.length === 1 ) {
                                //powerup = null;
                            powerupOnScreen = false;
                            }
                        }
                    } else if (balls[i].position.y >= canvas.height || balls[i].position.y <= 0) {
                        balls[i].bounceY();
                    }
                }
            } else {
                for (var i = 0; i < balls.length; ++i) {
                    balls[i].draw(ctx);
                }
                powerup = null;
            }
        }
        frame += 1;
        requestAnimationFrame(game);
    }
    game();
}

/**
 * creates balls
 * 
 * @param n is the number of balls to generate
 */
function makeBalls(n, x, y) {
     balls = [];
    for (var i = 0; i < n; ++i) {
        balls.push(new Ball());
        balls[i].position = { x: x, y: y };
    }
}

/**
 * resets the game
 */
function reset() {
    hud = new HUD(canvas.width, canvas.height);
    makeBalls(numOfBalls, canvas.width / 2, canvas.height / 2);
}
})();