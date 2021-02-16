import * as clock from "./clock";
import * as transcode from "./transcode";
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
    const options = {
        hResolution: 1920,
        vResolution: 1080,
        clockRadius: 432,
        lineWidth: 10,
        locale: "en-US",
        handLength: 200,
        tickCount: 5,
        tickHeight: 30,
        tickWidth: 10,
        tickLabels: ["a", "IV", "V", "z", "zz"],
        tickLabelCssFont: "italic 40px Calibri",
        tickLabelColor: "purple",
        tickLabelRadius: 335,
        labelCssFont: "40px Calibri",
        color: "black",
    };
    return options;
};
const sizeCanvas = (options) => {
    const canvas = getCanvas();
    canvas.height = options.vResolution;
    canvas.width = options.hResolution;
};
const getTime = (seconds, options) => {
    const hours = Math.trunc(seconds / 3600);
    seconds = seconds % 3600;
    const minutes = Math.trunc(seconds / 60);
    seconds = seconds % 60;
    const date = new Date(Date.UTC(0, 0, 0, hours, minutes, seconds, 0));
    const timeOptions = {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZone: "UTC",
        hour12: true,
    };
    const timeParts = new Intl.DateTimeFormat(options.locale, timeOptions).formatToParts(date);
    return timeParts
        .map((value) => {
        // Leave off the dayPeriod so we can get a raw time without extra 0s
        return value.type === "dayPeriod" ? "" : value.value;
    })
        .join("")
        .trim();
};
sizeCanvas(getOptions());
const myClock = new clock.Clock(getCanvasContext(), getOptions());
transcode
    .init((status) => {
    console.log(status);
})
    .then(() => {
    for (let i = 0; i < 120; i++) {
        setTimeout(function () {
            const t = getTime(12345 + i, getOptions());
            myClock.clear();
            myClock.drawFrame();
            myClock.drawHand(1, 15);
            myClock.drawTicks();
            myClock.drawNumbers();
            myClock.drawColorWedge(1.5, "blue", "red");
            myClock.drawCenterText(t, "orange");
            // Save off the image for mp4
            transcode.addFrame(getCanvas(), (status) => {
                console.log(status);
            });
        }, 10 * i);
    }
});
getDownloadButton().addEventListener("click", () => {
    transcode.downloadVideo((status) => {
        console.log(status);
    })
        .catch((err) => {
        console.error(err);
    });
});
//# sourceMappingURL=index.js.map