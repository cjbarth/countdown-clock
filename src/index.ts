import * as clock from "./clock";
import { Transcoder } from "./transcode";
import { saveAs } from "file-saver";
import { valHooks } from "jquery";
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
    hResolution: parseInt($("#width").val() + "", 10),
    vResolution: parseInt($("#height").val() + "", 10),
    hMidpoint: parseInt($("#hPosition").val() + "", 10),
    vMidpoint: parseInt($("#vPosition").val() + "", 10),
    clockRadius: parseInt($("#clockRadius").val() + "", 10),
    lineWidth: parseInt($("#lineWidth").val() + "", 10),
    timeFormat: $("#timeFormat").val() + '',
    handLength: parseInt($("#handLength").val() + "", 10),
    handTailLength: parseInt($("#handTailLength").val() + "", 10),
    handWidth: parseInt($("#handWidth").val() + "", 10),
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
    arcFillTransparency: (
      "00" + parseInt($("#arcFillTransparency").val() + "", 10).toString(16)
    ).slice(-2),
    arcOutlineColor: $("#arcOutlineColor").val() + "" ?? "#000000",
    arcOutlineTransparency: (
      "00" + parseInt($("#arcOutlineTransparency").val() + "", 10).toString(16)
    ).slice(-2),

    timeCssFont: document.getElementById("timeCssFont")?.nodeValue ?? "40px Calibri",
    timeColor: $("#timeColor").val() + '' ?? "#000000",
    timeColorTransparency: (
      "00" + parseInt($("#timeColorTransparency").val() + "", 10).toString(16)
    ).slice(-2),
    color: document.getElementById("color")?.nodeValue ?? "black",
    backgroundColor: $("#backgroundColor").val() + '' ?? "#000000",
    backgroundColorTransparency: (
      "00" + parseInt($("#backgroundColorTransparency").val() + "", 10).toString(16)
    ).slice(-2),
    countdownSeconds: parseInt(document.getElementById("tickWidth")?.nodeValue ?? "300", 10),
  };

  options.hMidpoint = options.hMidpoint || options.hResolution / 2;
  options.vMidpoint = options.vMidpoint || options.vResolution / 2;

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

  for (let frame = 0; frame <= myClock.frameCount; frame++) {
    previewFrames.push(
      window.setTimeout(function () {
        myClock.renderFrame(frame);
      }, myClock.secondsPerFrame / 10 * frame)
    );
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
      for (let frame = 0; frame <= myClock.frameCount; frame++) {
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
