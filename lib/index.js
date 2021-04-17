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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
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
        tickCount: parseInt((_b = (_a = document.getElementById("tickCount")) === null || _a === void 0 ? void 0 : _a.nodeValue) !== null && _b !== void 0 ? _b : "5", 10),
        tickLength: parseInt((_d = (_c = document.getElementById("tickLength")) === null || _c === void 0 ? void 0 : _c.nodeValue) !== null && _d !== void 0 ? _d : "30", 10),
        tickWidth: parseInt((_f = (_e = document.getElementById("tickWidth")) === null || _e === void 0 ? void 0 : _e.nodeValue) !== null && _f !== void 0 ? _f : "10", 10),
        tickLabels: (_j = (_h = (_g = document.getElementById("tickLabels")) === null || _g === void 0 ? void 0 : _g.nodeValue) === null || _h === void 0 ? void 0 : _h.split(";").map(String.prototype.trim)) !== null && _j !== void 0 ? _j : [],
        tickLabelCssFont: (_l = (_k = document.getElementById("tickLabelCssFont")) === null || _k === void 0 ? void 0 : _k.nodeValue) !== null && _l !== void 0 ? _l : "italic 40px Calibri",
        tickLabelColor: (_o = (_m = document.getElementById("tickLabelColor")) === null || _m === void 0 ? void 0 : _m.nodeValue) !== null && _o !== void 0 ? _o : "purple",
        tickLabelRadius: parseInt((_q = (_p = document.getElementById("handLength")) === null || _p === void 0 ? void 0 : _p.nodeValue) !== null && _q !== void 0 ? _q : "335", 10),
        arcFillColor: (_r = $("#arcFillColor").val() + "") !== null && _r !== void 0 ? _r : "#000000",
        arcFillTransparency: ("00" + parseInt($("#arcFillTransparency").val() + "", 10).toString(16)).slice(-2),
        arcOutlineColor: (_s = $("#arcOutlineColor").val() + "") !== null && _s !== void 0 ? _s : "#000000",
        arcOutlineTransparency: ("00" + parseInt($("#arcOutlineTransparency").val() + "", 10).toString(16)).slice(-2),
        timeCssFont: (_u = (_t = document.getElementById("timeCssFont")) === null || _t === void 0 ? void 0 : _t.nodeValue) !== null && _u !== void 0 ? _u : "40px Calibri",
        timeColor: (_v = $("#timeColor").val() + '') !== null && _v !== void 0 ? _v : "#000000",
        timeColorTransparency: ("00" + parseInt($("#timeColorTransparency").val() + "", 10).toString(16)).slice(-2),
        color: (_x = (_w = document.getElementById("color")) === null || _w === void 0 ? void 0 : _w.nodeValue) !== null && _x !== void 0 ? _x : "black",
        backgroundColor: (_y = $("#backgroundColor").val() + '') !== null && _y !== void 0 ? _y : "#000000",
        backgroundColorTransparency: ("00" + parseInt($("#backgroundColorTransparency").val() + "", 10).toString(16)).slice(-2),
        countdownSeconds: parseInt((_0 = (_z = document.getElementById("tickWidth")) === null || _z === void 0 ? void 0 : _z.nodeValue) !== null && _0 !== void 0 ? _0 : "300", 10),
    };
    options.hMidpoint = options.hMidpoint || options.hResolution / 2;
    options.vMidpoint = options.vMidpoint || options.vResolution / 2;
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
        }, myClock.secondsPerFrame / 10 * frame));
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