const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

const image2video = async () => {
  const message = document.getElementById("message");
  message.innerHTML = "Loading ffmpeg-core.js";
  await ffmpeg.load();
  message.innerHTML = "Loading data";
  ffmpeg.FS(
    "writeFile",
    "audio.ogg",
    await fetchFile("../assets/triangle/audio.ogg")
  );
  for (let i = 0; i < 60; i += 1) {
    const num = `00${i}`.slice(-3);
    // This should write a Uint8Array
    let canvas = document.getElementById("mycanvas");
    let image = canvas.toDataURL("image/png");
    let myUint8Array = convertDataURIToBinary(image);
    // ffmpeg.FS('writeFile', 'tmp.${num}.png', myUint8Array);
    ffmpeg.FS(
      "writeFile",
      `tmp.${num}.png`,
      await fetchFile(`../assets/triangle/tmp.${num}.png`)
    );
  }
  message.innerHTML = "Start transcoding";
  await ffmpeg.run(
    "-framerate",
    "1",
    "-pattern_type",
    "glob",
    "-i",
    "*.png",
    "-i",
    "audio.ogg",
    "-c:a",
    "copy",
    "-shortest",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "out.mp4"
  );
  const data = ffmpeg.FS("readFile", "out.mp4");
  ffmpeg.FS("unlink", "audio.ogg");
  for (let i = 0; i < 60; i += 1) {
    const num = `00${i}`.slice(-3);
    ffmpeg.FS("unlink", `tmp.${num}.png`);
  }

  const video = document.getElementById("output-video");
  video.src = URL.createObjectURL(
    new Blob([data.buffer], { type: "video/mp4" })
  );
};
const elm = document.getElementById("start-btn");
elm.addEventListener("click", image2video);
