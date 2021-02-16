export interface ClockOptions {
  hResolution: number;
  vResolution: number;
  hMidpoint: number;
  vMidpoint: number;
  clockRadius: number;
  lineWidth: number;
  locale: string;
  handLength: number;
  tickHeight: number;
  tickWidth: number;
  tickCount: number;
  tickLabels: string[];
  tickLabelsCount: number;
  tickLabelCssFont: string;
  tickLabelColor: string;
  tickLabelRadius: number;
  labelCssFont: string;
  color: string;
  backgroundColor: string;
  countdownSeconds: number;
  radiansPerSecond: number;
}

export class Clock {
  ctx: CanvasRenderingContext2D;
  public options: ClockOptions;

  constructor(ctx: CanvasRenderingContext2D, options: ClockOptions) {
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

    Object.defineProperty(this.options, "radiansPerSecond", {
      get: function () {
        delete this.radiansPerSecond;
        return (this.radiansPerSecond =
          Math.TAU / Math.max(this.clockRadius, this.countdownSeconds));
      },
      configurable: true,
    });
  }

  drawFrame(color?: string): void {
    this.ctx.fillStyle = color || this.options.color;
    this.ctx.beginPath();
    this.ctx.arc(
      this.options.hMidpoint,
      this.options.vMidpoint,
      this.options.clockRadius,
      0,
      Math.TAU
    );
    this.ctx.clip();
    this.ctx.lineWidth = this.options.lineWidth;
    this.ctx.stroke();
    this.ctx.closePath();
  }

  drawHand(radians: number, tailLength: number, color?: string): void {
    this.ctx.fillStyle = color || this.options.color;
    this.ctx.beginPath();
    this.ctx.translate(this.options.hMidpoint, this.options.vMidpoint);
    this.ctx.rotate(radians);
    this.ctx.translate(-this.options.hMidpoint, -this.options.vMidpoint);
    this.ctx.moveTo(this.options.hMidpoint, this.options.vMidpoint + tailLength);
    this.ctx.lineTo(this.options.hMidpoint, this.options.handLength);
    this.ctx.rotate(-radians);
    this.ctx.lineWidth = this.options.lineWidth;
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  drawTicks(color?: string): void {
    const x = this.options.hMidpoint - this.options.tickWidth / 2;
    const y = this.options.vMidpoint - this.options.clockRadius;

    this.ctx.fillStyle = color || this.options.color;
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

  drawNumbers(color?: string): void {
    this.ctx.font = this.options.tickLabelCssFont;
    this.ctx.fillStyle = color || this.options.color;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    for (let i = 0; i < this.options.tickLabelsCount; i++) {
      // Start writing labels at the top of the clock
      const x =
        this.options.hMidpoint +
        this.options.tickLabelRadius *
          Math.cos((Math.TAU / this.options.tickLabelsCount) * i - Math.TAU / 4);
      let y =
        this.options.vMidpoint +
        this.options.tickLabelRadius *
          Math.sin((Math.TAU / this.options.tickLabelsCount) * i - Math.TAU / 4);

      const textMeasurements = this.ctx.measureText(this.options.tickLabels[i]);
      y +=
        (textMeasurements.actualBoundingBoxAscent + textMeasurements.actualBoundingBoxDescent) / 2;
      //   y += (textMeasurements.fontBoundingBoxAscent + textMeasurements.fontBoundingBoxDescent) / 2;
      this.ctx.fillText(this.options.tickLabels[i], x, y);
    }
  }

  drawColorWedge(arcRadians: number, fillColor?: string, outlineColor?: string): void {
    this.ctx.beginPath();
    this.ctx.moveTo(this.options.hMidpoint, this.options.vMidpoint);
    this.ctx.arc(
      this.options.hMidpoint,
      this.options.vMidpoint,
      this.options.clockRadius,
      0,
      arcRadians
    );

    // The wrapping `save`/`restore` is to undo the effects of the `clip`.
    this.ctx.save();
    this.ctx.clip();
    this.ctx.closePath();
    this.ctx.lineWidth = this.options.lineWidth;
    this.ctx.fillStyle = fillColor || this.options.color;
    this.ctx.fill();
    this.ctx.strokeStyle = outlineColor || this.options.color;
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawCenterText(text: string, color?: string): void {
    this.ctx.font = this.options.labelCssFont;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = color || this.options.color;
    this.ctx.fillText(
      text,
      this.options.hMidpoint,
      this.options.vMidpoint,
      this.options.clockRadius * 2
    );
  }

  clear(): void {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.options.hResolution, this.options.vResolution);
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.options.hResolution, this.options.vResolution);
  }
}
