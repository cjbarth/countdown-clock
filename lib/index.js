import * as clock from "./clock";
import * as transcode from "./transcode";
import { saveAs } from "file-saver";
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
const getOptions = () => {
    var _a, _b, _c, _d, _e, _f;
    const options = {
        hResolution: parseInt((_b = (_a = document.getElementById("height")) === null || _a === void 0 ? void 0 : _a.nodeValue) !== null && _b !== void 0 ? _b : "1920", 10),
        vResolution: parseInt((_d = (_c = document.getElementById("width")) === null || _c === void 0 ? void 0 : _c.nodeValue) !== null && _d !== void 0 ? _d : "1080", 10),
        clockRadius: 432,
        lineWidth: 10,
        locale: "en-US",
        handLength: parseInt((_f = (_e = document.getElementById("handLength")) === null || _e === void 0 ? void 0 : _e.nodeValue) !== null && _f !== void 0 ? _f : "200", 10),
        tickCount: 5,
        tickHeight: 30,
        tickWidth: 10,
        tickLabels: ["a", "IV", "V", "z", "zz"],
        tickLabelCssFont: "italic 40px Calibri",
        tickLabelColor: "purple",
        tickLabelRadius: 335,
        labelCssFont: "40px Calibri",
        color: "black",
        backgroundColor: "pink",
        countdownSeconds: 60 * 5,
    };
    return options;
};
const sizeCanvas = (options) => {
    const canvas = getCanvas();
    canvas.height = options.vResolution;
    canvas.width = options.hResolution;
};
const myClock = new clock.Clock(getCanvasContext(), getOptions());
sizeCanvas(getOptions());
$('[control="bootstrap-colorpicker"]').colorpicker();
getDownloadButton().addEventListener("click", () => {
    transcode
        .init((status) => {
        console.log(status);
        console.log(myClock.options.radiansPerSecond);
    })
        .then(() => {
        // Need to figure out how to correlate seconds with frames so we can draw the correct number of frames
        // Either one per second, or one per pixel on the circumfrunce
        for (let frame = 0; frame < myClock.frameCount; frame++) {
            setTimeout(function () {
                myClock.renderFrame(frame);
                // Save off the image for mp4
                transcode.addFrame(getCanvas(), (status) => {
                    console.log(status);
                });
            }, 10 * frame);
        }
    });
    transcode
        .transcode(myClock.options.countdownSeconds, false, (status) => {
        console.log(status);
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