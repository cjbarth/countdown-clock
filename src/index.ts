import * as clock from "./clock";
import * as transcode from "./transcode";
import { saveAs } from "file-saver";

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

const getDownloadButton = (): HTMLButtonElement => {
  return document.getElementById("download") as HTMLButtonElement;
};

const getOptions = (): clock.ClockOptions => {
  const options = {
    hResolution: 1920,
    vResolution: 1080,
    clockRadius: 432,
    lineWidth: 10,
    locale: "en-US",
    handLength: 200,
    tickCount: 5,
    tickHeight: 30,
    tickWidth: 10,
    tickLabels: ["a", "IV", "V", "z", "zz"],
    tickLabelCssFont: "italic 40px Calibri",
    tickLabelColor: "purple",
    tickLabelRadius: 335,
    labelCssFont: "40px Calibri",
    color: "black",
    backgroundColor: "pink",
    countdownSeconds: 60 * 5,
  } as clock.ClockOptions;

  return options;
};

const sizeCanvas = (options: clock.ClockOptions): void => {
  const canvas = getCanvas();
  canvas.height = options.vResolution;
  canvas.width = options.hResolution;
};

const getTime = (seconds: number, options: clock.ClockOptions): string => {
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

  const timeParts = new Intl.DateTimeFormat(options.locale, timeOptions).formatToParts(date);

  return timeParts
    .map((value) => {
      // Leave off the dayPeriod so we can get a raw time without extra 0s
      return value.type === "dayPeriod" ? "" : value.value;
    })
    .join("")
    .trim();
};

sizeCanvas(getOptions());

const myClock = new clock.Clock(getCanvasContext(), getOptions());

transcode
  .init((status) => {
    console.log(status);
    console.log(myClock.options.radiansPerSecond);
  })
  .then(() => {
    // Need to figure out how to correlate seconds with frames so we can draw the correct number of frames
    // Either one per second, or one per pixel on the circumfrunce
    for (let frame = 0; frame < myClock.options.countdownSeconds; frame++) {
      setTimeout(function () {
        const t = getTime(
          12345 +
            Math.round(
              (frame * myClock.options.radiansPerSecond) / myClock.options.countdownSeconds
            ),
          getOptions()
        );

        myClock.clear();
        myClock.drawFrame();
        myClock.drawHand(frame * myClock.options.radiansPerSecond, 15);
        myClock.drawTicks();
        myClock.drawNumbers();
        myClock.drawColorWedge(1.5, "blue", "red");
        myClock.drawCenterText(t, "orange");

        // Save off the image for mp4
        transcode.addFrame(getCanvas(), (status) => {
          console.log(status);
        });
      }, 10 * frame);
    }
  });

getDownloadButton().addEventListener("click", () => {
  transcode
    .transcode(myClock.options.countdownSeconds, false, (status) => {
      console.log(status);
    })
    .then((video) => {
      const blob = new Blob([video.buffer], { type: "video/mp4" });
      saveAs(blob, "countdown.mp4");
    })
    .catch((err) => {
      console.error(err);
    });
});
