/**
 * (description)
 * 
 * @param x (description)
 * @param y (description)
 */
function FastBall(x, y, a) {
    PowerUp.call(this, x, y, "#FF0000", "M");
    this.balls = a;
}

FastBall.prototype = Object.create(PowerUp.prototype, {
    execute: {
        value: function () {
            console.log("FastBall Execute!");
        }
    }
});

FastBall.prototype.constructor = FastBall;
