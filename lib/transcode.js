var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { convertDataURIToBinary } from "./utilities";
export class Transcoder {
    constructor() {
        this.frames = [];
        this.ffmpeg = FFmpeg.createFFmpeg({ log: true });
    }
    getFrameFileName(frameNumber) {
        const frameIndex = `000${frameNumber}`.slice(-4);
        return `tmp.${frameIndex}.png`;
    }
    init(statusCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            statusCallback("Loading ffmpeg-core.js");
            yield this.ffmpeg.load();
            statusCallback("Loaded ffmpeg");
            return this;
        });
    }
    addFrame(canvasElem, statusCallback) {
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
    }
    addAudio(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ffmpeg.FS("writeFile", "audio.ogg", yield FFmpeg.fetchFile(filePath));
            return this;
        });
    }
    transcode(durationSeconds, hasAudio, statusCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            statusCallback("Start transcoding");
            // We have to switch here if we don't have audio; it will be a different command in that case
            const cliArgs = [
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
            cliArgs.push(...["-c:a", "copy", "-shortest", "-c:v", "libx264", "-pix_fmt", "yuv420p", "out.mp4"]);
            yield this.ffmpeg.run(...cliArgs);
            statusCallback("ffmpeg run done");
            const data = this.ffmpeg.FS("readFile", "out.mp4");
            this.ffmpeg.FS("unlink", "out.mp4");
            return data;
        });
    }
    clearData() {
        // ffmpeg.FS("unlink", "audio.ogg");
        this.frames.forEach((frameFileName) => {
            this.ffmpeg.FS("unlink", frameFileName);
        });
        // Clear the list of framess
        this.frames.splice(0, this.frames.length);
    }
}
//# sourceMappingURL=transcode.js.map