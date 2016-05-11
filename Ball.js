
/**
 * A ball class that controls velocity and draws the ball
 */
function Ball() {
    "use strict";

    /**
     * calculates initial velocity for the ball by using the initial speed
     * 
     * @param spd the initial speed of the ball 
     * @returns the object velocity containg x and y speeds 
     */
    function calcInitialVelocity(spd) {
        //generate random x and y directions 
        var xDir = (Math.random() < 0.5) ? -1 : 1;
        var yDir = (Math.random() < 0.5) ? -1 : 1;
        //generate random y speed
        var ySpd = spd * Math.abs(Math.random() * spd);
        //ensure x speed is always lareger than y speed
        var xSpd = spd * Math.abs((Math.random() * (spd - ySpd)) + ySpd);
        return { x: xDir * xSpd, y: yDir * ySpd };
    }

    this.initSpd = 2;
    this.speedDelta = 1;
    this.maxSpeed = 15;
    this.position = { x: 0, y: 0 };
    this.trail = { x: new Array(10), y: new Array(10) };
    this.velocity = calcInitialVelocity(this.initSpd);
    this.colour = "#FFF";
    this.trailColour = [255, 0, 255];
    this.radius = 5;
    
    this.forceBallLeft = function(){
        if (this.velocity.x > 0){
            this.velocity.x = this.velocity.x*-1;
        }
    }
    
    this.forceBallRight = function(){
        if (this.velocity.x < 0){
            this.velocity.x = this.velocity.x*-1;
        }
    }

    /**
     * moves the ball in the direction specified by it's velocity vector
     */
    this.move = function () {
        this.trail.x.shift();
        this.trail.y.shift();
        this.trail.x.push(this.position.x);
        this.trail.y.push(this.position.y);

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    };

    /**
     * bounce the ball in the x direction 
     */
    this.bounceX = function () {
        this.velocity.x = this.velocity.x * -1;
    };

    /**
     * bounce the ball in the x direction 
     */
    this.bounceY = function (scaler) {
        this.velocity.y = this.velocity.y * -1 * scaler;
    };

    /**
     * increases the speed of the ball
     */
    this.increaseSpeed = function () {
        if (this.velocity.x > 0) {
            this.velocity.x += this.speedDelta;
        } else if (this.velocity.x === Math.abs(this.maxSpeed)) {
            //max speed reached
        } else {
            this.velocity.x -= this.speedDelta;
        }
    };

    /**
     * draw the ball and it's trail
     * 
     * @param ctx the context of the canvas
     */
    this.draw = function (ctx) {
        if (this.velocity.x > 0) {
            this.trailColour = [this.trailColour[0] - 5, 0, this.trailColour[2] + 5];
        } else {
            this.trailColour = [this.trailColour[0] + 5, 0, this.trailColour[2] - 5];
        }
        
        ctx.strokeStyle = ctx.fillStyle = ["rgb(", this.trailColour[0], ",", this.trailColour[1], ",", this.trailColour[2], ")"].join("");
        for (var i = 0; i < this.trail.x.length; i++) {
            drawCircle(this.trail.x[i], this.trail.y[i], i / (this.radius - 2), ctx);
        }

        ctx.strokeStyle = ctx.fillStyle = this.colour;

        drawCircle(this.position.x, this.position.y, this.radius, ctx);

        this.move();



        /**
         * local circle drawing function, doesn't need public access
         * 
         * @param x is the x position of the circle
         * @param y is the y position of the circle
         * @param r is the radius of the cirlce
         * @param ctx is the canvas context
         */
        function drawCircle(x, y, r, ctx) {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, 2 * Math.PI);
            ctx.fill();
        }
    };
}