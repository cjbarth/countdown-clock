import { FFmpeg as IFFmpeg, ProgressCallback } from "../types/ffmpeg__ffmpeg/index";
import { convertDataURIToBinary } from "./utilities";

type StatusCallback = (statusMessage: string) => void;

export class Transcoder {
  public ffmpeg: IFFmpeg;
  private frames: string[] = [];

  public constructor(progress?: ProgressCallback) {
    const options:FFmpeg.CreateFFmpegOptions = {
      log: true
    };

    if (progress) {
      options.progress = progress;
    }
    this.ffmpeg = FFmpeg.createFFmpeg(options);
  }

  public getFrameFileName(frameNumber: number): string {
    const frameIndex = `000${frameNumber}`.slice(-4);
    return `tmp.${frameIndex}.png`;
  }

  public async init(statusCallback: StatusCallback): Promise<this> {
    statusCallback("Loading ffmpeg-core.js");
    await this.ffmpeg.load();
    statusCallback("Loaded ffmpeg");

    return this;
  }

  public addFrame(canvasElem: HTMLCanvasElement, statusCallback: StatusCallback): Promise<this> {
    const myPromise: Promise<this> = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(this);
      });
    });

    myPromise.then(() => {
      const frameCount = this.frames.length;
      if (frameCount > 9999) {
        // We have to support enough frames to have at least one per pixel on the circumference of the circle
        throw new Error("Too many frames. Only 10,000 frames supported.");
      }
      const frameFileName = this.getFrameFileName(frameCount);
      const image = canvasElem.toDataURL("image/png");
      const myUint8Array = convertDataURIToBinary(image);
      this.ffmpeg.FS("writeFile", frameFileName, myUint8Array);
      this.frames.push(frameFileName);
      statusCallback("Frame " + frameFileName + " added...");

      return this;
    });

    return myPromise
  }

  public async addAudio(filePath: string): Promise<this> {
    this.ffmpeg.FS("writeFile", "audio.ogg", await FFmpeg.fetchFile(filePath));

    return this;
  }

  public async transcode(
    durationSeconds: number,
    hasAudio: boolean,
    statusCallback: StatusCallback
  ): Promise<Uint8Array> {
    statusCallback("Start transcoding");

    // We have to switch here if we don't have audio; it will be a different command in that case
    const cliArgs: string[] = [
      "-framerate",
      (this.frames.length / durationSeconds).toString(10),
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

    await this.ffmpeg.run(...cliArgs);
    statusCallback("ffmpeg run done");
    const data = this.ffmpeg.FS("readFile", "out.mp4");
    this.ffmpeg.FS("unlink", "out.mp4");

    return data;
  }

  public clearData(): void {
    // ffmpeg.FS("unlink", "audio.ogg");

    this.frames.forEach((frameFileName) => {
      this.ffmpeg.FS("unlink", frameFileName);
    });
    // Clear the list of framess
    this.frames.splice(0, this.frames.length);
  }
}
