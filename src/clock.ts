import {Duration} from 'luxon'

export interface ClockOptions {
  hResolution: number;
  vResolution: number;
  hMidpoint: number;
  vMidpoint: number;
  clockRadius: number;
  lineWidth: number;
  timeFormat: string;
  handLength: number;
  handTailLength: number;
  handWidth: number;
  tickLength: number;
  tickWidth: number;
  tickCount: number;
  tickLabels: string[];
  tickLabelCssFont: string;
  tickLabelColor: string;
  tickLabelRadius: number;
  arcFillColor: string;
  arcFillTransparency: string;
  arcOutlineColor: string;
  arcOutlineTransparency: string;
  timeCssFont: string;
  timeColor: string;
  timeColorTransparency: string;
  color: string;
  backgroundColor: string;
  backgroundColorTransparency: string;
  countdownSeconds: number;
}

export class Clock {
  ctx: CanvasRenderingContext2D;
  public options: ClockOptions;
  readonly frameCount: number;
  readonly secondsPerFrame: number;
  private radiansPerFrame: number;

  constructor(ctx: CanvasRenderingContext2D, options: ClockOptions) {
    this.ctx = ctx;
    this.options = options;

    // There will always be 4x the radius of pixel parts on the edge of the circle
    this.frameCount = Math.max(this.options.clockRadius * 4, this.options.countdownSeconds);
    this.radiansPerFrame = Math.TAU / this.frameCount;
    this.secondsPerFrame = this.options.countdownSeconds / this.frameCount;
    console.log(this);
  }

  drawEdge(color?: string): void {
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

  drawHand(radians: number, color?: string): void {
    this.ctx.fillStyle = color || this.options.color;
    this.ctx.beginPath();
    this.ctx.translate(this.options.hMidpoint, this.options.vMidpoint);
    this.ctx.rotate(radians);
    this.ctx.translate(-this.options.hMidpoint, -this.options.vMidpoint);
    this.ctx.moveTo(this.options.hMidpoint, this.options.vMidpoint + this.options.handTailLength);
    this.ctx.lineTo(this.options.hMidpoint, this.options.vMidpoint - this.options.handLength);
    this.ctx.rotate(-radians);
    this.ctx.lineWidth = this.options.handWidth;
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
      this.ctx.fillRect(x, y, this.options.tickWidth, this.options.tickLength);
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

    const tickLabelsCount = this.options.tickLabels?.length ?? 0;

    for (let i = 0; i < tickLabelsCount; i++) {
      // Start writing labels at the top of the clock
      const x =
        this.options.hMidpoint +
        this.options.tickLabelRadius * Math.cos((Math.TAU / tickLabelsCount) * i - Math.TAU / 4);
      let y =
        this.options.vMidpoint +
        this.options.tickLabelRadius * Math.sin((Math.TAU / tickLabelsCount) * i - Math.TAU / 4);

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
      -(Math.TAU / 4),
      arcRadians - (Math.TAU / 4)
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

  drawCenterText(text: string): void {
    this.ctx.font = this.options.timeCssFont;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = this.options.timeColor + this.options.timeColorTransparency;
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
    this.ctx.fillStyle = this.options.backgroundColor + this.options.backgroundColorTransparency;
    this.ctx.fillRect(0, 0, this.options.hResolution, this.options.vResolution);
  }

  getTimeText(seconds: number): string {
    const duration: Duration = Duration.fromMillis(seconds * 1000);

    return duration.toFormat(this.options.timeFormat);



    const hours = Math.trunc(seconds / 3600);
    seconds = seconds % 3600;
    const minutes = Math.trunc(seconds / 60);
    seconds = seconds % 60;

    const date = new Date(Date.UTC(0, 0, 0, hours, minutes, seconds, 0));

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZone: "UTC",
      hour12: true,
    };

    const timeParts = new Intl.DateTimeFormat(this.options.locale, timeOptions).formatToParts(date);

    return timeParts
      .map((value) => {
        // Leave off the dayPeriod so we can get a raw time without extra 0s
        return value.type === "dayPeriod" ? "" : value.value;
      })
      .join("")
      .trim();
  }

  renderFrame(frameNumber: number): void {
    const t = this.getTimeText((frameNumber) * this.secondsPerFrame);
    const arcRadians: number = (frameNumber) * this.radiansPerFrame;

    this.clear();
    this.drawColorWedge(
      arcRadians,
      this.options.arcFillColor + this.options.arcFillTransparency,
      this.options.arcOutlineColor + this.options.arcOutlineTransparency
    );
    this.drawEdge();
    this.drawHand(arcRadians);
    this.drawTicks();
    this.drawNumbers();
    this.drawCenterText(t);
  }
}
