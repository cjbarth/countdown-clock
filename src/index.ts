import * as clock from "./clock";
import * as transcode from "./transcode";
import { saveAs } from "file-saver";
// import * as bootstrap from "bootstrap";

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
    hResolution: parseInt(document.getElementById("height")?.nodeValue ?? "1920", 10),
    vResolution: parseInt(document.getElementById("width")?.nodeValue ?? "1080", 10),
    clockRadius: parseInt(document.getElementById("clockRadius")?.nodeValue ?? "432", 10),
    lineWidth: parseInt(document.getElementById("lineWidth")?.nodeValue ?? "10", 10),
    locale: document.getElementById("lineWidth")?.nodeValue ?? "en-US",
    handLength: parseInt(document.getElementById("handLength")?.nodeValue ?? "200", 10),
    tickCount: parseInt(document.getElementById("tickCount")?.nodeValue ?? "5", 10),
    tickLength: parseInt(document.getElementById("tickLength")?.nodeValue ?? "30", 10),
    tickWidth: parseInt(document.getElementById("tickWidth")?.nodeValue ?? "10", 10),
    tickLabels: document.getElementById("tickLabels")?.nodeValue?.split(";").map(String.prototype.trim),
    tickLabelCssFont: document.getElementById("tickLabelCssFont")?.nodeValue ?? "italic 40px Calibri",
    tickLabelColor: document.getElementById("tickLabelColor")?.nodeValue ?? "purple",
    tickLabelRadius:  parseInt(document.getElementById("handLength")?.nodeValue ?? "335", 10),
    labelCssFont: document.getElementById("labelCssFont")?.nodeValue ?? "40px Calibri",
    color: document.getElementById("color")?.nodeValue ?? "black",
    backgroundColor: document.getElementById("backgroundColor")?.nodeValue ?? "pink",
    countdownSeconds: parseInt(document.getElementById("tickWidth")?.nodeValue ?? "300", 10),
  } as clock.ClockOptions;

  return options;
};

const sizeCanvas = (options: clock.ClockOptions): void => {
  const canvas = getCanvas();
  canvas.height = options.vResolution;
  canvas.width = options.hResolution;
};

const myClock = new clock.Clock(getCanvasContext(), getOptions());

sizeCanvas(getOptions());

// Globally enabled Bootstrap tooltips
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl);
});

getDownloadButton().addEventListener("click", () => {
  transcode
    .init((status) => {
      console.log(status);
      console.log(myClock.options.radiansPerSecond);
    })
    .then(() => {
      // Need to figure out how to correlate seconds with frames so we can draw the correct number of frames
      // Either one per second, or one per pixel on the circumfrunce
      for (let frame = 0; frame < myClock.frameCount; frame++) {
        setTimeout(function () {
          myClock.renderFrame(frame);

          // Save off the image for mp4
          transcode.addFrame(getCanvas(), (status) => {
            console.log(status);
          });
        }, 10 * frame);
      }
    });

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
