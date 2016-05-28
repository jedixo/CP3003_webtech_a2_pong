//Heads Up Display class
/**
 * A calss that controls the information displayed to the player
 * 
 * @param width is the width of the canvas
 * @param height is the height of the canvas
 */
function HUD(width, height) {
    this.scores = { p1: 0, p2: 0 };
    this.position = { x: width / 2, y: height / 2 };
    this.message = "";
    this.textAlign = "center";
    this.scoreFont = "bold 40pt classicFont";
    this.textFont = "bold 30pt classicFont";
    this.colour = "#00FF00";
    this.waitTimeSec = 1;
    this.timer = 0;

    //change these if nesecary for effects
    this.textColour = this.colour;
    this.lineColour = this.colour;

    /**
     * draws the HUD
     * 
     * @param ctx canvas context for drawing HUD
     */
    this.draw = function (ctx) {

        //wait timer on hud message
        if (this.message !== "") {
            if (this.timer === (this.waitTimeSec * 60)) {
                this.message = "";
                this.timer = 0;
            } else {
                this.timer += 1;
            }
        }

        ctx.font = this.textFont;
        ctx.fillStyle = this.textColour;
        ctx.textAlign = this.textAlign;

        //draw messages
        ctx.fillText(this.message, this.position.x, this.position.y * 2 - 20);
        ctx.font = this.scoreFont;
        ctx.fillText(this.scores.p1, this.position.x - 100, 55);
        ctx.fillText(this.scores.p2, this.position.x + 100, 55);

        //dotted line
        ctx.strokeStyle = this.lineColour;
        ctx.setLineDash([15, 20]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();

    };

};