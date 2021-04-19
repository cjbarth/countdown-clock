import { Duration } from 'luxon';
export class Clock {
    constructor(ctx, options) {
        this.ctx = ctx;
        this.options = options;
        // There will always be 4x the radius of pixel parts on the edge of the circle
        this.frameCount = Math.max(this.options.clockRadius * 4, this.options.countdownSeconds);
        this.radiansPerFrame = Math.TAU / this.frameCount;
        this.secondsPerFrame = this.options.countdownSeconds / this.frameCount;
    }
    drawEdge(color) {
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(this.options.hPosition, this.options.vPosition, this.options.clockRadius, 0, Math.TAU);
        this.ctx.lineWidth = this.options.lineWidth;
        this.ctx.stroke();
        this.ctx.closePath();
    }
    drawHand(radians, color) {
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.translate(this.options.hPosition, this.options.vPosition);
        this.ctx.rotate(radians);
        this.ctx.translate(-this.options.hPosition, -this.options.vPosition);
        this.ctx.moveTo(this.options.hPosition, this.options.vPosition + this.options.handTailLength);
        this.ctx.lineTo(this.options.hPosition, this.options.vPosition - this.options.handLength);
        this.ctx.rotate(-radians);
        this.ctx.lineWidth = this.options.handWidth;
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    drawTicks(color) {
        const x = this.options.hPosition - this.options.tickWidth / 2;
        const y = this.options.vPosition - this.options.clockRadius + (this.options.lineWidth / 2);
        this.ctx.fillStyle = color;
        for (let r = 0; r < Math.TAU; r += (1 / this.options.tickCount) * Math.TAU) {
            this.ctx.beginPath();
            this.ctx.translate(this.options.hPosition, this.options.vPosition);
            this.ctx.rotate(r);
            this.ctx.translate(-this.options.hPosition, -this.options.vPosition);
            this.ctx.fillRect(x, y, this.options.tickWidth, this.options.tickLength);
            this.ctx.rotate(-r);
            this.ctx.closePath();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
    }
    drawNumbers(color) {
        var _a, _b;
        this.ctx.font = this.options.tickLabelCssFont;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        const tickLabelsCount = (_b = (_a = this.options.tickLabels) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
        for (let i = 0; i < tickLabelsCount; i++) {
            // Start writing labels at the top of the clock
            const x = this.options.hPosition +
                this.options.tickLabelRadius * Math.cos((Math.TAU / tickLabelsCount) * i - Math.TAU / 4);
            let y = this.options.vPosition +
                this.options.tickLabelRadius * Math.sin((Math.TAU / tickLabelsCount) * i - Math.TAU / 4);
            const textMeasurements = this.ctx.measureText(this.options.tickLabels[i]);
            y +=
                (textMeasurements.actualBoundingBoxAscent + textMeasurements.actualBoundingBoxDescent) / 2;
            this.ctx.fillText(this.options.tickLabels[i], x, y);
        }
    }
    drawColorWedge(arcRadians, fillColor, outlineColor) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.options.hPosition, this.options.vPosition);
        this.ctx.arc(this.options.hPosition, this.options.vPosition, this.options.clockRadius, -(Math.TAU / 4), arcRadians - (Math.TAU / 4));
        // The wrapping `save`/`restore` is to undo the effects of the `clip`.
        this.ctx.save();
        this.ctx.clip();
        this.ctx.closePath();
        this.ctx.lineWidth = this.options.lineWidth;
        this.ctx.fillStyle = fillColor;
        this.ctx.fill();
        this.ctx.strokeStyle = outlineColor;
        this.ctx.stroke();
        this.ctx.restore();
    }
    drawCenterText(text) {
        this.ctx.font = this.options.timeCssFont;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = this.options.timeColor + this.options.timeColorOpacity;
        this.ctx.fillText(text, this.options.timeHPosition, this.options.timeVPosition);
    }
    clear() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.options.hResolution, this.options.vResolution);
        this.ctx.fillStyle = this.options.backgroundColor + this.options.backgroundColorOpacity;
        this.ctx.fillRect(0, 0, this.options.hResolution, this.options.vResolution);
    }
    getTimeText(seconds) {
        const duration = Duration.fromMillis(seconds * 1000);
        return duration.toFormat(this.options.timeFormat);
    }
    renderFrame(frameNumber) {
        const t = this.getTimeText((frameNumber) * this.secondsPerFrame);
        const arcRadians = (frameNumber) * this.radiansPerFrame;
        const color = this.options.color + this.options.opacity;
        this.clear();
        this.drawColorWedge(arcRadians, this.options.arcFillColor + this.options.arcFillOpacity, this.options.arcOutlineColor + this.options.arcOutlineOpacity);
        this.drawEdge(color);
        this.drawHand(arcRadians, color);
        this.drawTicks(color);
        this.drawNumbers(color);
        this.drawCenterText(t);
    }
}
//# sourceMappingURL=clock.js.map