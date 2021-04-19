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
    hPosition: parseInt($("#hPosition").val() + "", 10),
    vPosition: parseInt($("#vPosition").val() + "", 10),
    clockRadius: parseInt($("#clockRadius").val() + "", 10),
    lineWidth: parseInt($("#lineWidth").val() + "", 10),
    timeFormat: $("#timeFormat").val() + "",
    handLength: parseInt($("#handLength").val() + "", 10),
    handTailLength: parseInt($("#handTailLength").val() + "", 10),
    handWidth: parseInt($("#handWidth").val() + "", 10),
    tickCount: parseInt($("#tickCount").val() + "", 10),
    tickLength: parseInt($("#tickLength").val() + "", 10),
    tickWidth: parseInt($("#tickWidth").val() + "", 10),
    tickLabels: $("tickLabels").val()?.toString().split(";").map(String.prototype.trim) ?? [],
    tickLabelCssFont: $("#tickLabelCssFont").val() + "",
    tickLabelColor: $("#tickLabelColor").val() + "",
    tickLabelRadius: parseInt($("#tickLabelRadius").val() + "", 10),
    arcFillColor: $("#arcFillColor").val() + "" ?? "#000000",
    arcFillOpacity: ("00" + parseInt($("#arcFillOpacity").val() + "", 10).toString(16)).slice(-2),
    arcOutlineColor: $("#arcOutlineColor").val() + "" ?? "#000000",
    arcOutlineOpacity: ("00" + parseInt($("#arcOutlineOpacity").val() + "", 10).toString(16)).slice(
      -2
    ),

    timeCssFont: $("#timeCssFont").val() + "",
    timeColor: $("#timeColor").val() + "" ?? "#000000",
    timeColorOpacity: ("00" + parseInt($("#timeColorOpacity").val() + "", 10).toString(16)).slice(
      -2
    ),
    timeHPosition: parseInt($("#timeHPosition").val() + "", 10),
    timeVPosition: parseInt($("#timeVPosition").val() + "", 10),
    color: $("#color").val() + "",
    opacity: ("00" + parseInt($("#opacity").val() + "", 10).toString(16)).slice(-2),
    backgroundColor: $("#backgroundColor").val() + "" ?? "#000000",
    backgroundColorOpacity: (
      "00" + parseInt($("#backgroundColorOpacity").val() + "", 10).toString(16)
    ).slice(-2),
    countdownSeconds: parseInt($("#countdownSeconds").val() + "", 10),
  };

  options.hPosition = options.hPosition || options.hResolution / 2;
  options.vPosition = options.vPosition || options.vResolution / 2;
  options.timeHPosition = options.timeHPosition || options.hPosition;
  options.timeVPosition = options.timeVPosition || options.vPosition;

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
$("#accordionConfig input").on("input", () => {
  const myClock = new clock.Clock(getCanvasContext(), getOptions());
  sizeCanvas(getOptions());
  myClock.renderFrame(Math.round(Math.random() * myClock.frameCount));
});

let previewFrames: number[] = [];
getPreviewButton().addEventListener("click", () => {
  const myClock = new clock.Clock(getCanvasContext(), getOptions());

  sizeCanvas(getOptions());

  previewFrames.forEach(clearTimeout);
  previewFrames = [];

  for (let frame = 0; frame <= myClock.frameCount; frame++) {
    previewFrames.push(
      window.setTimeout(function () {
        myClock.renderFrame(frame);
      }, (myClock.secondsPerFrame / 10) * frame * 1000)
    );
  }
});

getDownloadButton().addEventListener("click", async () => {
  const myClock = new clock.Clock(getCanvasContext(), getOptions());

  sizeCanvas(getOptions());

  const progressBarPrepare = $("#progressBarPrepare");
  const progressBarCompress = $("#progressBarCompress");

  const transcoder: Transcoder = new Transcoder((status) => {
    const progressPercentage = (status.ratio * 100) / 2; // This is only half the process
    progressBarCompress
      .attr("aria-valuenow", progressPercentage)
      .css("width", progressPercentage + "%");
  });

  await transcoder.init((status: string) => {
    console.log(status);
  });

  for (let frame = 0; frame <= myClock.frameCount; frame++) {
    myClock.renderFrame(frame);

    // Save off the image for mp4
    await transcoder.addFrame(getCanvas(), (status: string) => {
      console.log(status);
    });
    const progressPercentage = ((frame / myClock.frameCount) * 100) / 2; // This is only half the process
    progressBarPrepare
      .attr("aria-valuenow", progressPercentage)
      .css("width", progressPercentage + "%");
  }

  const video: Uint8Array = await transcoder.transcode(
    myClock.options.countdownSeconds,
    false,
    (status: string) => {
      console.log(status);
    }
  );

  const blob = new Blob([video.buffer], { type: "video/mp4" });
  saveAs(blob, "countdown.mp4");
});
