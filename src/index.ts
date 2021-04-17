import * as clock from "./clock";
import { Transcoder } from "./transcode";
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

const getPreviewButton = (): HTMLButtonElement => {
  return document.getElementById("preview") as HTMLButtonElement;
};

const getOptions = (): clock.ClockOptions => {
  const options = {
    hResolution: parseInt(document.getElementById("height")?.nodeValue ?? "1920", 10),
    vResolution: parseInt(document.getElementById("width")?.nodeValue ?? "1080", 10),
    hMidpoint: 960,
    vMidpoint: 540,
    clockRadius: parseInt(document.getElementById("clockRadius")?.nodeValue ?? "432", 10),
    lineWidth: parseInt(document.getElementById("lineWidth")?.nodeValue ?? "10", 10),
    locale: document.getElementById("lineWidth")?.nodeValue ?? "en-US",
    handLength: parseInt($('#handLength').val() +'', 10) ?? 200,
    handTailLength: parseInt($('#handTailLength').val() + '', 10) ?? 15,
    tickCount: parseInt(document.getElementById("tickCount")?.nodeValue ?? "5", 10),
    tickLength: parseInt(document.getElementById("tickLength")?.nodeValue ?? "30", 10),
    tickWidth: parseInt(document.getElementById("tickWidth")?.nodeValue ?? "10", 10),
    tickLabels:
      document.getElementById("tickLabels")?.nodeValue?.split(";").map(String.prototype.trim) ?? [],
    tickLabelCssFont:
      document.getElementById("tickLabelCssFont")?.nodeValue ?? "italic 40px Calibri",
    tickLabelColor: document.getElementById("tickLabelColor")?.nodeValue ?? "purple",
    tickLabelRadius: parseInt(document.getElementById("handLength")?.nodeValue ?? "335", 10),
    arcFillColor: $("#arcFillColor").val() + "" ?? "#000000",
    arcFillTransparency:('00' + parseInt($("#arcFillTransparency").val() + "", 10).toString(16)).slice(-2),
    arcOutlineColor: $("#arcOutlineColor").val() + "" ?? "#000000",
    arcOutlineTransparency: ('00' + parseInt($("#arcOutlineTransparency").val() + "", 10).toString(16)).slice(-2),

    labelCssFont: document.getElementById("labelCssFont")?.nodeValue ?? "40px Calibri",
    color: document.getElementById("color")?.nodeValue ?? "black",
    backgroundColor: document.getElementById("backgroundColor")?.nodeValue ?? "pink",
    countdownSeconds: parseInt(document.getElementById("tickWidth")?.nodeValue ?? "300", 10),
  };

  console.log(options);

  return options;
};

const sizeCanvas = (options: clock.ClockOptions): void => {
  const canvas = getCanvas();
  canvas.height = options.vResolution;
  canvas.width = options.hResolution;
};

// Globally enabled Bootstrap tooltips
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl);
});

const previewFrames: number[] = [];
getPreviewButton().addEventListener("click", () => {
  const myClock = new clock.Clock(getCanvasContext(), getOptions());

  sizeCanvas(getOptions());

  previewFrames.forEach(clearTimeout);

  for (let frame = 0; frame < myClock.frameCount; frame++) {
    previewFrames.push(window.setTimeout(function () {
      myClock.renderFrame(frame);
    }, 100 * frame));
  }
});

getDownloadButton().addEventListener("click", () => {
  const myClock = new clock.Clock(getCanvasContext(), getOptions());

  sizeCanvas(getOptions());

  const transcoder: Transcoder = new Transcoder();
  transcoder
    .init((status: string) => {
      console.log(status);
    })
    .then((transcoder: Transcoder) => {
      for (let frame = 0; frame < myClock.frameCount; frame++) {
        myClock.renderFrame(frame);

        // Save off the image for mp4
        transcoder.addFrame(getCanvas(), (status: string) => {
          console.log(status);
        });
      }

      return transcoder;
    })
    .then((transcoder: Transcoder) => {
      return transcoder.transcode(myClock.options.countdownSeconds, false, (status: string) => {
        console.log(status);
      });
    })
    .then((video: Uint8Array) => {
      const blob = new Blob([video.buffer], { type: "video/mp4" });
      saveAs(blob, "countdown.mp4");
    })
    .catch((err: Error) => {
      console.error(err);
    });
});
