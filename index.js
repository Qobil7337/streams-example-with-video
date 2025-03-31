const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.get('/video', (req, res) => {
    const videoPath = path.join(__dirname, 'video.mp4');
    const videoStat = fs.statSync(videoPath);
    const fileSize = videoStat.size;
    const range = req.headers.range;

    if (range) {
        // Parse the range header
        const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
        const start = parseInt(startStr, 10);
        const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        console.log(`Streaming range: ${start}-${end} (${chunkSize} bytes)`);

        const fileStream = fs.createReadStream(videoPath, { start, end });

        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": "video/mp4",
        });

        // Log each chunk being sent
        fileStream.on("data", (chunk) => {
            console.log(`Sending chunk: ${chunk.length} bytes`);
            res.write(chunk);
        });

        fileStream.on("end", () => {
            console.log("Finished streaming video.");
            res.end();
        });

    } else {
        console.log("Sending full video file.");

        res.writeHead(200, {
            "Content-Length": fileSize,
            "Content-Type": "video/mp4",
        });

        const fileStream = fs.createReadStream(videoPath);

        // Log each chunk being sent
        fileStream.on("data", (chunk) => {
            console.log(`Sending chunk: ${chunk.length} bytes`);
            res.write(chunk);
        });

        fileStream.on("end", () => {
            console.log("Finished sending full video.");
            res.end();
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
