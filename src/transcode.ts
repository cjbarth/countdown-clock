import { convertDataURIToBinary } from "./utilities";

// const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = FFmpeg.createFFmpeg({ log: true });

let frameCount = 0;
const getFrameNumber = (frameNumber: number) => {
  return `000${frameNumber}`.slice(-4);
};

const addFrame = (canvasElem: HTMLCanvasElement): void => {
  frameCount += 1;
  if (frameCount > 9999) {
    // We have to support enough frames to have at least one per pixel on the circumference of the circle
    throw new Error("Too many frames. Only 10,000 frames supported.");
  }
  const frameNum = getFrameNumber(frameCount);
  const image = canvasElem.toDataURL("image/png");
  const myUint8Array = convertDataURIToBinary(image);
  ffmpeg.FS("writeFile", `tmp.${frameNum}.png`, myUint8Array);
};

const addAudio = async (filePath: string): Promise<void> => {
  ffmpeg.FS("writeFile", "audio.ogg", await FFmpeg.fetchFile(filePath));
};

const downloadVideo = async (statusCallback: (statusMessage: string) => void): Promise<void> => {
  statusCallback("Loading ffmpeg-core.js");
  await ffmpeg.load();
  statusCallback("Loading data");

  for (let i = 0; i < 60; i += 1) {
    const num = `00${i}`.slice(-3);
    // This should write a Uint8Array
    ffmpeg.FS(
      "writeFile",
      `tmp.${num}.png`,
      await FFmpeg.fetchFile(`../assets/triangle/tmp.${num}.png`)
    );
  }
  statusCallback("Start transcoding");

  // We have to switch here if we don't have audio; it will be a different command in that case
  await ffmpeg.run(
    "-framerate",
    "1",
    "-pattern_type",
    "glob",
    "-i",
    "*.png",
    "-i",
    "audio.ogg",
    "-c:a",
    "copy",
    "-shortest",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "out.mp4"
  );
  const data = ffmpeg.FS("readFile", "out.mp4");
  ffmpeg.FS("unlink", "audio.ogg");

  for (let i = 0; i < frameCount; i += 1) {
    const frameNumber = getFrameNumber(frameCount);

    ffmpeg.FS("unlink", `tmp.${frameNumber}.png`);
  }

  const fileName = "countdown.mp4";
  const blob = new Blob([data.buffer], { type: "video/mp4" });
  saveAs(blob, fileName);
};

export { addFrame, addAudio, downloadVideo };
