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
// const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = FFmpeg.createFFmpeg({ log: true });
const frames = [];
const getFrameFileName = (frameNumber) => {
    const frameIndex = `000${frameNumber}`.slice(-4);
    return `tmp.${frameIndex}.png`;
};
const init = (statusCallback) => __awaiter(void 0, void 0, void 0, function* () {
    statusCallback("Loading ffmpeg-core.js");
    yield ffmpeg.load();
    statusCallback("Loaded ffmpeg");
});
const addFrame = (canvasElem, statusCallback) => {
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
const addAudio = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    ffmpeg.FS("writeFile", "audio.ogg", yield FFmpeg.fetchFile(filePath));
});
const transcode = (durationSeconds, hasAudio, statusCallback) => __awaiter(void 0, void 0, void 0, function* () {
    statusCallback("Start transcoding");
    // We have to switch here if we don't have audio; it will be a different command in that case
    const cliArgs = [
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
    cliArgs.push(...["-c:a", "copy", "-shortest", "-c:v", "libx264", "-pix_fmt", "yuv420p", "out.mp4"]);
    yield ffmpeg.run(...cliArgs);
    statusCallback("ffmpeg run done");
    const data = ffmpeg.FS("readFile", "out.mp4");
    ffmpeg.FS("unlink", "out.mp4");
    return data;
});
const clearData = () => {
    // ffmpeg.FS("unlink", "audio.ogg");
    frames.forEach((frameFileName) => {
        ffmpeg.FS("unlink", frameFileName);
    });
    // Clear the list of framess
    frames.splice(0, frames.length);
};
export { init, addFrame, addAudio, transcode };
//# sourceMappingURL=transcode.js.map