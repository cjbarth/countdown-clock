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
}

export class Clock {
  ctx: CanvasRenderingContext2D;
  options: ClockOptions;

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
  }

  drawFrame(): void {
    this.ctx.beginPath();
    this.ctx.arc(
      this.options.hMidpoint,
      this.options.vMidpoint,
      this.options.clockRadius,
      0,
      Math.TAU,
      true
    );
    this.ctx.clip();
    this.ctx.lineWidth = this.options.lineWidth;
    this.ctx.stroke();
    this.ctx.closePath();
  }

  drawHand(radians: number): void {
    this.ctx.beginPath();
    this.ctx.translate(this.options.hMidpoint, this.options.vMidpoint);
    this.ctx.rotate(radians);
    this.ctx.translate(-this.options.hMidpoint, -this.options.vMidpoint);
    this.ctx.moveTo(this.options.hMidpoint, this.options.vMidpoint + 15);
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

    for (
      let r = 0;
      r < Math.TAU;
      r += (1 / this.options.tickCount) * Math.TAU
    ) {
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
}
