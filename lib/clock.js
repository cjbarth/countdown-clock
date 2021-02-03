export class Clock {
    constructor(ctx, options) {
        this.ctx = ctx;
        this.options = options;
        Object.defineProperty(this.options, "hMidpoint", {
            get: function () {
                delete this.hMidpoint;
                return (this.hMidpoint = this.hResolution / 2);
            },
            configurable: true,
        });
        Object.defineProperty(this.options, "vMidpoint", {
            get: function () {
                delete this.vMidpoint;
                return (this.vMidpoint = this.vResolution / 2);
            },
            configurable: true,
        });
        Object.defineProperty(this.options, "tickLabelsCount", {
            get: function () {
                delete this.tickLabelsCount;
                return (this.tickLabelsCount = this.tickLabels.length);
            },
            configurable: true,
        });
    }
    drawFrame() {
        this.ctx.beginPath();
        this.ctx.arc(this.options.hMidpoint, this.options.vMidpoint, this.options.clockRadius, 0, Math.TAU);
        this.ctx.clip();
        this.ctx.lineWidth = this.options.lineWidth;
        this.ctx.stroke();
        this.ctx.closePath();
    }
    drawHand(radians) {
        const someValue = 15; // This is the value that the hand goes to on the other side of the center, like a real clock hand
        this.ctx.beginPath();
        this.ctx.translate(this.options.hMidpoint, this.options.vMidpoint);
        this.ctx.rotate(radians);
        this.ctx.translate(-this.options.hMidpoint, -this.options.vMidpoint);
        this.ctx.moveTo(this.options.hMidpoint, this.options.vMidpoint + someValue);
        this.ctx.lineTo(this.options.hMidpoint, this.options.handLength);
        this.ctx.rotate(-radians);
        this.ctx.lineWidth = this.options.lineWidth;
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    drawTicks() {
        const x = this.options.hMidpoint - this.options.tickWidth / 2;
        const y = this.options.vMidpoint - this.options.clockRadius;
        for (let r = 0; r < Math.TAU; r += (1 / this.options.tickCount) * Math.TAU) {
            this.ctx.beginPath();
            this.ctx.translate(this.options.hMidpoint, this.options.vMidpoint);
            this.ctx.rotate(r);
            this.ctx.translate(-this.options.hMidpoint, -this.options.vMidpoint);
            this.ctx.fillRect(x, y, this.options.tickWidth, this.options.tickHeight);
            this.ctx.rotate(-r);
            this.ctx.closePath();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
    }
    drawNumbers() {
        this.ctx.font = this.options.tickLabelCssFont;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        for (let i = 0; i < this.options.tickLabelsCount; i++) {
            // Start writing labels at the top of the clock
            const x = this.options.hMidpoint +
                this.options.tickLabelRadius *
                    Math.cos((Math.TAU / this.options.tickLabelsCount) * i - Math.TAU / 4);
            let y = this.options.vMidpoint +
                this.options.tickLabelRadius *
                    Math.sin((Math.TAU / this.options.tickLabelsCount) * i - Math.TAU / 4);
            const textMeasurements = this.ctx.measureText(this.options.tickLabels[i]);
            y +=
                (textMeasurements.actualBoundingBoxAscent + textMeasurements.actualBoundingBoxDescent) / 2;
            //   y += (textMeasurements.fontBoundingBoxAscent + textMeasurements.fontBoundingBoxDescent) / 2;
            this.ctx.fillText(this.options.tickLabels[i], x, y);
        }
    }
    drawColorWedge(arcRadians) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.options.hMidpoint, this.options.vMidpoint);
        this.ctx.arc(this.options.hMidpoint, this.options.vMidpoint, this.options.clockRadius, 0, arcRadians);
        this.ctx.clip();
        this.ctx.lineWidth = this.options.lineWidth;
        this.ctx.fill();
        // this.ctx.stroke();
        this.ctx.closePath();
    }
}
//# sourceMappingURL=clock.js.map