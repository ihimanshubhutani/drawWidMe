const video = document.getElementById("myvideo");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let trackButton = document.getElementById("trackbutton");
let updateNote = document.getElementById("updatenote");
const canvas2 = document.getElementById("canvas2");
const ctx = canvas2.getContext("2d");

canvas2.width = window.innerWidth;
canvas2.height = window.innerHeight;

ctx.fillStyle = 'red';
ctx.fillRect(0, 0, canvas2.width, canvas2.height);

ctx.beginPath();
ctx.moveTo(0, 0);
ctx.lineTo(70, 380);
ctx.stroke();


let isVideo = false;
let model = null;

const modelParams = {
    flipHorizontal: true,   // flip e.g for video
    maxNumBoxes: 1,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.6,    // confidence threshold for predictions.
}


function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            updateNote.innerText = "Video started. Now tracking"
            isVideo = true
            runDetection()
        } else {
            updateNote.innerText = "Please enable video"
        }
    });
}

function toggleVideo() {
    if (!isVideo) {
        updateNote.innerText = "Starting video"
        startVideo();
    } else {
        updateNote.innerText = "Stopping video"
        handTrack.stopVideo(video)
        isVideo = false;
        updateNote.innerText = "Video stopped"
    }
}


var flag = false;
var x, y;

function runDetection() {
    model.detect(video).then(predictions => {
        console.log("Predictions: ", predictions);

        model.renderPredictions(predictions, canvas, context, video);

        if (isVideo) {

            if (!flag) {
                if (predictions[0]) {
                    ctx.beginPath();
                    x = predictions[0].bbox[0] + predictions[0].bbox[2] / 2;
                    y = predictions[0].bbox[1] + predictions[0].bbox[3] / 2;
                    ctx.moveTo(x - canvas2.offsetLeft, y - canvas2.offsetTop);
                    flag = true;
                }
            }
            if (flag) {

                if (!predictions[0]) {

                    flag = false;
                    ctx.closePath();
                }

                else {
                    x = predictions[0].bbox[0] + predictions[0].bbox[2] / 2;
                    y = predictions[0].bbox[1] + predictions[0].bbox[3] / 2;
                    ctx.lineTo(x - canvas.offsetLeft, y - canvas.offsetTop);
                    ctx.stroke();
                }
            }


            requestAnimationFrame(runDetection);
        }
    });
}

// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    updateNote.innerText = "Loaded Model!"
    trackButton.disabled = false
});
