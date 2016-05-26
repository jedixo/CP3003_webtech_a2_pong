//paddle class
/**
 * A Paddle Class that controls a paddle and if anything hits it
 * 
 * @param x the x position of the paddle to define player 1 or player 2
 * @param colour the colour of the paddle, default is "#00FF00" 
 */
function Paddle(x, colour) {
    this.player = 1;
    this.position = { x: (x) ? x : 10, y: 25 }; //if x is underfined it defaults to 10
    this.dimensions = { length: 100, width: 10 };
    this.colour = colour || '#FF0000';
    this.strokeLineWidth = 5;

    /**
     * draws the paddle
     * 
     * @param ctx canvas context for drawing paddle
     */
    this.draw = function (ctx) {
        ctx.strokeStyle = this.colour;
        ctx.fillStyle = this.colour;
        ctx.lineWidth = this.strokeLineWidth;
        ctx.beginPath();
        ctx.fillRect(this.position.x, this.position.y, this.dimensions.width, this.dimensions.length);
    };

    /**
     * moves the paddle to the given Y cordinate
     * 
     * @param y the y postion of the paddle
     */
    this.move = function (y) {
        this.position.y += y;
    };

    /**
     * sets the colour of the paddle
     * 
     * @param colour the colour to set the paddle
     */
    this.setColour = function (colour) {
        this.colour = colour;
    };

    /**
     * get the y position of the paddle
     * 
     * @returns the y position of the paddle
     */
    this.getPosition = function () {
        return this.position.y;
    }

    /**
     * test if paddle for playe 1 has been hit by an object
     * 
     * @param x the postion x of the object
     * @param y the position y of the object
     * @param xVelocity the x velocity of the object approaching the paddle
     * @returns true or false for hit by object
     */
    this.hitTest = function (x, y, paddleNum) {
        if (paddleNum == 0){ //approaching player 1
            if (x <= (this.position.x + this.dimensions.width) && (y >= this.position.y && y <= (this.position.y + this.dimensions.length))) {
                return true;
            }
        }else { //approachign player 2
            if (x >= (this.position.x) && (y >= this.position.y && y <= (this.position.y + this.dimensions.length))) {
                return true;
            }
        }
        return false;
    }

    /**
     * if hit, find out where on the paddle the object hit
     * 
     * @param y the y position of the object
     * @returns 1 = upper third, 2 = middle, 3 = lower third 
     */
    this.getHitPosition = function (y) {
        if (y < this.position.y + 1 / 3 * this.dimensions.length) {
            console.log("upper third hit")
            return 1
        } else if ((y > this.position.y + 1 / 3 * this.dimensions.length) && (y < this.position.y + 2 / 3 * this.dimensions.length)) {
            console.log("middle third hit")
            return 2
        } else {
            console.log("lower third hit")
            return 3
        }
    }

    /**
     * test if paddle for player 2 has been hit by an object
     * 
     * @param x the postion x of the object
     * @param y the position y of the object
     * @returns true or false for hit by object
     */
    this.hitTest2 = function (x, y) {
        if (x >= (this.position.x) && (y >= this.position.y && y <= (this.position.y + this.dimensions.length))) {
            return true;
        }
        return false;
    }
};