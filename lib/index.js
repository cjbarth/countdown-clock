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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12;
    const options = {
        hResolution: parseInt((_b = (_a = document.getElementById("height")) === null || _a === void 0 ? void 0 : _a.nodeValue) !== null && _b !== void 0 ? _b : "1920", 10),
        vResolution: parseInt((_d = (_c = document.getElementById("width")) === null || _c === void 0 ? void 0 : _c.nodeValue) !== null && _d !== void 0 ? _d : "1080", 10),
        hMidpoint: 960,
        vMidpoint: 540,
        clockRadius: parseInt((_f = (_e = document.getElementById("clockRadius")) === null || _e === void 0 ? void 0 : _e.nodeValue) !== null && _f !== void 0 ? _f : "432", 10),
        lineWidth: parseInt((_h = (_g = document.getElementById("lineWidth")) === null || _g === void 0 ? void 0 : _g.nodeValue) !== null && _h !== void 0 ? _h : "10", 10),
        locale: (_k = (_j = document.getElementById("lineWidth")) === null || _j === void 0 ? void 0 : _j.nodeValue) !== null && _k !== void 0 ? _k : "en-US",
        handLength: (_l = parseInt($('#handLength').val() + '', 10)) !== null && _l !== void 0 ? _l : 200,
        handTailLength: (_m = parseInt($('#handTailLength').val() + '', 10)) !== null && _m !== void 0 ? _m : 15,
        tickCount: parseInt((_p = (_o = document.getElementById("tickCount")) === null || _o === void 0 ? void 0 : _o.nodeValue) !== null && _p !== void 0 ? _p : "5", 10),
        tickLength: parseInt((_r = (_q = document.getElementById("tickLength")) === null || _q === void 0 ? void 0 : _q.nodeValue) !== null && _r !== void 0 ? _r : "30", 10),
        tickWidth: parseInt((_t = (_s = document.getElementById("tickWidth")) === null || _s === void 0 ? void 0 : _s.nodeValue) !== null && _t !== void 0 ? _t : "10", 10),
        tickLabels: (_w = (_v = (_u = document.getElementById("tickLabels")) === null || _u === void 0 ? void 0 : _u.nodeValue) === null || _v === void 0 ? void 0 : _v.split(";").map(String.prototype.trim)) !== null && _w !== void 0 ? _w : [],
        tickLabelCssFont: (_y = (_x = document.getElementById("tickLabelCssFont")) === null || _x === void 0 ? void 0 : _x.nodeValue) !== null && _y !== void 0 ? _y : "italic 40px Calibri",
        tickLabelColor: (_0 = (_z = document.getElementById("tickLabelColor")) === null || _z === void 0 ? void 0 : _z.nodeValue) !== null && _0 !== void 0 ? _0 : "purple",
        tickLabelRadius: parseInt((_2 = (_1 = document.getElementById("handLength")) === null || _1 === void 0 ? void 0 : _1.nodeValue) !== null && _2 !== void 0 ? _2 : "335", 10),
        arcFillColor: (_3 = $("#arcFillColor").val() + "") !== null && _3 !== void 0 ? _3 : "#000000",
        arcFillTransparency: ('00' + parseInt($("#arcFillTransparency").val() + "", 10).toString(16)).slice(-2),
        arcOutlineColor: (_4 = $("#arcOutlineColor").val() + "") !== null && _4 !== void 0 ? _4 : "#000000",
        arcOutlineTransparency: ('00' + parseInt($("#arcOutlineTransparency").val() + "", 10).toString(16)).slice(-2),
        labelCssFont: (_6 = (_5 = document.getElementById("labelCssFont")) === null || _5 === void 0 ? void 0 : _5.nodeValue) !== null && _6 !== void 0 ? _6 : "40px Calibri",
        color: (_8 = (_7 = document.getElementById("color")) === null || _7 === void 0 ? void 0 : _7.nodeValue) !== null && _8 !== void 0 ? _8 : "black",
        backgroundColor: (_10 = (_9 = document.getElementById("backgroundColor")) === null || _9 === void 0 ? void 0 : _9.nodeValue) !== null && _10 !== void 0 ? _10 : "pink",
        countdownSeconds: parseInt((_12 = (_11 = document.getElementById("tickWidth")) === null || _11 === void 0 ? void 0 : _11.nodeValue) !== null && _12 !== void 0 ? _12 : "300", 10),
    };
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
    for (let frame = 0; frame < myClock.frameCount; frame++) {
        previewFrames.push(window.setTimeout(function () {
            myClock.renderFrame(frame);
        }, 100 * frame));
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
        for (let frame = 0; frame < myClock.frameCount; frame++) {
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