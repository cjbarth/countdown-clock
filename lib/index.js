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
const getOptions = () => {
    const options = {
        hResolution: 1920,
        vResolution: 1080,
        clockRadius: 432,
        lineWidth: 10,
        locale: "en-US",
    };
    options.hMidpoint = options.hResolution / 2;
    options.vMidpoing = options.vResolution / 2;
    return options;
};
const sizeCanvas = (options) => {
    const canvas = getCanvas();
    canvas.height = options.vResolution;
    canvas.width = options.hResolution;
};
const drawClockFrame = (options) => {
    const ctx = getCanvasContext();
    ctx.beginPath();
    ctx.arc(options.hMidpoint, options.vMidpoing, options.clockRadius, 0, Math.TAU, true);
    ctx.clip();
    ctx.lineWidth = options.lineWidth;
    ctx.stroke();
    ctx.closePath();
};
const getTime = (seconds, options) => {
    const hours = Math.trunc(seconds / 3600);
    seconds = seconds % 3600;
    const minutes = Math.trunc(seconds / 60);
    seconds = seconds % 60;
    const date = new Date(Date.UTC(0, 0, 0, hours, minutes, seconds, 0));
    const timeOptions = {
        hour: "number",
        minute: "number",
        second: "number",
        timeZone: "UTC",
        hour12: false,
    };
    const time = new Intl.DateTimeFormat(options.locale, timeOptions).format(date);
    return time;
};
const t = getTime(12345, getOptions());
console.log(t);
export {};
//# sourceMappingURL=index.js.map