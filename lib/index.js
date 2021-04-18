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
const previewFrames = [];
getPreviewButton().addEventListener("click", () => {
    const myClock = new clock.Clock(getCanvasContext(), getOptions());
    sizeCanvas(getOptions());
    previewFrames.forEach(clearTimeout);
    for (let frame = 0; frame <= myClock.frameCount; frame++) {
        previewFrames.push(window.setTimeout(function () {
            myClock.renderFrame(frame);
        }, (myClock.secondsPerFrame / 10) * frame));
    }
});
getDownloadButton().addEventListener("click", () => {
    const myClock = new clock.Clock(getCanvasContext(), getOptions());
    sizeCanvas(getOptions());
    const transcoder = new Transcoder();
    transcoder
        .init((status) => {
        console.log(status);
    })
        .then((transcoder) => {
        for (let frame = 0; frame <= myClock.frameCount; frame++) {
            myClock.renderFrame(frame);
            // Save off the image for mp4
            transcoder.addFrame(getCanvas(), (status) => {
                console.log(status);
            });
        }
        return transcoder;
    })
        .then((transcoder) => {
        return transcoder.transcode(myClock.options.countdownSeconds, false, (status) => {
            console.log(status);
        });
    })
        .then((video) => {
        const blob = new Blob([video.buffer], { type: "video/mp4" });
        saveAs(blob, "countdown.mp4");
    })
        .catch((err) => {
        console.error(err);
    });
});
//# sourceMappingURL=index.js.map