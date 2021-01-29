import { ClockOptions } from "../types/clock-options";

Math.TAU = Math.PI * 2;

const getCanvas = (): HTMLCanvasElement => {
  return document.getElementById("canvas") as HTMLCanvasElement;
};

const getCanvasContext = (): CanvasRenderingContext2D => {
  const ctx = getCanvas().getContext("2d");
  if (ctx) {
    return ctx;
  } else {
    throw new Error("Can't generate canvas context.");
  }
};

const getOptions = (): ClockOptions => {
  const options = {
    hResolution: 1920,
    vResolution: 1080,
    clockRadius: 432,
    lineWidth: 10,
    locale: "en-US",
  } as ClockOptions;

  options.hMidpoint = options.hResolution / 2;
  options.vMidpoing = options.vResolution / 2;

  return options;
};

const sizeCanvas = (options: ClockOptions): void => {
  const canvas = getCanvas();
  canvas.height = options.vResolution;
  canvas.width = options.hResolution;
};

const drawClockFrame = (options: ClockOptions): void => {
  const ctx = getCanvasContext();

  ctx.beginPath();
  ctx.arc(
    options.hMidpoint,
    options.vMidpoing,
    options.clockRadius,
    0,
    Math.TAU,
    true
  );
  ctx.clip();
  ctx.lineWidth = options.lineWidth;
  ctx.stroke();
  ctx.closePath();
};

const getTime = (seconds: number, options: ClockOptions): string => {
  const hours = Math.trunc(seconds / 3600);
  seconds = seconds % 3600;
  const minutes = Math.trunc(seconds / 60);
  seconds = seconds % 60;

  const date = new Date(Date.UTC(0, 0, 0, hours, minutes, seconds, 0));

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "number",
    minute: "number",
    second: "number",
    timeZone: "UTC",
    hour12: false,
  };

  const time = new Intl.DateTimeFormat(options.locale, timeOptions).format(
    date
  );

  return time;
};

const t = getTime(12345, getOptions());
console.log(t);