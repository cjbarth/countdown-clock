import { convertDataURIToBinary } from "./utilities";

type StatusCallback = (statusMessage: string) => void;

// const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = FFmpeg.createFFmpeg({ log: true });

const frames: string[] = [];
const getFrameFileName = (frameNumber: number) => {
  const frameIndex = `000${frameNumber}`.slice(-4);
  return `tmp.${frameIndex}.png`;
};

const init = async (statusCallback: StatusCallback): Promise<void> => {
  statusCallback("Loading ffmpeg-core.js");
  await ffmpeg.load();
  statusCallback("Loaded ffmpeg");
};

const addFrame = (canvasElem: HTMLCanvasElement, statusCallback: StatusCallback): void => {
  const frameCount = frames.length;
  if (frameCount > 9999) {
    // We have to support enough frames to have at least one per pixel on the circumference of the circle
    throw new Error("Too many frames. Only 10,000 frames supported.");
  }
  const frameFileName = getFrameFileName(frameCount);
  const image = canvasElem.toDataURL("image/png");
  const myUint8Array = convertDataURIToBinary(image);
  ffmpeg.FS("writeFile", frameFileName, myUint8Array);
  frames.push(frameFileName);
  statusCallback("Frame " + frameFileName + " added...");
};

const addAudio = async (filePath: string): Promise<void> => {
  ffmpeg.FS("writeFile", "audio.ogg", await FFmpeg.fetchFile(filePath));
};

const transcode = async (
  durationSeconds: number,
  hasAudio: boolean,
  statusCallback: StatusCallback
): Promise<Uint8Array> => {
  statusCallback("Start transcoding");

  // We have to switch here if we don't have audio; it will be a different command in that case
  const cliArgs: string[] = [
    "-framerate",
    (frames.length / durationSeconds).toString(10),
    "-pattern_type",
    "glob",
    "-i",
    "*.png",
  ];

  if (hasAudio) {
    cliArgs.push(...["-i", "audio.ogg"]);
  }

  cliArgs.push(
    ...["-c:a", "copy", "-shortest", "-c:v", "libx264", "-pix_fmt", "yuv420p", "out.mp4"]
  );

  await ffmpeg.run(...cliArgs);
  statusCallback("ffmpeg run done");
  const data = ffmpeg.FS("readFile", "out.mp4");
  ffmpeg.FS("unlink", "out.mp4");

  return data;
};

const clearData = () => {
  // ffmpeg.FS("unlink", "audio.ogg");

  frames.forEach((frameFileName) => {
    ffmpeg.FS("unlink", frameFileName);
  });
  // Clear the list of framess
  frames.splice(0, frames.length);
};

export { init, addFrame, addAudio, transcode };
