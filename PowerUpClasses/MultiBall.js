/**
 * (description)
 * 
 * @param x (description)
 * @param y (description)
 */
function MultiBall(x, y, a) {
    PowerUp.call(this, x, y, "#FF0000", "M");
    this.balls = a;
}

/*clone all functions from powerup class and associate with multiball class*/ 
MultiBall.prototype = Object.create(PowerUp.prototype, {
    execute: {
        value: function () {
            console.log("MultiBall Execute!");
            // a.push(new Ball());
        }
    }
});

MultiBall.prototype.constructor = MultiBall;
