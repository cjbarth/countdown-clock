var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as clock from "./clock";
import { Transcoder } from "./transcode";
import { saveAs } from "file-saver";
// import * as bootstrap from "bootstrap";
Math.TAU = Math.PI * 2;
const getCanvas = () => {
    return document.getElementById("canvas");
};
const getCanvasContext = () => {
    const ctx = getCanvas().getContext("2d");
    if (ctx) {
        return ctx;
    }
    else {
        throw new Error("Can't generate canvas context.");
    }
};
const getDownloadButton = () => {
    return document.getElementById("download");
};
const getPreviewButton = () => {
    return document.getElementById("preview");
};
const getOptions = () => {
    var _a, _b, _c, _d, _e, _f;
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
        tickLabels: (_b = (_a = $("tickLabels").val()) === null || _a === void 0 ? void 0 : _a.toString().split(";").map(String.prototype.trim)) !== null && _b !== void 0 ? _b : [],
        tickLabelCssFont: $("#tickLabelCssFont").val() + "",
        tickLabelColor: $("#tickLabelColor").val() + "",
        tickLabelRadius: parseInt($("#tickLabelRadius").val() + "", 10),
        arcFillColor: (_c = $("#arcFillColor").val() + "") !== null && _c !== void 0 ? _c : "#000000",
        arcFillOpacity: ("00" + parseInt($("#arcFillOpacity").val() + "", 10).toString(16)).slice(-2),
        arcOutlineColor: (_d = $("#arcOutlineColor").val() + "") !== null && _d !== void 0 ? _d : "#000000",
        arcOutlineOpacity: ("00" + parseInt($("#arcOutlineOpacity").val() + "", 10).toString(16)).slice(-2),
        timeCssFont: $("#timeCssFont").val() + "",
        timeColor: (_e = $("#timeColor").val() + "") !== null && _e !== void 0 ? _e : "#000000",
        timeColorOpacity: ("00" + parseInt($("#timeColorOpacity").val() + "", 10).toString(16)).slice(-2),
        timeHPosition: parseInt($("#timeHPosition").val() + "", 10),
        timeVPosition: parseInt($("#timeVPosition").val() + "", 10),
        color: $("#color").val() + "",
        opacity: ("00" + parseInt($("#opacity").val() + "", 10).toString(16)).slice(-2),
        backgroundColor: (_f = $("#backgroundColor").val() + "") !== null && _f !== void 0 ? _f : "#000000",
        backgroundColorOpacity: ("00" + parseInt($("#backgroundColorOpacity").val() + "", 10).toString(16)).slice(-2),
        countdownSeconds: parseInt($("#countdownSeconds").val() + "", 10),
    };
    options.hPosition = options.hPosition || options.hResolution / 2;
    options.vPosition = options.vPosition || options.vResolution / 2;
    options.timeHPosition = options.timeHPosition || options.hPosition;
    options.timeVPosition = options.timeVPosition || options.vPosition;
    console.log(options);
    return options;
};
const sizeCanvas = (options) => {
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
let previewFrames = [];
getPreviewButton().addEventListener("click", () => {
    const myClock = new clock.Clock(getCanvasContext(), getOptions());
    sizeCanvas(getOptions());
    previewFrames.forEach(clearTimeout);
    previewFrames = [];
    for (let frame = 0; frame <= myClock.frameCount; frame++) {
        previewFrames.push(window.setTimeout(function () {
            myClock.renderFrame(frame);
        }, (myClock.secondsPerFrame / 10) * frame * 1000));
    }
});
getDownloadButton().addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
    const myClock = new clock.Clock(getCanvasContext(), getOptions());
    sizeCanvas(getOptions());
    const progressBarPrepare = $("#progressBarPrepare");
    const progressBarCompress = $("#progressBarCompress");
    const transcoder = new Transcoder((status) => {
        const progressPercentage = (status.ratio * 100) / 2; // This is only half the process
        progressBarCompress
            .attr("aria-valuenow", progressPercentage)
            .css("width", progressPercentage + "%");
    });
    yield transcoder.init((status) => {
        console.log(status);
    });
    for (let frame = 0; frame <= myClock.frameCount; frame++) {
        myClock.renderFrame(frame);
        // Save off the image for mp4
        yield transcoder.addFrame(getCanvas(), (status) => {
            console.log(status);
        });
        const progressPercentage = ((frame / myClock.frameCount) * 100) / 2; // This is only half the process
        progressBarPrepare
            .attr("aria-valuenow", progressPercentage)
            .css("width", progressPercentage + "%");
    }
    const video = yield transcoder.transcode(myClock.options.countdownSeconds, false, (status) => {
        console.log(status);
    });
    const blob = new Blob([video.buffer], { type: "video/mp4" });
    saveAs(blob, "countdown.mp4");
}));
//# sourceMappingURL=index.js.map